import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CategoryModel, ServiceAreaModel } from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { DEFAULT_SERVICE_AREA } from '@karanjaghadge/shared';

const router = Router();

// Calculate distance using Haversine formula (km)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DEFAULT_CATEGORIES = [
  { name: 'Vegetables & Fruits', slug: 'vegetables-fruits', icon: '🥬', sortOrder: 1 },
  { name: 'Dairy & Milk', slug: 'dairy', icon: '🥛', sortOrder: 2 },
  { name: 'Grocery & Kirana', slug: 'grocery', icon: '🛒', sortOrder: 3 },
  { name: 'Cloth & Fashion', slug: 'cloth', icon: '👕', sortOrder: 4 },
  { name: 'Mobile & Accessories', slug: 'mobile', icon: '📱', sortOrder: 5 },
  { name: 'Electric (Wire, Bulb, Lighting)', slug: 'electric', icon: '💡', sortOrder: 6 },
  { name: 'Electronic (TV, AC, Fridge)', slug: 'electronic', icon: '📺', sortOrder: 7 },
  { name: 'Fireworks & Crackers', slug: 'fireworks', icon: '🎆', sortOrder: 8 },
  { name: 'Bakery & Snacks', slug: 'bakery', icon: '🥐', sortOrder: 9 },
];

// Public: List categories
router.get('/categories', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let categories = await CategoryModel.find({ active: true }).sort({ sortOrder: 1, name: 1 });
    if (categories.length === 0) {
      await CategoryModel.insertMany(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, active: true }))
      );
      categories = await CategoryModel.find({ active: true }).sort({ sortOrder: 1, name: 1 });
    }
    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
});

// Admin: Add category
router.post('/categories', authenticate, requireRoles('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, icon, sortOrder } = z
      .object({
        name: z.string().min(1),
        slug: z.string().min(1),
        icon: z.string().optional(),
        sortOrder: z.number().optional().default(0),
      })
      .parse(req.body);

    const category = await CategoryModel.create({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      icon,
      sortOrder,
      active: true,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

// Public: Serviceability check
router.get('/serviceability', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      res.json({
        success: true,
        serviceable: true,
        note: 'Location coordinates not provided; showing default Karanjaghadge area',
        serviceArea: DEFAULT_SERVICE_AREA,
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({ success: false, error: 'Invalid coordinates' });
      return;
    }

    // Check against configured service areas or default
    const serviceAreas = await ServiceAreaModel.find({ active: true });
    let isServiceable = false;
    let matchingArea = null;

    if (serviceAreas.length > 0) {
      for (const area of serviceAreas) {
        const dist = calculateDistanceKm(
          latitude,
          longitude,
          area.centreGeo.coordinates[1],
          area.centreGeo.coordinates[0]
        );
        if (dist <= area.radiusKm) {
          isServiceable = true;
          matchingArea = area;
          break;
        }
      }
    } else {
      // Default to Karanjaghadge center 7km
      const dist = calculateDistanceKm(
        latitude,
        longitude,
        DEFAULT_SERVICE_AREA.latitude,
        DEFAULT_SERVICE_AREA.longitude
      );
      isServiceable = dist <= DEFAULT_SERVICE_AREA.radiusKm;
    }

    res.json({
      success: true,
      serviceable: isServiceable,
      distanceKm: isServiceable ? 0 : 8,
      center: DEFAULT_SERVICE_AREA,
      message: isServiceable
        ? 'Great news! Your location is serviceable by Karanjaghadge Local.'
        : 'Currently, your location is outside the Karanjaghadge pilot delivery zone (7km radius). You can still browse and choose in-shop pickup!',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
