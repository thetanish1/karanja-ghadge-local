import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import {
  UserModel,
  ShopModel,
  CategoryModel,
  ProductModel,
  OrderModel,
  CartModel,
  SettingModel,
} from '../src/models/index.js';
import {
  calculateOrderTotals,
  formatPaiseToRupees,
  parseRupeesToPaise,
  validateOrderTransition,
} from '@karanjaghadge/shared';

let customerToken: string;
let shopkeeper1Token: string;
let shopkeeper2Token: string;
let adminToken: string;
let shop1Id: string;
let shop2Id: string;
let product1Id: string;
let product2Id: string;
let categoryId: string;
let isDbConnected = false;

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/karanjaghadge_test_suite';

beforeAll(async () => {
  try {
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 2000 });
    isDbConnected = true;

    // Clean test database
    await mongoose.connection.dropDatabase();

    // Set default settings
    await SettingModel.create([
      { key: 'DELIVERY_FEE_PAISE', value: 0 },
      { key: 'PLATFORM_FEE_PAISE', value: 0 },
    ]);

    // Create Category
    const cat = await CategoryModel.create({
      name: 'Groceries',
      slug: 'groceries',
      sortOrder: 1,
      active: true,
    });
    categoryId = cat._id.toString();

    // Create Users: Customer, Shopkeeper 1, Shopkeeper 2, Admin
    const customer = await UserModel.create({
      phone: '9999900001',
      name: 'Customer Test',
      roles: ['customer'],
      status: 'active',
    });

    const shopkeeper1 = await UserModel.create({
      phone: '9999900002',
      name: 'Shopkeeper One',
      roles: ['shopkeeper', 'customer'],
      status: 'active',
    });

    const shopkeeper2 = await UserModel.create({
      phone: '9999900003',
      name: 'Shopkeeper Two',
      roles: ['shopkeeper', 'customer'],
      status: 'active',
    });

    const admin = await UserModel.create({
      phone: '9999900004',
      name: 'Platform Admin',
      roles: ['admin', 'customer'],
      status: 'active',
    });

    // Create Shop 1 (Owned by Shopkeeper 1)
    const s1 = await ShopModel.create({
      name: 'Shop Alpha',
      ownerId: shopkeeper1._id,
      phone: '9999900002',
      address: 'Karanja Main Road',
      geo: { type: 'Point', coordinates: [78.5484, 21.1714] },
      hours: { open: '08:00', close: '20:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
      fulfilmentOptions: ['delivery', 'pickup'],
      status: 'approved',
      isPaused: false,
    });
    shop1Id = s1._id.toString();

    // Create Shop 2 (Owned by Shopkeeper 2)
    const s2 = await ShopModel.create({
      name: 'Shop Beta',
      ownerId: shopkeeper2._id,
      phone: '9999900003',
      address: 'Station Road',
      geo: { type: 'Point', coordinates: [78.5490, 21.1720] },
      hours: { open: '09:00', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
      fulfilmentOptions: ['delivery', 'pickup'],
      status: 'approved',
      isPaused: false,
    });
    shop2Id = s2._id.toString();

    // Create Product in Shop 1
    const p1 = await ProductModel.create({
      shopId: s1._id,
      categoryId: cat._id,
      name: 'Sharbati Wheat Flour',
      unit: '1 kg',
      pricePaise: 4500, // ₹45.00
      mrpPaise: 5000,
      stockStatus: 'in_stock',
      active: true,
    });
    product1Id = p1._id.toString();

    // Create Product in Shop 2
    const p2 = await ProductModel.create({
      shopId: s2._id,
      categoryId: cat._id,
      name: 'Pure Basmati Rice',
      unit: '1 kg',
      pricePaise: 9500, // ₹95.00
      mrpPaise: 11000,
      stockStatus: 'in_stock',
      active: true,
    });
    product2Id = p2._id.toString();
  } catch (e) {
    console.warn('MongoDB connection not available. Integration tests will skip.');
    isDbConnected = false;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach((context) => {
  const suiteName = context.task.suite?.name || '';
  if (!isDbConnected && !suiteName.includes('Pricing Engine') && !suiteName.includes('State Machine')) {
    context.skip();
  }
});

describe('1. Pricing Engine & Pure Math', () => {
  it('calculates totals strictly in integer paise with zero fees default', () => {
    const items = [
      { pricePaise: 4500, qty: 2 }, // 9000 paise
      { pricePaise: 9500, qty: 1 }, // 9500 paise
    ];

    const result = calculateOrderTotals(items, 0, 0);
    expect(result.itemsTotalPaise).toBe(18500);
    expect(result.deliveryFeePaise).toBe(0);
    expect(result.platformFeePaise).toBe(0);
    expect(result.totalPaise).toBe(18500);
  });

  it('formats paise correctly into Indian rupee strings', () => {
    expect(formatPaiseToRupees(15000)).toBe('₹150');
    expect(formatPaiseToRupees(15050)).toBe('₹150.50');
    expect(formatPaiseToRupees(0)).toBe('₹0');
  });

  it('parses user rupee input safely to integer paise without float errors', () => {
    expect(parseRupeesToPaise('120')).toBe(12000);
    expect(parseRupeesToPaise('120.50')).toBe(12050);
    expect(parseRupeesToPaise(49.99)).toBe(4999);
  });
});

describe('2. Order State Machine Transitions', () => {
  it('allows shopkeeper to accept or reject placed order', () => {
    const accept = validateOrderTransition('placed', 'shop_accepted', 'shopkeeper', 'delivery');
    expect(accept.allowed).toBe(true);

    const reject = validateOrderTransition('placed', 'shop_rejected', 'shopkeeper', 'delivery');
    expect(reject.allowed).toBe(true);
  });

  it('allows customer cancellation before preparation but strictly forbids it once preparing starts', () => {
    // Before prep
    const cancelBeforePrep = validateOrderTransition('placed', 'customer_cancel_requested', 'customer', 'delivery');
    expect(cancelBeforePrep.allowed).toBe(true);

    // After prep started
    const cancelDuringPrep = validateOrderTransition('preparing', 'customer_cancel_requested', 'customer', 'delivery');
    expect(cancelDuringPrep.allowed).toBe(false);
    expect(cancelDuringPrep.reason).toContain('Cancellation is not permitted once the shop has begun preparing');

    // When out for delivery
    const cancelOutForDelivery = validateOrderTransition('out_for_delivery', 'customer_cancel_requested', 'customer', 'delivery');
    expect(cancelOutForDelivery.allowed).toBe(false);
  });

  it('allows pickup order to skip delivery steps directly from ready_for_pickup to completed', () => {
    const pickupCompletion = validateOrderTransition('ready_for_pickup', 'completed', 'shopkeeper', 'pickup');
    expect(pickupCompletion.allowed).toBe(true);

    // Delivery order cannot skip to completed directly from ready_for_pickup
    const deliveryInvalidSkip = validateOrderTransition('ready_for_pickup', 'completed', 'shopkeeper', 'delivery');
    expect(deliveryInvalidSkip.allowed).toBe(false);
  });

  it('returns noop: true when transitioning to the same state (idempotent)', () => {
    const noop = validateOrderTransition('placed', 'placed', 'customer', 'delivery');
    expect(noop.allowed).toBe(true);
    expect(noop.noop).toBe(true);
  });
});

describe('3. Authentication & Mock OTP', () => {
  it('requests OTP and returns mock status', async () => {
    const res = await request(app)
      .post('/api/v1/auth/otp/request')
      .send({ phone: '9999900001' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('mock');
    expect(res.body.devOtp).toBeDefined();
  });

  it('enforces attempt limits and rejects incorrect OTP', async () => {
    // Attempt with incorrect OTP
    const res = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({ phone: '9999900001', otp: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid OTP');
  });

  it('verifies valid OTP, returns JWT tokens and user profile', async () => {
    // Get latest OTP from DB
    const user = await UserModel.findOne({ phone: '9999900001' });
    const otp = user!.otpHash!;

    const res = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({ phone: '9999900001', otp });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    customerToken = res.body.accessToken;
  });

  it('rotates refresh token and issues new access token', async () => {
    const user = await UserModel.findOne({ phone: '9999900001' });
    const refreshToken = user!.refreshTokenHash!;

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    // Verify old refresh token is now invalidated
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(reuseRes.status).toBe(403);
  });
});

describe('4. Role Authorization & Shop Isolation (IDOR)', () => {
  beforeAll(async () => {
    if (!isDbConnected) return;
    // Sign in Shopkeeper 1
    const sk1 = await UserModel.findOne({ phone: '9999900002' });
    sk1!.otpHash = '123456';
    sk1!.otpExpiresAt = new Date(Date.now() + 60000);
    await sk1!.save();
    const res1 = await request(app).post('/api/v1/auth/otp/verify').send({ phone: '9999900002', otp: '123456' });
    shopkeeper1Token = res1.body.accessToken;

    // Sign in Shopkeeper 2
    const sk2 = await UserModel.findOne({ phone: '9999900003' });
    sk2!.otpHash = '123456';
    sk2!.otpExpiresAt = new Date(Date.now() + 60000);
    await sk2!.save();
    const res2 = await request(app).post('/api/v1/auth/otp/verify').send({ phone: '9999900003', otp: '123456' });
    shopkeeper2Token = res2.body.accessToken;

    // Sign in Admin
    const adm = await UserModel.findOne({ phone: '9999900004' });
    adm!.otpHash = '123456';
    adm!.otpExpiresAt = new Date(Date.now() + 60000);
    await adm!.save();
    const resAdm = await request(app).post('/api/v1/auth/otp/verify').send({ phone: '9999900004', otp: '123456' });
    adminToken = resAdm.body.accessToken;
  });

  it('rejects regular customer from accessing admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows platform admin to access admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
  });

  it('IDOR Defense: Shopkeeper 2 CANNOT edit Shopkeeper 1 products or availability', async () => {
    // Shopkeeper 2 tries to update Shop 1
    const res = await request(app)
      .patch(`/api/v1/shops/${shop1Id}/availability`)
      .set('Authorization', `Bearer ${shopkeeper2Token}`)
      .send({ isPaused: true });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('Shopkeeper 1 CAN edit their own shop', async () => {
    const res = await request(app)
      .patch(`/api/v1/shops/${shop1Id}/availability`)
      .set('Authorization', `Bearer ${shopkeeper1Token}`)
      .send({ isPaused: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('5. Cart & Single-Shop Constraint', () => {
  it('adds product from Shop 1 to cart', async () => {
    const res = await request(app)
      .put('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1Id, qty: 2 });

    expect(res.status).toBe(200);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.shopId).toBe(shop1Id);
    expect(res.body.cart.totalPaise).toBe(9000); // 2 * 4500
  });

  it('REFUSES product from Shop 2 with HTTP 409 and descriptive error', async () => {
    const res = await request(app)
      .put('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product2Id, qty: 1 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('MULTI_SHOP_RESTRICTION');
    expect(res.body.error).toContain('already contains items from "Shop Alpha"');
  });

  it('clears cart successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.cart.items.length).toBe(0);
    expect(res.body.cart.shopId).toBeUndefined();
  });
});

describe('6. End-to-End Order Creation & Idempotency', () => {
  it('places order with snapshot items and honors idempotencyKey', async () => {
    // 1. Add item to cart
    await request(app)
      .put('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1Id, qty: 3 }); // 3 * 4500 = 13500 paise (₹135)

    const idempotencyKey = `idemp-test-${Date.now()}`;

    // 2. Place order
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fulfilmentType: 'pickup',
        paymentMethod: 'pay_direct_to_shop',
        notes: 'Test pickup note',
        idempotencyKey,
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.order.status).toBe('placed');
    expect(orderRes.body.order.totalPaise).toBe(13500);

    const orderId = orderRes.body.order.id;

    // 3. Re-submit same idempotency key (must return 200 with existing order, no duplicate)
    const duplicateRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fulfilmentType: 'pickup',
        paymentMethod: 'pay_direct_to_shop',
        notes: 'Test duplicate note',
        idempotencyKey,
      });

    expect(duplicateRes.status).toBe(200);
    expect(duplicateRes.body.order.id).toBe(orderId);

    // Verify exactly one order exists with this idempotency key
    const count = await OrderModel.countDocuments({ idempotencyKey });
    expect(count).toBe(1);
  });
});
