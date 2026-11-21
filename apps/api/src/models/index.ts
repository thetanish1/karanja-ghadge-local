import mongoose, { Schema, Document } from 'mongoose';
import {
  UserRole,
  UserStatus,
  ShopStatus,
  StockStatus,
  OrderStatus,
  FulfilmentType,
  PaymentMethod,
  PaymentStatus,
  DeliveryStatus,
} from '@karanjaghadge/shared';

// ==========================================
// 1. USER
// ==========================================
export interface IUser extends Document {
  phone: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  roles: UserRole[];
  status: UserStatus;
  notificationPrefs: {
    inApp: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts?: number;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    roles: {
      type: [String],
      enum: ['customer', 'shopkeeper', 'delivery_partner', 'admin'],
      default: ['customer'],
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    notificationPrefs: {
      inApp: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// ==========================================
// 2. ADDRESS
// ==========================================
export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  line: string;
  landmark?: string;
  pincode: string;
  geo?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home' },
    line: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [78.5484, 21.1714] },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);
AddressSchema.index({ geo: '2dsphere' });
export const AddressModel = mongoose.model<IAddress>('Address', AddressSchema);

// ==========================================
// 3. SHOP
// ==========================================
export interface IShop extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName?: string;
  email?: string;
  description: string;
  phone: string;
  address: string;
  geo: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  hours: {
    open: string;
    close: string;
    daysOpen: number[];
  };
  fulfilmentOptions: FulfilmentType[];
  status: ShopStatus;
  isPaused: boolean;
  minOrderPaise: number;
  categoryIds: mongoose.Types.ObjectId[];
  bannerUrl?: string;
  photos?: string[];
  verificationDocs?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: { type: String, required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, default: '' },
    email: { type: String, default: '' },
    description: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    hours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '21:00' },
      daysOpen: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    },
    fulfilmentOptions: {
      type: [String],
      enum: ['delivery', 'pickup'],
      default: ['delivery', 'pickup'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
      index: true,
    },
    isPaused: { type: Boolean, default: false },
    minOrderPaise: { type: Number, default: 0 },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    bannerUrl: { type: String },
    photos: [{ type: String }],
    verificationDocs: [{ type: String }],
  },
  { timestamps: true }
);
ShopSchema.index({ geo: '2dsphere' });
export const ShopModel = mongoose.model<IShop>('Shop', ShopSchema);

// ==========================================
// 4. SHOP MEMBERSHIP
// ==========================================
export interface IShopMembership extends Document {
  shopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'staff';
}

const ShopMembershipSchema = new Schema<IShopMembership>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'staff'], default: 'owner' },
  },
  { timestamps: true }
);
ShopMembershipSchema.index({ shopId: 1, userId: 1 }, { unique: true });
export const ShopMembershipModel = mongoose.model<IShopMembership>('ShopMembership', ShopMembershipSchema);

// ==========================================
// 5. CATEGORY
// ==========================================
export interface ICategory extends Document {
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  active: boolean;
  parentId?: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  },
  { timestamps: true }
);
export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);

// ==========================================
// 6. PRODUCT
// ==========================================
export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  unit: string;
  pricePaise: number;
  mrpPaise?: number;
  stockStatus: StockStatus;
  active: boolean;
  imageKeys: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    unit: { type: String, required: true },
    pricePaise: { type: Number, required: true, min: 0 },
    mrpPaise: { type: Number, min: 0 },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
    active: { type: Boolean, default: true, index: true },
    imageKeys: [{ type: String }],
  },
  { timestamps: true }
);
ProductSchema.index({ shopId: 1, categoryId: 1, active: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

// ==========================================
// 7. CART
// ==========================================
export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  unitPricePaise: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  shopId?: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
        unitPricePaise: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);
export const CartModel = mongoose.model<ICart>('Cart', CartSchema);

// ==========================================
// 8. ORDER
// ==========================================
export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  status: OrderStatus;
  fulfilmentType: FulfilmentType;
  deliveryAddressSnapshot?: {
    line: string;
    landmark?: string;
    pincode: string;
    geo?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  totalPaise: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  idempotencyKey: string;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  deliveryFailedReason?: string;
  deliveryPartnerId?: mongoose.Types.ObjectId;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryOtp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: [
        'placed',
        'shop_accepted',
        'shop_rejected',
        'customer_cancel_requested',
        'cancelled',
        'preparing',
        'ready_for_pickup',
        'delivery_assigned',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'delivery_failed',
        'completed',
      ],
      default: 'placed',
      index: true,
    },
    fulfilmentType: { type: String, enum: ['delivery', 'pickup'], required: true },
    deliveryAddressSnapshot: {
      line: { type: String },
      landmark: { type: String },
      pincode: { type: String },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
    },
    itemsTotalPaise: { type: Number, required: true },
    deliveryFeePaise: { type: Number, default: 0 },
    platformFeePaise: { type: Number, default: 0 },
    totalPaise: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'pay_direct_to_shop', 'upi'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    notes: { type: String },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
    deliveryFailedReason: { type: String },
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryPartnerName: { type: String },
    deliveryPartnerPhone: { type: String },
    deliveryOtp: { type: String },
  },
  { timestamps: true }
);
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ shopId: 1, status: 1, createdAt: -1 });
export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);

// ==========================================
// 9. ORDER ITEM (Snapshot)
// ==========================================
export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  pricePaise: number;
  qty: number;
  subtotalPaise: number;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    qty: { type: Number, required: true },
    subtotalPaise: { type: Number, required: true },
  },
  { timestamps: true }
);
export const OrderItemModel = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

// ==========================================
// 10. ORDER EVENT (Append-Only)
// ==========================================
export interface IOrderEvent extends Document {
  orderId: mongoose.Types.ObjectId;
  from: OrderStatus;
  to: OrderStatus;
  actorId: mongoose.Types.ObjectId;
  actorRole: UserRole | 'system';
  reason?: string;
  at: Date;
}

const OrderEventSchema = new Schema<IOrderEvent>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    reason: { type: String },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
OrderEventSchema.index({ orderId: 1, at: 1 });
export const OrderEventModel = mongoose.model<IOrderEvent>('OrderEvent', OrderEventSchema);

// ==========================================
// 11. DELIVERY
// ==========================================
export interface IDelivery extends Document {
  orderId: mongoose.Types.ObjectId;
  partnerId: mongoose.Types.ObjectId;
  handlerName: string;
  handlerPhone?: string;
  status: DeliveryStatus;
  otpHash?: string;
  cashCollectedPaise: number;
  assignedAt: Date;
  deliveredAt?: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    handlerName: { type: String, required: true },
    handlerPhone: { type: String },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'failed'],
      default: 'assigned',
    },
    otpHash: { type: String },
    cashCollectedPaise: { type: Number, default: 0 },
    assignedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);
export const DeliveryModel = mongoose.model<IDelivery>('Delivery', DeliverySchema);

// ==========================================
// 12. PAYMENT
// ==========================================
export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  method: PaymentMethod;
  status: PaymentStatus;
  providerRef?: string;
  amountPaise: number;
  recordedBy?: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    method: { type: String, enum: ['cod', 'pay_direct_to_shop'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    providerRef: { type: String, sparse: true, unique: true },
    amountPaise: { type: Number, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);

// ==========================================
// 13. NOTIFICATION
// ==========================================
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  channel: 'in_app' | 'whatsapp_mock' | 'sms_mock';
  template: string;
  title: string;
  body: string;
  providerMessageId?: string;
  status: 'sent' | 'mock' | 'failed';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, enum: ['in_app', 'whatsapp_mock', 'sms_mock'], default: 'in_app' },
    template: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    providerMessageId: { type: String },
    status: { type: String, enum: ['sent', 'mock', 'failed'], default: 'sent' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
NotificationSchema.index({ userId: 1, createdAt: -1 });
export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

// ==========================================
// 14. SERVICE AREA
// ==========================================
export interface IServiceArea extends Document {
  name: string;
  centreGeo: {
    type: 'Point';
    coordinates: [number, number];
  };
  radiusKm: number;
  active: boolean;
  deliveryFeePaise: number;
}

const ServiceAreaSchema = new Schema<IServiceArea>(
  {
    name: { type: String, required: true },
    centreGeo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    radiusKm: { type: Number, default: 7.0 },
    active: { type: Boolean, default: true },
    deliveryFeePaise: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ServiceAreaSchema.index({ centreGeo: '2dsphere' });
export const ServiceAreaModel = mongoose.model<IServiceArea>('ServiceArea', ServiceAreaSchema);

// ==========================================
// 15. SETTING
// ==========================================
export interface ISetting extends Document {
  key: string;
  value: any;
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export const SettingModel = mongoose.model<ISetting>('Setting', SettingSchema);

// ==========================================
// 16. AUDIT LOG
// ==========================================
export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole?: string;
  action: string;
  target: string;
  targetId?: string;
  before?: any;
  after?: any;
  ip?: string;
  at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String },
    action: { type: String, required: true },
    target: { type: String, required: true },
    targetId: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
AuditLogSchema.index({ target: 1, at: -1 });
export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// ==========================================
// 17. FUTURE STUBS: SUBSCRIPTIONS (Disabled in Pilot)
// ==========================================
const SubscriptionPlanSchema = new Schema(
  {
    name: String,
    pricePaise: Number,
    interval: String,
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const SubscriptionPlanModel = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

const SubscriptionSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    status: { type: String, default: 'inactive' },
  },
  { timestamps: true }
);
export const SubscriptionModel = mongoose.model('Subscription', SubscriptionSchema);
