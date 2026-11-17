import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import {
  ShopModel,
  OrderModel,
  UserModel,
  DeliveryModel,
  AuditLogModel,
  OrderEventModel,
  OrderItemModel,
} from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { logAudit } from '../../middleware/audit.js';

const router = Router();

// Apply admin guard to all admin routes
router.use(authenticate, requireRoles('admin'));

// -------------------------------------------------------------------
// Overview KPI Metrics
// -------------------------------------------------------------------
router.get('/overview', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalShops,
      pendingShops,
      totalOrders,
      activeOrders,
      totalUsers,
      totalRevenuePaiseAgg,
    ] = await Promise.all([
      ShopModel.countDocuments(),
      ShopModel.countDocuments({ status: 'pending' }),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: { $in: ['placed', 'shop_accepted', 'preparing', 'ready_for_pickup', 'delivery_assigned', 'picked_up', 'out_for_delivery'] } }),
      UserModel.countDocuments(),
      OrderModel.aggregate([
        { $match: { status: { $in: ['delivered', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPaise' } } },
      ]),
    ]);

    const totalRevenuePaise = totalRevenuePaiseAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalShops,
        pendingShops,
        totalOrders,
        activeOrders,
        totalUsers,
        totalRevenuePaise,
      },
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Shop Management: List & Filter
// -------------------------------------------------------------------
router.get('/shops', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }

    const shops = await ShopModel.find(query).sort({ createdAt: -1 }).populate('ownerId', 'phone name');
    res.json({ success: true, count: shops.length, shops });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Shop Management: Approve or Suspend
// -------------------------------------------------------------------
router.patch('/shops/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = z
      .object({
        status: z.enum(['approved', 'suspended', 'pending']),
        reason: z.string().optional(),
      })
      .parse(req.body);

    const shop = await ShopModel.findById(id);
    if (!shop) {
      res.status(404).json({ success: false, error: 'Shop not found' });
      return;
    }

    const previousStatus = shop.status;
    shop.status = status;
    await shop.save();

    await logAudit({
      actorId: req.user!.id,
      actorRole: 'admin',
      action: `SHOP_STATUS_CHANGED_TO_${status.toUpperCase()}`,
      target: 'Shop',
      targetId: shop._id.toString(),
      before: { status: previousStatus },
      after: { status, reason },
    });

    res.json({
      success: true,
      message: `Shop "${shop.name}" status updated to ${status}`,
      shop,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Global Orders List
// -------------------------------------------------------------------
router.get('/orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, shopId } = req.query;
    const query: any = {};
    if (status && typeof status === 'string') query.status = status;
    if (shopId && typeof shopId === 'string' && mongoose.Types.ObjectId.isValid(shopId)) {
      query.shopId = new mongoose.Types.ObjectId(shopId);
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .populate('shopId', 'name phone address')
      .populate('customerId', 'name phone')
      .populate('deliveryPartnerId', 'name phone');

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Manual Delivery Assignment (Phase 1 Manual Model)
// -------------------------------------------------------------------
router.post('/orders/:id/assign-delivery', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { partnerId, handlerName, handlerPhone } = z
      .object({
        partnerId: z.string().min(1, 'Partner user ID is required'),
        handlerName: z.string().min(1, 'Handler name is required'),
        handlerPhone: z.string().optional(),
      })
      .parse(req.body);

    const order = await OrderModel.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.fulfilmentType !== 'delivery') {
      res.status(400).json({ success: false, error: 'Only delivery orders can be assigned to a partner.' });
      return;
    }

    const previousStatus = order.status;
    order.deliveryPartnerId = new mongoose.Types.ObjectId(partnerId);
    order.deliveryPartnerName = handlerName;
    order.deliveryPartnerPhone = handlerPhone;
    order.status = 'delivery_assigned';
    await order.save();

    await DeliveryModel.findOneAndUpdate(
      { orderId: order._id },
      {
        partnerId: new mongoose.Types.ObjectId(partnerId),
        handlerName,
        handlerPhone,
        status: 'assigned',
        assignedAt: new Date(),
      },
      { upsert: true }
    );

    // Record Event
    await OrderEventModel.create({
      orderId: order._id,
      from: previousStatus,
      to: 'delivery_assigned',
      actorId: new mongoose.Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      reason: `Assigned delivery to ${handlerName}`,
      at: new Date(),
    });

    res.json({
      success: true,
      message: `Delivery successfully assigned to ${handlerName}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Delivery Partners List
// -------------------------------------------------------------------
router.get('/delivery-partners', async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partners = await UserModel.find({
      roles: 'delivery_partner',
      status: 'active',
    }).select('name phone roles status');

    res.json({ success: true, count: partners.length, partners });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------------
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await AuditLogModel.find().sort({ at: -1 }).limit(100).populate('actorId', 'name phone roles');
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------------
// CSV Report Export
// -------------------------------------------------------------------
router.get('/export/:type', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.params;

    if (type === 'orders') {
      const orders = await OrderModel.find().sort({ createdAt: -1 }).populate('shopId', 'name');
      let csv = 'OrderNumber,Date,Shop,Status,Fulfilment,TotalPaise,TotalRupees,PaymentMethod,PaymentStatus\n';

      for (const o of orders) {
        const shop = o.shopId as any;
        csv += `"${o.orderNumber}","${o.createdAt.toISOString()}","${shop?.name || ''}","${o.status}","${o.fulfilmentType}",${o.totalPaise},${(o.totalPaise / 100).toFixed(2)},"${o.paymentMethod}","${o.paymentStatus}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="karanjaghadge_orders_export.csv"');
      res.send(csv);
      return;
    }

    if (type === 'shops') {
      const shops = await ShopModel.find().sort({ createdAt: -1 });
      let csv = 'ShopName,Phone,Address,Status,IsPaused,MinOrderPaise,CreatedAt\n';

      for (const s of shops) {
        csv += `"${s.name}","${s.phone}","${s.address.replace(/"/g, '""')}","${s.status}",${s.isPaused},${s.minOrderPaise},"${s.createdAt.toISOString()}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="karanjaghadge_shops_export.csv"');
      res.send(csv);
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid export type. Use "orders" or "shops".' });
  } catch (err) {
    next(err);
  }
});

export default router;
