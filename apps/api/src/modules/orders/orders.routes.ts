import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import {
  OrderModel,
  OrderItemModel,
  OrderEventModel,
  CartModel,
  ProductModel,
  ShopModel,
  SettingModel,
  ShopMembershipModel,
  DeliveryModel,
  UserModel,
} from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { validateOrderTransition, calculateOrderTotals, OrderStatus } from '@karanjaghadge/shared';
import { whatsAppAdapter } from '../../adapters/whatsapp/mock-whatsapp.adapter.js';

const router = Router();

const createOrderSchema = z.object({
  fulfilmentType: z.enum(['delivery', 'pickup']),
  paymentMethod: z.enum(['cod', 'pay_direct_to_shop']).default('cod'),
  deliveryAddress: z
    .object({
      line: z.string().min(5, 'Delivery address line is required'),
      landmark: z.string().optional(),
      pincode: z.string().min(6, 'Pincode is required'),
      coordinates: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

const transitionSchema = z.object({
  targetState: z.string() as z.ZodType<OrderStatus>,
  reason: z.string().optional(),
});

// Helper: generate friendly order number
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KGL-${dateStr}-${rand}`;
}

// -------------------------------------------------------------------
// Customer: Create order (POST /orders) with Idempotency & Snapshots
// -------------------------------------------------------------------
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createOrderSchema.parse(req.body);
    const userId = req.user!.id;

    // 1. Idempotency Check
    const existingOrder = await OrderModel.findOne({ idempotencyKey: input.idempotencyKey });
    if (existingOrder) {
      const items = await OrderItemModel.find({ orderId: existingOrder._id });
      res.status(200).json({
        success: true,
        message: 'Order already processed (idempotent response)',
        order: {
          id: existingOrder._id.toString(),
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status,
          fulfilmentType: existingOrder.fulfilmentType,
          totalPaise: existingOrder.totalPaise,
          deliveryOtp: existingOrder.deliveryOtp,
          createdAt: existingOrder.createdAt,
        },
        items,
      });
      return;
    }

    // 2. Fetch Customer Cart
    const cart = await CartModel.findOne({ userId });
    if (!cart || cart.items.length === 0 || !cart.shopId) {
      res.status(400).json({ success: false, error: 'Your cart is empty. Please add items before checking out.' });
      return;
    }

    const shop = await ShopModel.findById(cart.shopId);
    if (!shop || shop.status !== 'approved') {
      res.status(400).json({ success: false, error: 'The selected shop is not currently available.' });
      return;
    }

    if (shop.isPaused) {
      res.status(400).json({ success: false, error: `"${shop.name}" is temporarily paused and not accepting orders.` });
      return;
    }

    // 3. Verify fulfilment options
    if (!shop.fulfilmentOptions.includes(input.fulfilmentType)) {
      res.status(400).json({
        success: false,
        error: `"${shop.name}" does not offer ${input.fulfilmentType}. Available: ${shop.fulfilmentOptions.join(', ')}`,
      });
      return;
    }

    // 4. Validate delivery address if delivery order
    if (input.fulfilmentType === 'delivery' && !input.deliveryAddress) {
      res.status(400).json({ success: false, error: 'Delivery address is required for delivery orders.' });
      return;
    }

    // 5. Snapshot items and recalculate totals
    const snapshotItems = [];
    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product || !product.active || product.stockStatus === 'out_of_stock') {
        res.status(400).json({
          success: false,
          error: `Product "${product?.name || 'Item'}" is out of stock. Please update your cart.`,
        });
        return;
      }
      snapshotItems.push({
        productId: product._id,
        name: product.name,
        unit: product.unit,
        pricePaise: product.pricePaise,
        qty: item.qty,
        subtotalPaise: item.qty * product.pricePaise,
      });
    }

    const [deliverySetting, platformSetting] = await Promise.all([
      SettingModel.findOne({ key: 'DELIVERY_FEE_PAISE' }),
      SettingModel.findOne({ key: 'PLATFORM_FEE_PAISE' }),
    ]);

    const deliveryFeePaise = input.fulfilmentType === 'delivery'
      ? (deliverySetting ? Number(deliverySetting.value) || 0 : 0)
      : 0;
    const platformFeePaise = platformSetting ? Number(platformSetting.value) || 0 : 0;

    const totals = calculateOrderTotals(snapshotItems, deliveryFeePaise, platformFeePaise);

    // 6. Generate delivery OTP if delivery order
    const deliveryOtp = input.fulfilmentType === 'delivery'
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : undefined;

    // 7. Create Order document
    const orderNumber = generateOrderNumber();
    const order = await OrderModel.create({
      orderNumber,
      customerId: new mongoose.Types.ObjectId(userId),
      shopId: shop._id,
      status: 'placed',
      fulfilmentType: input.fulfilmentType,
      deliveryAddressSnapshot: input.deliveryAddress
        ? {
            line: input.deliveryAddress.line,
            landmark: input.deliveryAddress.landmark,
            pincode: input.deliveryAddress.pincode,
            geo: input.deliveryAddress.coordinates
              ? { type: 'Point', coordinates: input.deliveryAddress.coordinates }
              : undefined,
          }
        : undefined,
      itemsTotalPaise: totals.itemsTotalPaise,
      deliveryFeePaise: totals.deliveryFeePaise,
      platformFeePaise: totals.platformFeePaise,
      totalPaise: totals.totalPaise,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'pending',
      idempotencyKey: input.idempotencyKey,
      notes: input.notes,
      deliveryOtp,
    });

    // 8. Create OrderItem snapshots
    await OrderItemModel.insertMany(
      snapshotItems.map((item) => ({
        orderId: order._id,
        productId: item.productId,
        name: item.name,
        unit: item.unit,
        pricePaise: item.pricePaise,
        qty: item.qty,
        subtotalPaise: item.subtotalPaise,
      }))
    );

    // 9. Record initial OrderEvent
    await OrderEventModel.create({
      orderId: order._id,
      from: 'placed',
      to: 'placed',
      actorId: new mongoose.Types.ObjectId(userId),
      actorRole: 'customer',
      reason: 'Order placed by customer',
      at: new Date(),
    });

    // 10. Clear Customer Cart
    await CartModel.findOneAndUpdate(
      { userId },
      { items: [], $unset: { shopId: 1 } }
    );

    // 11. Send Mock WhatsApp Notification
    await whatsAppAdapter.sendTemplateNotification({
      userId,
      phone: req.user!.phone,
      template: 'order_placed',
      params: {
        orderNumber: order.orderNumber,
        shopName: shop.name,
        totalRupees: (totals.totalPaise / 100).toFixed(2),
      },
      fallbackBody: `Your order #${order.orderNumber} for ₹${(totals.totalPaise / 100).toFixed(2)} from ${shop.name} has been placed successfully!`,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        fulfilmentType: order.fulfilmentType,
        totalPaise: order.totalPaise,
        deliveryOtp: order.deliveryOtp,
        createdAt: order.createdAt,
      },
      items: snapshotItems,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Customer: Order list (GET /orders)
// -------------------------------------------------------------------
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await OrderModel.find({ customerId: req.user!.id })
      .sort({ createdAt: -1 })
      .populate('shopId', 'name phone address');

    const ordersWithItems = await Promise.all(
      orders.map(async (o) => {
        const items = await OrderItemModel.find({ orderId: o._id });
        const shop = o.shopId as any;
        return {
          id: o._id.toString(),
          orderNumber: o.orderNumber,
          shopId: shop?._id?.toString() || '',
          shopName: shop?.name || 'Shop',
          shopPhone: shop?.phone || '',
          status: o.status,
          fulfilmentType: o.fulfilmentType,
          totalPaise: o.totalPaise,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
          itemCount: items.reduce((acc, i) => acc + i.qty, 0),
          items: items.map((i) => ({
            name: i.name,
            qty: i.qty,
            unit: i.unit,
            pricePaise: i.pricePaise,
          })),
        };
      })
    );

    res.json({ success: true, orders: ordersWithItems });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Common: Order details with timeline & status (GET /orders/:id)
// -------------------------------------------------------------------
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid order ID' });
      return;
    }

    const order = await OrderModel.findById(id).populate('shopId', 'name phone address');
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Role check: customer who owns order, shopkeeper of that shop, assigned delivery partner, or admin
    const isCustomer = order.customerId.toString() === req.user!.id;
    const isAdmin = req.user!.roles.includes('admin');
    let isShopkeeper = false;
    let isDelivery = order.deliveryPartnerId?.toString() === req.user!.id;

    if (!isCustomer && !isAdmin && !isDelivery) {
      const membership = await ShopMembershipModel.findOne({
        shopId: order.shopId,
        userId: req.user!.id,
      });
      if (membership) isShopkeeper = true;
    }

    if (!isCustomer && !isAdmin && !isShopkeeper && !isDelivery) {
      res.status(403).json({ success: false, error: 'Unauthorized to view this order.' });
      return;
    }

    const [items, events, customer] = await Promise.all([
      OrderItemModel.find({ orderId: order._id }),
      OrderEventModel.find({ orderId: order._id }).sort({ at: 1 }),
      UserModel.findById(order.customerId).select('name phone'),
    ]);

    const shop = order.shopId as any;

    res.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: order.customerId.toString(),
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone || '',
        shopId: shop?._id?.toString() || '',
        shopName: shop?.name || '',
        shopPhone: shop?.phone || '',
        shopAddress: shop?.address || '',
        status: order.status,
        fulfilmentType: order.fulfilmentType,
        deliveryAddressSnapshot: order.deliveryAddressSnapshot,
        itemsTotalPaise: order.itemsTotalPaise,
        deliveryFeePaise: order.deliveryFeePaise,
        platformFeePaise: order.platformFeePaise,
        totalPaise: order.totalPaise,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        rejectionReason: order.rejectionReason,
        cancellationReason: order.cancellationReason,
        deliveryPartnerName: order.deliveryPartnerName,
        deliveryPartnerPhone: order.deliveryPartnerPhone,
        // Only disclose delivery OTP to customer and admin
        deliveryOtp: (isCustomer || isAdmin) ? order.deliveryOtp : undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      items,
      events: events.map((e) => ({
        id: e._id.toString(),
        from: e.from,
        to: e.to,
        actorRole: e.actorRole,
        reason: e.reason,
        at: e.at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Customer: Cancel request (POST /orders/:id/cancel-request)
// -------------------------------------------------------------------
router.post('/:id/cancel-request', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderModel.findOne({ _id: id, customerId: req.user!.id });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found or does not belong to you.' });
      return;
    }

    // Pure state machine validation
    const check = validateOrderTransition(
      order.status,
      'customer_cancel_requested',
      'customer',
      order.fulfilmentType
    );

    if (!check.allowed) {
      res.status(400).json({ success: false, error: check.reason });
      return;
    }

    order.status = 'customer_cancel_requested';
    order.cancellationReason = reason || 'Customer requested cancellation';
    await order.save();

    await OrderEventModel.create({
      orderId: order._id,
      from: 'placed',
      to: 'customer_cancel_requested',
      actorId: new mongoose.Types.ObjectId(req.user!.id),
      actorRole: 'customer',
      reason: order.cancellationReason,
      at: new Date(),
    });

    res.json({
      success: true,
      message: 'Cancellation request recorded.',
      orderStatus: order.status,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Shopkeeper: Order Queue (GET /shop/orders)
// -------------------------------------------------------------------
router.get('/shop/queue', authenticate, requireRoles('shopkeeper', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId, status } = req.query;

    let targetShopIds: mongoose.Types.ObjectId[] = [];

    if (shopId && typeof shopId === 'string' && mongoose.Types.ObjectId.isValid(shopId)) {
      targetShopIds = [new mongoose.Types.ObjectId(shopId)];
    } else {
      const memberships = await ShopMembershipModel.find({ userId: req.user!.id });
      targetShopIds = memberships.map((m) => m.shopId);
    }

    const query: any = { shopId: { $in: targetShopIds } };
    if (status && typeof status === 'string') {
      query.status = status;
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name phone')
      .populate('shopId', 'name');

    const ordersWithItems = await Promise.all(
      orders.map(async (o) => {
        const items = await OrderItemModel.find({ orderId: o._id });
        const customer = o.customerId as any;
        const shop = o.shopId as any;
        return {
          id: o._id.toString(),
          orderNumber: o.orderNumber,
          shopName: shop?.name || '',
          customerName: customer?.name || 'Customer',
          customerPhone: customer?.phone || '',
          status: o.status,
          fulfilmentType: o.fulfilmentType,
          totalPaise: o.totalPaise,
          deliveryAddressSnapshot: o.deliveryAddressSnapshot,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          notes: o.notes,
          rejectionReason: o.rejectionReason,
          cancellationReason: o.cancellationReason,
          createdAt: o.createdAt,
          items,
        };
      })
    );

    res.json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Shopkeeper/Admin: State transition (POST /shop/orders/:id/transition)
// -------------------------------------------------------------------
router.post('/shop/orders/:id/transition', authenticate, requireRoles('shopkeeper', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetState, reason } = transitionSchema.parse(req.body);

    const order = await OrderModel.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // IDOR check: verify user owns or manages this shop (unless admin)
    if (!req.user!.roles.includes('admin')) {
      const membership = await ShopMembershipModel.findOne({
        shopId: order.shopId,
        userId: req.user!.id,
      });
      if (!membership) {
        res.status(403).json({ success: false, error: 'Forbidden. You do not manage the shop for this order.' });
        return;
      }
    }

    const actorRole = req.user!.roles.includes('admin') ? 'admin' : 'shopkeeper';

    // State machine check
    const check = validateOrderTransition(
      order.status,
      targetState,
      actorRole,
      order.fulfilmentType
    );

    if (!check.allowed) {
      res.status(400).json({ success: false, error: check.reason });
      return;
    }

    if (check.noop) {
      res.json({ success: true, message: 'Order is already in this status', orderStatus: order.status });
      return;
    }

    if (targetState === 'shop_rejected' && (!reason || reason.trim() === '')) {
      res.status(400).json({ success: false, error: 'A rejection reason is required.' });
      return;
    }

    const previousState = order.status;
    order.status = targetState;
    if (targetState === 'shop_rejected') order.rejectionReason = reason;
    await order.save();

    // Record append-only OrderEvent
    await OrderEventModel.create({
      orderId: order._id,
      from: previousState,
      to: targetState,
      actorId: new mongoose.Types.ObjectId(req.user!.id),
      actorRole,
      reason,
      at: new Date(),
    });

    // Notify customer via Honest Mock WhatsApp
    const customer = await UserModel.findById(order.customerId);
    if (customer) {
      let waTemplate: any = null;
      if (targetState === 'shop_accepted') waTemplate = 'shop_accepted';
      if (targetState === 'ready_for_pickup') waTemplate = 'ready_for_pickup';
      if (targetState === 'shop_rejected' || targetState === 'cancelled') waTemplate = 'cancelled';

      if (waTemplate) {
        await whatsAppAdapter.sendTemplateNotification({
          userId: customer._id.toString(),
          phone: customer.phone,
          template: waTemplate,
          params: {
            orderNumber: order.orderNumber,
            reason: reason || '',
          },
          fallbackBody: `Update on Order #${order.orderNumber}: Status changed to ${targetState.replace(/_/g, ' ')}.`,
        });
      }
    }

    res.json({
      success: true,
      message: `Order transitioned from ${previousState} to ${targetState}`,
      orderStatus: order.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
