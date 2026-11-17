import mongoose from 'mongoose';
import {
  UserModel,
  ShopModel,
  ShopMembershipModel,
  CategoryModel,
  ProductModel,
  SettingModel,
  ServiceAreaModel,
  AddressModel,
} from '../models/index.js';
import { DEFAULT_SETTINGS, DEFAULT_SERVICE_AREA } from '@karanjaghadge/shared';

export async function autoSeedIfEmpty() {
  const shopCount = await ShopModel.countDocuments();
  if (shopCount > 0) {
    console.log('[Seed] Database already seeded. Skipping initial seeding.');
    return;
  }
  console.log('[Seed] Database is empty. Seeding Karanjaghadge Local pilot dataset...');
  await seedDatabase();
}

export async function seedDatabase() {
  // 1. Settings (All fees 0 as mandated)
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await SettingModel.findOneAndUpdate(
      { key },
      { key, value, description: `System setting for ${key}` },
      { upsert: true }
    );
  }

  // 2. Service Area
  await ServiceAreaModel.findOneAndUpdate(
    { name: DEFAULT_SERVICE_AREA.name },
    {
      name: DEFAULT_SERVICE_AREA.name,
      centreGeo: {
        type: 'Point',
        coordinates: [DEFAULT_SERVICE_AREA.longitude, DEFAULT_SERVICE_AREA.latitude],
      },
      radiusKm: DEFAULT_SERVICE_AREA.radiusKm,
      active: true,
      deliveryFeePaise: 0,
    },
    { upsert: true }
  );

  // 3. Test Users
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h validity for easy test login
  const devDefaultOtp = '123456';

  const adminUser = await UserModel.findOneAndUpdate(
    { phone: '9876543213' },
    {
      phone: '9876543213',
      name: 'Platform Admin',
      roles: ['admin', 'customer'],
      status: 'active',
      otpHash: devDefaultOtp,
      otpExpiresAt: otpExpiry,
      otpAttempts: 0,
    },
    { upsert: true, new: true }
  );

  const shopkeeperUser = await UserModel.findOneAndUpdate(
    { phone: '9876543211' },
    {
      phone: '9876543211',
      name: 'Ramesh Ghadge',
      roles: ['shopkeeper', 'customer'],
      status: 'active',
      otpHash: devDefaultOtp,
      otpExpiresAt: otpExpiry,
      otpAttempts: 0,
    },
    { upsert: true, new: true }
  );

  const deliveryUser = await UserModel.findOneAndUpdate(
    { phone: '9876543212' },
    {
      phone: '9876543212',
      name: 'Sunil Wankhede (Rider)',
      roles: ['delivery_partner', 'customer'],
      status: 'active',
      otpHash: devDefaultOtp,
      otpExpiresAt: otpExpiry,
      otpAttempts: 0,
    },
    { upsert: true, new: true }
  );

  const customerUser = await UserModel.findOneAndUpdate(
    { phone: '9876543210' },
    {
      phone: '9876543210',
      name: 'Priya Sharma',
      roles: ['customer'],
      status: 'active',
      otpHash: devDefaultOtp,
      otpExpiresAt: otpExpiry,
      otpAttempts: 0,
    },
    { upsert: true, new: true }
  );

  // Seed Customer Address
  await AddressModel.findOneAndUpdate(
    { userId: customerUser._id },
    {
      userId: customerUser._id,
      label: 'Home',
      line: 'House No. 42, Ward No. 3, Shivaji Chowk',
      landmark: 'Near Hanuman Temple',
      pincode: '442203',
      geo: {
        type: 'Point',
        coordinates: [78.5490, 21.1720],
      },
      isDefault: true,
    },
    { upsert: true }
  );

  // 4. Categories
  const categoriesData = [
    { name: 'Groceries & Kirana', slug: 'groceries-kirana', sortOrder: 1, icon: 'ShoppingBag' },
    { name: 'Fresh Vegetables & Fruits', slug: 'vegetables-fruits', sortOrder: 2, icon: 'Carrot' },
    { name: 'Dairy & Milk Products', slug: 'dairy-milk', sortOrder: 3, icon: 'Milk' },
    { name: 'Bakery & Snacks', slug: 'bakery-snacks', sortOrder: 4, icon: 'Cookie' },
    { name: 'Pharmacy & Essentials', slug: 'pharmacy-essentials', sortOrder: 5, icon: 'Pill' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const saved = await CategoryModel.findOneAndUpdate(
      { slug: cat.slug },
      { ...cat, active: true },
      { upsert: true, new: true }
    );
    categories[cat.slug] = saved;
  }

  // 5. Shops
  const shopsData = [
    {
      name: 'Mahaveer Kirana & General Stores',
      ownerId: shopkeeperUser._id,
      description: 'Daily fresh pulses, spices, oils, grains and packaged groceries.',
      phone: '9876543211',
      address: 'Shop No. 12, Main Bazaar, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5475, 21.1710] as [number, number] },
      categoryIds: [categories['groceries-kirana']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '08:00', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    {
      name: 'Ghadge Farm Fresh Vegetables',
      ownerId: shopkeeperUser._id,
      description: 'Farm-picked vegetables directly from local Karanja growers.',
      phone: '9876543211',
      address: 'Near Old Bus Stand, Wardha Road, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5460, 21.1730] as [number, number] },
      categoryIds: [categories['vegetables-fruits']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '07:30', close: '20:30', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    {
      name: 'Shri Krishna Dairy & Sweets',
      ownerId: shopkeeperUser._id,
      description: 'Pure buffalo milk, fresh cow milk, paneer, curd, and homemade ghee.',
      phone: '9876543211',
      address: 'Station Road Chowk, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5501, 21.1705] as [number, number] },
      categoryIds: [categories['dairy-milk']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '06:30', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    {
      name: 'Gurukrupa Bakery & Namkeen',
      ownerId: shopkeeperUser._id,
      description: 'Oven-fresh bread, pav, rusk, cookies, and traditional namkeen.',
      phone: '9876543211',
      address: 'Opposite State Bank of India, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5480, 21.1722] as [number, number] },
      categoryIds: [categories['bakery-snacks']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '08:00', close: '21:30', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    {
      name: 'Sanjeevani Medical & General Store',
      ownerId: shopkeeperUser._id,
      description: 'OTC essentials, first aid, baby care, and health supplements.',
      phone: '9876543211',
      address: 'Opposite Primary Health Center, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5495, 21.1740] as [number, number] },
      categoryIds: [categories['pharmacy-essentials']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '08:30', close: '22:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
  ];

  const createdShops: any[] = [];
  for (const s of shopsData) {
    const shop = await ShopModel.findOneAndUpdate(
      { name: s.name },
      s,
      { upsert: true, new: true }
    );
    createdShops.push(shop);

    await ShopMembershipModel.findOneAndUpdate(
      { shopId: shop._id, userId: shopkeeperUser._id },
      { shopId: shop._id, userId: shopkeeperUser._id, role: 'owner' },
      { upsert: true }
    );
  }

  // 6. Products per Shop (All prices strictly integer paise)
  const productsData = [
    // Shop 1: Mahaveer Kirana
    {
      shopId: createdShops[0]._id,
      categoryId: categories['groceries-kirana']._id,
      name: 'Sharbati Whole Wheat Atta',
      description: 'Stone ground premium wheat flour',
      unit: '5 kg',
      pricePaise: 21000, // ₹210
      mrpPaise: 23500,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
    },
    {
      shopId: createdShops[0]._id,
      categoryId: categories['groceries-kirana']._id,
      name: 'Desi Toor Dal (Polished)',
      description: 'Clean unadulterated toor dal',
      unit: '1 kg',
      pricePaise: 15500, // ₹155
      mrpPaise: 17000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1585994192701-f10f8231c08e?w=400'],
    },
    {
      shopId: createdShops[0]._id,
      categoryId: categories['groceries-kirana']._id,
      name: 'Fortune Sunlite Refined Sunflower Oil',
      description: 'Pure cooking oil pouch',
      unit: '1 L',
      pricePaise: 14000, // ₹140
      mrpPaise: 15000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'],
    },
    {
      shopId: createdShops[0]._id,
      categoryId: categories['groceries-kirana']._id,
      name: 'Tata Salt Vaccum Evaporated',
      description: 'Iodized table salt',
      unit: '1 kg',
      pricePaise: 2800, // ₹28
      mrpPaise: 3000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400'],
    },

    // Shop 2: Ghadge Farm Fresh
    {
      shopId: createdShops[1]._id,
      categoryId: categories['vegetables-fruits']._id,
      name: 'Fresh Red Onions (Kanda)',
      description: 'Local harvest crisp onions',
      unit: '1 kg',
      pricePaise: 3500, // ₹35
      mrpPaise: 4000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400'],
    },
    {
      shopId: createdShops[1]._id,
      categoryId: categories['vegetables-fruits']._id,
      name: 'Farm Potatoes (Batata)',
      description: 'Medium size fresh farm potatoes',
      unit: '1 kg',
      pricePaise: 3000, // ₹30
      mrpPaise: 3500,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
    },
    {
      shopId: createdShops[1]._id,
      categoryId: categories['vegetables-fruits']._id,
      name: 'Ripe Country Tomatoes',
      description: 'Juicy desi tomatoes',
      unit: '1 kg',
      pricePaise: 2500, // ₹25
      mrpPaise: 3000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
    },

    // Shop 3: Shri Krishna Dairy
    {
      shopId: createdShops[2]._id,
      categoryId: categories['dairy-milk']._id,
      name: 'Fresh Pure Cow Milk',
      description: 'Morning fresh cow milk pouch',
      unit: '1 L',
      pricePaise: 6000, // ₹60
      mrpPaise: 6000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
    },
    {
      shopId: createdShops[2]._id,
      categoryId: categories['dairy-milk']._id,
      name: 'Fresh Malai Paneer',
      description: 'Soft cottage cheese made daily',
      unit: '250 g',
      pricePaise: 11000, // ₹110
      mrpPaise: 12000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'],
    },
    {
      shopId: createdShops[2]._id,
      categoryId: categories['dairy-milk']._id,
      name: 'Desi Cow Ghee (Danedar)',
      description: 'Traditional bilona aroma ghee',
      unit: '500 g',
      pricePaise: 34000, // ₹340
      mrpPaise: 36000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400'],
    },

    // Shop 4: Gurukrupa Bakery
    {
      shopId: createdShops[3]._id,
      categoryId: categories['bakery-snacks']._id,
      name: 'Fresh Pav (Ladi)',
      description: 'Soft fluffy bakery pav (pack of 6)',
      unit: '1 Pack',
      pricePaise: 2500, // ₹25
      mrpPaise: 2500,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
    },
    {
      shopId: createdShops[3]._id,
      categoryId: categories['bakery-snacks']._id,
      name: 'Elaichi Wheat Toast Rusk',
      description: 'Crispy cardamom tea toast',
      unit: '250 g',
      pricePaise: 4500, // ₹45
      mrpPaise: 5000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'],
    },

    // Shop 5: Sanjeevani Medical
    {
      shopId: createdShops[4]._id,
      categoryId: categories['pharmacy-essentials']._id,
      name: 'Dolo 650mg Paracetamol Tablets',
      description: 'Strip of 15 tablets for fever & body pain',
      unit: '15 Tablets',
      pricePaise: 3200, // ₹32
      mrpPaise: 3500,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'],
    },
    {
      shopId: createdShops[4]._id,
      categoryId: categories['pharmacy-essentials']._id,
      name: 'Dettol Antiseptic Liquid',
      description: 'First aid and disinfection liquid',
      unit: '125 ml',
      pricePaise: 9000, // ₹90
      mrpPaise: 9500,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400'],
    },
  ];

  for (const prod of productsData) {
    await ProductModel.findOneAndUpdate(
      { shopId: prod.shopId, name: prod.name },
      prod,
      { upsert: true }
    );
  }

  console.log('[Seed] Database successfully seeded with 5 shops, categories, products, and 4 test users!');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  import('./connection.js').then(async ({ connectDB, disconnectDB }) => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error('[Seed Error]:', e);
      process.exit(1);
    }
  });
}
