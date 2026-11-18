import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import {
  OrderModel,
  OrderEventModel,
  DeliveryModel,
  UserModel,
  PaymentModel,
} from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { validateOrderTransition, OrderStatus } from '@karanjaghadge/shared';
import { whatsAppAdapter } from '../../adapters/whatsapp/mock-whatsapp.adapter.js';

const router = Router();

// -------------------------------------------------------------------
// Delivery Partner: List assigned tasks
// -------------------------------------------------------------------
router.get('/tasks', authenticate, requireRoles('delivery_partner', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isDeliveryOnly = !req.user!.roles.includes('admin');
    const query: any = {
      fulfilmentType: 'delivery',
      status: {
        $in: ['ready_for_pickup', 'delivery_assigned', 'picked_up', 'out_for_delivery', 'delivery_failed'],
      },
    };

    if (isDeliveryOnly) {
      query.$or = [
        { deliveryPartnerId: new mongoose.Types.ObjectId(req.user!.id) },
        { deliveryPartnerId: { $exists: false } },
        { deliveryPartnerId: null },
      ];
    }

    const orders = await OrderModel.find(query)
      .sort({ updatedAt: -1 })
      .populate('shopId', 'name phone address geo')
      .populate('customerId', 'name phone');

    const tasks = orders.map((o) => {
      const shop = o.shopId as any;
      const customer = o.customerId as any;

      // Build Google Maps Navigation links
      const shopCoords = shop?.geo?.coordinates; // [lng, lat]
      const shopNavUrl = shopCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${shopCoords[1]},${shopCoords[0]}`
        : null;

      const destCoords = o.deliveryAddressSnapshot?.geo?.coordinates;
      const destNavUrl = destCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${destCoords[1]},${destCoords[0]}`
        : null;

      return {
        orderId: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        shopName: shop?.name || 'Shop',
        shopPhone: shop?.phone || '',
        shopAddress: shop?.address || '',
        shopNavUrl,
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone || '',
        customerAddress: o.deliveryAddressSnapshot?.line || '',
        customerLandmark: o.deliveryAddressSnapshot?.landmark || '',
        customerPincode: o.deliveryAddressSnapshot?.pincode || '',
        destNavUrl,
        totalPaise: o.totalPaise,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      };
    });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Delivery Partner: Transition status (picked_up, out_for_delivery, failed)
// -------------------------------------------------------------------
router.post('/tasks/:orderId/transition', authenticate, requireRoles('delivery_partner', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { targetState, reason } = z
      .object({
        targetState: z.enum(['picked_up', 'out_for_delivery', 'delivery_failed']),
        reason: z.string().optional(),
      })
      .parse(req.body);

    const order = await OrderModel.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const check = validateOrderTransition(
      order.status,
      targetState,
      'delivery_partner',
      order.fulfilmentType
    );

    if (!check.allowed) {
      res.status(400).json({ success: false, error: check.reason });
      return;
    }

    const previousState = order.status;
    order.status = targetState;
    if (!order.deliveryPartnerId && req.user) {
      order.deliveryPartnerId = new mongoose.Types.ObjectId(req.user.id);
    }
    if (targetState === 'delivery_failed') {
      order.deliveryFailedReason = reason || 'Delivery failed';
    }
    await order.save();

    await OrderEventModel.create({
      orderId: order._id,
      from: previousState,
      to: targetState,
      actorId: new mongoose.Types.ObjectId(req.user!.id),
      actorRole: 'delivery_partner',
      reason,
      at: new Date(),
    });

    // Notify customer
    const customer = await UserModel.findById(order.customerId);
    if (customer && targetState === 'out_for_delivery') {
      await whatsAppAdapter.sendTemplateNotification({
        userId: customer._id.toString(),
        phone: customer.phone,
        template: 'out_for_delivery',
        params: {
          orderNumber: order.orderNumber,
          handlerName: req.user!.name || 'Delivery Partner',
        },
        fallbackBody: `Your order #${order.orderNumber} is out for delivery! Give OTP ${order.deliveryOtp} to the driver.`,
      });
    }

    res.json({
      success: true,
      message: `Delivery status updated to ${targetState}`,
      orderStatus: order.status,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Delivery Partner: Complete delivery via OTP Verification
// -------------------------------------------------------------------
router.post('/tasks/:orderId/verify-otp', authenticate, requireRoles('delivery_partner', 'admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { otp, cashCollectedPaise } = z
      .object({
        otp: z.string().length(4, 'OTP must be 4 digits'),
        cashCollectedPaise: z.number().int().min(0).optional(),
      })
      .parse(req.body);

    const order = await OrderModel.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status !== 'out_for_delivery' && !req.user!.roles.includes('admin')) {
      res.status(400).json({
        success: false,
        error: `Order must be "out_for_delivery" before completing delivery. Current: ${order.status}`,
      });
      return;
    }

    // OTP validation (Admin bypass allowed in emergency)
    if (order.deliveryOtp !== otp && !req.user!.roles.includes('admin')) {
      res.status(400).json({ success: false, error: 'Incorrect delivery OTP provided by customer.' });
      return;
    }

    const previousState = order.status;
    order.status = 'delivered';
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    // Record Delivery & Payment if COD
    await DeliveryModel.findOneAndUpdate(
      { orderId: order._id },
      {
        status: 'delivered',
        deliveredAt: new Date(),
        cashCollectedPaise: cashCollectedPaise || (order.paymentMethod === 'cod' ? order.totalPaise : 0),
      },
      { upsert: true }
    );

    if (order.paymentMethod === 'cod') {
      await PaymentModel.create({
        orderId: order._id,
        method: 'cod',
        status: 'paid',
        amountPaise: cashCollectedPaise || order.totalPaise,
        recordedBy: new mongoose.Types.ObjectId(req.user!.id),
      });
    }

    // Record append-only OrderEvent
    await OrderEventModel.create({
      orderId: order._id,
      from: previousState,
      to: 'delivered',
      actorId: new mongoose.Types.ObjectId(req.user!.id),
      actorRole: req.user!.roles.includes('admin') ? 'admin' : 'delivery_partner',
      reason: 'Delivered successfully with OTP verification',
      at: new Date(),
    });

    // Notify customer
    const customer = await UserModel.findById(order.customerId);
    if (customer) {
      await whatsAppAdapter.sendTemplateNotification({
        userId: customer._id.toString(),
        phone: customer.phone,
        template: 'delivered',
        params: { orderNumber: order.orderNumber },
        fallbackBody: `Your order #${order.orderNumber} has been delivered. Thank you for shopping with Karanjaghadge Local!`,
      });
    }

    res.json({
      success: true,
      message: 'Order marked delivered successfully!',
      orderStatus: order.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
