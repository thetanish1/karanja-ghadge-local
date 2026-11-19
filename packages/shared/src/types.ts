export type UserRole = 'customer' | 'shopkeeper' | 'delivery_partner' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserNotificationPrefs {
  inApp: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface UserDTO {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  roles: UserRole[];
  status: UserStatus;
  notificationPrefs: UserNotificationPrefs;
  createdAt: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface AddressDTO {
  id: string;
  userId: string;
  label: string;
  line: string;
  landmark?: string;
  pincode: string;
  geo?: GeoPoint;
  isDefault?: boolean;
}

export type ShopStatus = 'pending' | 'approved' | 'suspended';
export type FulfilmentOption = 'delivery' | 'pickup';

export interface ShopHours {
  open: string;  // e.g. "08:00"
  close: string; // e.g. "21:00"
  daysOpen: number[]; // 0=Sunday, 1=Monday...
}

export interface ShopDTO {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  geo: GeoPoint;
  hours: ShopHours;
  fulfilmentOptions: FulfilmentOption[];
  status: ShopStatus;
  isPaused: boolean;
  minOrderPaise: number;
  bannerUrl?: string;
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ShopMemberRole = 'owner' | 'staff';

export interface ShopMembershipDTO {
  id: string;
  shopId: string;
  userId: string;
  role: ShopMemberRole;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  active: boolean;
  parentId?: string;
}

export type StockStatus = 'in_stock' | 'out_of_stock';

export interface ProductDTO {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description?: string;
  unit: string; // e.g. "1 kg", "500 ml", "1 packet"
  pricePaise: number; // Integer paise
  mrpPaise?: number; // Integer paise
  stockStatus: StockStatus;
  active: boolean;
  imageKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDTO {
  productId: string;
  product?: ProductDTO;
  name: string;
  unit: string;
  pricePaise: number;
  qty: number;
  subtotalPaise: number;
}

export interface CartDTO {
  userId: string;
  shopId?: string;
  shopName?: string;
  items: CartItemDTO[];
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  totalPaise: number;
  itemCount: number;
}

export type OrderStatus =
  | 'placed'
  | 'shop_accepted'
  | 'shop_rejected'
  | 'customer_cancel_requested'
  | 'cancelled'
  | 'preparing'
  | 'ready_for_pickup'
  | 'delivery_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'completed';

export type FulfilmentType = 'delivery' | 'pickup';
export type PaymentMethod = 'cod' | 'pay_direct_to_shop';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  unit: string;
  pricePaise: number;
  qty: number;
  subtotalPaise: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  shopPhone: string;
  status: OrderStatus;
  fulfilmentType: FulfilmentType;
  deliveryAddressSnapshot?: {
    line: string;
    landmark?: string;
    pincode: string;
    geo?: GeoPoint;
  };
  items: OrderItemSnapshot[];
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  totalPaise: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  deliveryFailedReason?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryOtp?: string; // only visible to customer/admin until verified
  idempotencyKey: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEventDTO {
  id: string;
  orderId: string;
  from: OrderStatus;
  to: OrderStatus;
  actorId: string;
  actorRole: UserRole | 'system';
  reason?: string;
  at: string;
}

export type DeliveryStatus =
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export interface DeliveryDTO {
  id: string;
  orderId: string;
  partnerId: string;
  handlerName: string;
  handlerPhone?: string;
  status: DeliveryStatus;
  otpHash?: string;
  cashCollectedPaise: number;
  assignedAt: string;
  deliveredAt?: string;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  channel: 'in_app' | 'whatsapp_mock' | 'sms_mock';
  template: string;
  title: string;
  body: string;
  providerMessageId?: string;
  status: 'sent' | 'mock' | 'failed';
  read: boolean;
  createdAt: string;
}

export interface ServiceAreaDTO {
  id: string;
  name: string;
  centreGeo: GeoPoint;
  radiusKm: number;
  active: boolean;
  deliveryFeePaise: number;
}

export interface SettingDTO {
  key: string;
  value: any;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface AuditLogDTO {
  id: string;
  actorId: string;
  actorRole?: string;
  action: string;
  target: string;
  targetId?: string;
  before?: any;
  after?: any;
  ip?: string;
  at: string;
}
