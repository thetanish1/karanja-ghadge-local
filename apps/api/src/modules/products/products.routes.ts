import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ProductModel, ShopModel, CategoryModel } from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireShopAccess } from '../../middleware/rbac.js';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required (e.g. 1 kg, 500 ml)'),
  pricePaise: z.number().int().min(0, 'Price in paise must be non-negative integer'),
  mrpPaise: z.number().int().min(0).optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock']).default('in_stock'),
  imageKeys: z.array(z.string()).default([]),
});

const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional(),
});

// Public: Search and browse products
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId, categoryId, search, inStockOnly } = req.query;

    const query: any = { active: true };

    if (shopId && typeof shopId === 'string' && mongoose.Types.ObjectId.isValid(shopId)) {
      query.shopId = new mongoose.Types.ObjectId(shopId);
    } else {
      // If browsing generally, only include products from approved & non-paused shops
      const approvedShops = await ShopModel.find({ status: 'approved' }).select('_id');
      query.shopId = { $in: approvedShops.map((s) => s._id) };
    }

    if (categoryId && typeof categoryId === 'string') {
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        query.categoryId = new mongoose.Types.ObjectId(categoryId);
      } else {
        const cat = await CategoryModel.findOne({
          $or: [
            { slug: categoryId },
            { slug: { $regex: categoryId, $options: 'i' } },
            { name: { $regex: categoryId, $options: 'i' } },
          ],
        });
        if (cat) query.categoryId = cat._id;
      }
    }

    if (inStockOnly === 'true') {
      query.stockStatus = 'in_stock';
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await ProductModel.find(query).sort({ stockStatus: 1, name: 1 });

    res.json({
      success: true,
      count: products.length,
      products: products.map((p) => ({
        id: p._id.toString(),
        shopId: p.shopId.toString(),
        categoryId: p.categoryId.toString(),
        name: p.name,
        description: p.description,
        unit: p.unit,
        pricePaise: p.pricePaise,
        mrpPaise: p.mrpPaise,
        stockStatus: p.stockStatus,
        active: p.active,
        imageKeys: p.imageKeys,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Public: Get single product
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID' });
      return;
    }

    const product = await ProductModel.findById(id);
    if (!product || !product.active) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      product: {
        id: product._id.toString(),
        shopId: product.shopId.toString(),
        categoryId: product.categoryId.toString(),
        name: product.name,
        description: product.description,
        unit: product.unit,
        pricePaise: product.pricePaise,
        mrpPaise: product.mrpPaise,
        stockStatus: product.stockStatus,
        active: product.active,
        imageKeys: product.imageKeys,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: Create product (IDOR Defense)
router.post('/shop/:shopId', authenticate, requireShopAccess('shopId'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId } = req.params;
    const input = createProductSchema.parse(req.body);

    const product = await ProductModel.create({
      shopId: new mongoose.Types.ObjectId(shopId),
      categoryId: new mongoose.Types.ObjectId(input.categoryId),
      name: input.name,
      description: input.description,
      unit: input.unit,
      pricePaise: input.pricePaise,
      mrpPaise: input.mrpPaise,
      stockStatus: input.stockStatus,
      imageKeys: input.imageKeys,
      active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: {
        id: product._id.toString(),
        shopId: product.shopId.toString(),
        name: product.name,
        pricePaise: product.pricePaise,
        unit: product.unit,
        stockStatus: product.stockStatus,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: Update product (IDOR Defense)
router.put('/shop/:shopId/:id', authenticate, requireShopAccess('shopId'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId, id } = req.params;
    const input = updateProductSchema.parse(req.body);

    const product = await ProductModel.findOne({ _id: id, shopId });
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found in this shop' });
      return;
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) product.description = input.description;
    if (input.categoryId !== undefined) product.categoryId = new mongoose.Types.ObjectId(input.categoryId);
    if (input.unit !== undefined) product.unit = input.unit;
    if (input.pricePaise !== undefined) product.pricePaise = input.pricePaise;
    if (input.mrpPaise !== undefined) product.mrpPaise = input.mrpPaise;
    if (input.stockStatus !== undefined) product.stockStatus = input.stockStatus;
    if (input.active !== undefined) product.active = input.active;
    if (input.imageKeys !== undefined) product.imageKeys = input.imageKeys;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
});

// Shopkeeper: Delete / Deactivate product (IDOR Defense)
router.delete('/shop/:shopId/:id', authenticate, requireShopAccess('shopId'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId, id } = req.params;
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, shopId },
      { active: false },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product archived successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
