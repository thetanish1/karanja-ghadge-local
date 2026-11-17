import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ShopModel, ShopMembershipModel, UserModel } from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles, requireShopAccess } from '../../middleware/rbac.js';
import { logAudit } from '../../middleware/audit.js';
import { emailAdapter } from '../../adapters/email/mock-email.adapter.js';

const router = Router();

const shopApplicationSchema = z.object({
  name: z.string().min(2, 'Shop name is required'),
  ownerName: z.string().optional().default(''),
  email: z.string().email('Valid email address is required').optional().or(z.literal('')),
  description: z.string().optional().default(''),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  address: z.string().min(5, 'Detailed address is required'),
  coordinates: z.tuple([z.number(), z.number()]).optional().default([78.5484, 21.1714]), // [lng, lat]
  fulfilmentOptions: z.array(z.enum(['delivery', 'pickup'])).default(['delivery', 'pickup']),
  openTime: z.string().default('08:00'),
  closeTime: z.string().default('21:00'),
  photos: z.array(z.string()).optional().default([]),
  category: z.string().optional().default('Grocery & Kirana'),
});

// Shopkeeper application (Can be called with or without auth token)
router.post('/apply', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = shopApplicationSchema.parse(req.body);
    
    // Determine userId: either from auth token or find/create user by phone
    let userId: string;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_ACCESS_SECRET || 'pilot-access-secret-32-chars-long!';
        const decoded = jwt.default.verify(token, secret) as any;
        userId = decoded.id;
      } catch (e) {
        // Fallback to phone lookup
        let existingUser = await UserModel.findOne({ phone: input.phone });
        if (!existingUser) {
          existingUser = await UserModel.create({
            phone: input.phone,
            name: input.ownerName || input.name,
            roles: ['shopkeeper', 'customer'],
          });
        }
        userId = existingUser._id.toString();
      }
    } else {
      let existingUser = await UserModel.findOne({ phone: input.phone });
      if (!existingUser) {
        existingUser = await UserModel.create({
          phone: input.phone,
          name: input.ownerName || input.name,
          roles: ['shopkeeper', 'customer'],
        });
      }
      userId = existingUser._id.toString();
    }

    // Create shop in 'pending' status
    const shop = await ShopModel.create({
      name: input.name,
      ownerId: new mongoose.Types.ObjectId(userId),
      ownerName: input.ownerName,
      email: input.email || '',
      description: input.description,
      phone: input.phone,
      address: input.address,
      geo: {
        type: 'Point',
        coordinates: input.coordinates,
      },
      hours: {
        open: input.openTime,
        close: input.closeTime,
        daysOpen: [0, 1, 2, 3, 4, 5, 6],
      },
      fulfilmentOptions: input.fulfilmentOptions,
      status: 'pending', // Requires admin approval
      isPaused: false,
      photos: input.photos,
    });

    // Create ShopMembership
    await ShopMembershipModel.create({
      shopId: shop._id,
      userId: new mongoose.Types.ObjectId(userId),
      role: 'owner',
    });

    // Ensure user has 'shopkeeper' role
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { roles: 'shopkeeper' },
    });

    // Honest Email Dispatch to merchant's email address
    let emailResult = null;
    if (input.email) {
      emailResult = await emailAdapter.sendEmail({
        to: input.email,
        subject: `[AapnaCart] Shop Application Received: ${input.name}`,
        template: 'shop_verification_received',
        data: {
          shopName: input.name,
          ownerName: input.ownerName || 'Shopkeeper',
          phone: input.phone,
          email: input.email,
          address: input.address,
          openTime: input.openTime,
          closeTime: input.closeTime,
        },
      });
    }

    await logAudit({
      actorId: userId,
      actorRole: 'shopkeeper',
      action: 'SHOP_APPLICATION_SUBMITTED',
      target: 'Shop',
      targetId: shop._id.toString(),
      after: { name: shop.name, status: shop.status, email: input.email },
    });

    res.status(201).json({
      success: true,
      message: 'Shop application submitted successfully. Now in verification stage.',
      shop: {
        id: shop._id.toString(),
        name: shop.name,
        ownerName: input.ownerName,
        email: input.email,
        phone: shop.phone,
        status: shop.status,
        address: shop.address,
        openTime: input.openTime,
        closeTime: input.closeTime,
        photos: input.photos,
      },
      emailNotification: emailResult ? {
        sent: true,
        to: input.email,
        messageId: emailResult.providerMessageId,
      } : null,
    });
  } catch (err) {
    next(err);
  }
});

// Check application status by shop id
router.get('/application-status/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await ShopModel.findById(req.params.id);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop application not found' });
      return;
    }

    res.json({
      success: true,
      shop: {
        id: shop._id.toString(),
        name: shop.name,
        ownerName: shop.ownerName,
        email: shop.email,
        phone: shop.phone,
        status: shop.status,
        address: shop.address,
        hours: shop.hours,
        photos: shop.photos,
        createdAt: shop.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Public: Browse approved shops
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search } = req.query;

    const query: any = { status: 'approved' };

    if (search && typeof search === 'string') {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && typeof category === 'string') {
      query.categoryIds = category;
    }

    const shops = await ShopModel.find(query).sort({ isPaused: 1, name: 1 });

    res.json({
      success: true,
      count: shops.length,
      shops: shops.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        phone: s.phone,
        address: s.address,
        geo: s.geo,
        hours: s.hours,
        fulfilmentOptions: s.fulfilmentOptions,
        status: s.status,
        isPaused: s.isPaused,
        minOrderPaise: s.minOrderPaise,
        bannerUrl: s.bannerUrl,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: My shops
router.get('/my-shops', authenticate, requireRoles('shopkeeper', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const memberships = await ShopMembershipModel.find({ userId: req.user!.id });
    const shopIds = memberships.map((m) => m.shopId);

    const shops = await ShopModel.find({
      $or: [{ _id: { $in: shopIds } }, { ownerId: req.user!.id }],
    });

    res.json({
      success: true,
      shops: shops.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        phone: s.phone,
        address: s.address,
        hours: s.hours,
        fulfilmentOptions: s.fulfilmentOptions,
        status: s.status,
        isPaused: s.isPaused,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Public: Shop detail
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid shop ID' });
      return;
    }

    const shop = await ShopModel.findById(id);
    if (!shop) {
      res.status(404).json({ success: false, error: 'Shop not found' });
      return;
    }

    res.json({
      success: true,
      shop: {
        id: shop._id.toString(),
        name: shop.name,
        description: shop.description,
        phone: shop.phone,
        address: shop.address,
        geo: shop.geo,
        hours: shop.hours,
        fulfilmentOptions: shop.fulfilmentOptions,
        status: shop.status,
        isPaused: shop.isPaused,
        minOrderPaise: shop.minOrderPaise,
        bannerUrl: shop.bannerUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: Update profile (Protected with IDOR defense)
router.patch('/:id/profile', authenticate, requireShopAccess('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, phone, address, fulfilmentOptions, hours } = req.body;

    const updated = await ShopModel.findByIdAndUpdate(
      id,
      {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
        ...(fulfilmentOptions ? { fulfilmentOptions } : {}),
        ...(hours ? { hours } : {}),
      },
      { new: true }
    );

    res.json({ success: true, shop: updated });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: Toggle pause / availability
router.patch('/:id/availability', authenticate, requireShopAccess('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPaused, hours } = req.body;

    const shop = await ShopModel.findById(id);
    if (!shop) {
      res.status(404).json({ success: false, error: 'Shop not found' });
      return;
    }

    if (typeof isPaused === 'boolean') {
      shop.isPaused = isPaused;
    }
    if (hours) {
      shop.hours = { ...shop.hours, ...hours };
    }
    await shop.save();

    res.json({
      success: true,
      message: `Shop is now ${shop.isPaused ? 'paused (not taking orders)' : 'open'}`,
      isPaused: shop.isPaused,
      hours: shop.hours,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
