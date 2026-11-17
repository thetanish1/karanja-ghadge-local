import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { CartModel, ProductModel, ShopModel, SettingModel } from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { calculateOrderTotals, CartDTO, CartItemDTO } from '@karanjaghadge/shared';

const router = Router();

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  qty: z.number().int().min(0, 'Quantity must be non-negative integer'),
});

// Helper: build validated cart response
async function getValidatedCart(userId: string): Promise<CartDTO> {
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: [],
    });
  }

  let shopName = '';
  if (cart.shopId) {
    const shop = await ShopModel.findById(cart.shopId);
    if (shop) shopName = shop.name;
  }

  // Get active platform settings (default 0 fees in pilot)
  const [deliverySetting, platformSetting] = await Promise.all([
    SettingModel.findOne({ key: 'DELIVERY_FEE_PAISE' }),
    SettingModel.findOne({ key: 'PLATFORM_FEE_PAISE' }),
  ]);

  const deliveryFeePaise = deliverySetting ? Number(deliverySetting.value) || 0 : 0;
  const platformFeePaise = platformSetting ? Number(platformSetting.value) || 0 : 0;

  // Validate every item against live Product records
  const validatedItems: CartItemDTO[] = [];
  let cartModified = false;

  for (const item of cart.items) {
    const product = await ProductModel.findById(item.productId);
    if (!product || !product.active || product.stockStatus === 'out_of_stock') {
      // Out of stock or deactivated product removed
      cartModified = true;
      continue;
    }

    const unitPricePaise = product.pricePaise;
    const subtotalPaise = item.qty * unitPricePaise;

    validatedItems.push({
      productId: product._id.toString(),
      name: product.name,
      unit: product.unit,
      pricePaise: unitPricePaise,
      qty: item.qty,
      subtotalPaise,
    });
  }

  if (cartModified) {
    cart.items = validatedItems.map((i) => ({
      productId: new mongoose.Types.ObjectId(i.productId),
      qty: i.qty,
      unitPricePaise: i.pricePaise,
    }));
    if (cart.items.length === 0) {
      cart.shopId = undefined;
    }
    await cart.save();
  }

  const totals = calculateOrderTotals(validatedItems, deliveryFeePaise, platformFeePaise);

  return {
    userId,
    shopId: cart.shopId ? cart.shopId.toString() : undefined,
    shopName,
    items: validatedItems,
    itemsTotalPaise: totals.itemsTotalPaise,
    deliveryFeePaise: totals.deliveryFeePaise,
    platformFeePaise: totals.platformFeePaise,
    totalPaise: totals.totalPaise,
    itemCount: validatedItems.reduce((acc, i) => acc + i.qty, 0),
  };
}

// GET /cart (Customer)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await getValidatedCart(req.user!.id);
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
});

// PUT /cart (Customer: Add or update item quantity)
router.put('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, qty } = addToCartSchema.parse(req.body);
    const userId = req.user!.id;

    const product = await ProductModel.findById(productId);
    if (!product || !product.active) {
      res.status(404).json({ success: false, error: 'Product not found or unavailable' });
      return;
    }

    if (product.stockStatus === 'out_of_stock' && qty > 0) {
      res.status(400).json({ success: false, error: 'Product is currently out of stock' });
      return;
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({
        userId: new mongoose.Types.ObjectId(userId),
        items: [],
      });
    }

    // STRICT ONE-SHOP CART ENFORCEMENT
    if (cart.shopId && cart.items.length > 0 && cart.shopId.toString() !== product.shopId.toString()) {
      const existingShop = await ShopModel.findById(cart.shopId);
      const incomingShop = await ShopModel.findById(product.shopId);

      res.status(409).json({
        success: false,
        error: `Your cart already contains items from "${existingShop?.name || 'another shop'}". Karanjaghadge Local currently supports orders from one shop at a time. Please complete your current order or clear the cart before ordering from "${incomingShop?.name || 'this shop'}".`,
        code: 'MULTI_SHOP_RESTRICTION',
        existingShopId: cart.shopId.toString(),
        existingShopName: existingShop?.name || 'Other Shop',
      });
      return;
    }

    // Set or reset shopId if cart was empty
    if (!cart.shopId || cart.items.length === 0) {
      cart.shopId = product.shopId;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (qty <= 0) {
      // Remove item
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        cart.items[itemIndex].qty = qty;
        cart.items[itemIndex].unitPricePaise = product.pricePaise;
      } else {
        cart.items.push({
          productId: product._id,
          qty,
          unitPricePaise: product.pricePaise,
        });
      }
    }

    // If cart has no items left, clear shopId
    if (cart.items.length === 0) {
      cart.shopId = undefined;
    }

    await cart.save();

    const validatedCart = await getValidatedCart(userId);
    res.json({ success: true, message: 'Cart updated', cart: validatedCart });
  } catch (err) {
    next(err);
  }
});

// DELETE /cart (Customer: Clear cart)
router.delete('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    await CartModel.findOneAndUpdate(
      { userId },
      { items: [], $unset: { shopId: 1 } },
      { new: true }
    );

    const emptyCart = await getValidatedCart(userId);
    res.json({ success: true, message: 'Cart cleared successfully', cart: emptyCart });
  } catch (err) {
    next(err);
  }
});

export default router;
