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
  if (shopCount >= 10) {
    console.log('[Seed] Database already seeded with 10 shops. Skipping initial seeding.');
    return;
  }
  console.log('[Seed] Database has fewer than 10 shops. Seeding/enriching Karanjaghadge Local dataset...');
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
      email: 'priya.sharma@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
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

  // 4. Categories (10 categories matching all user requirements)
  const categoriesData = [
    { name: 'Groceries & Kirana', slug: 'groceries-kirana', sortOrder: 1, icon: 'ShoppingBag' },
    { name: 'Fresh Vegetables & Fruits', slug: 'vegetables-fruits', sortOrder: 2, icon: 'Carrot' },
    { name: 'Dairy & Milk Products', slug: 'dairy-milk', sortOrder: 3, icon: 'Milk' },
    { name: 'Bakery & Snacks', slug: 'bakery-snacks', sortOrder: 4, icon: 'Cookie' },
    { name: 'Pharmacy & Essentials', slug: 'pharmacy-essentials', sortOrder: 5, icon: 'Pill' },
    { name: 'Crackers & Fireworks', slug: 'fireworks', sortOrder: 6, icon: 'Sparkles' },
    { name: 'Electronics & TV/AC/Fridge', slug: 'electronic', sortOrder: 7, icon: 'Tv' },
    { name: 'Electrical & Lighting', slug: 'electric', sortOrder: 8, icon: 'Zap' },
    { name: 'Clothing & Fashion', slug: 'cloth', sortOrder: 9, icon: 'Shirt' },
    { name: 'Mobiles & Accessories', slug: 'mobile', sortOrder: 10, icon: 'Smartphone' },
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

  // 5. Shops (10 shops for all town commercial categories)
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
    // 6. Crackers & Fireworks Shop
    {
      name: 'Laxmi Fireworks & Crackers Mart',
      ownerId: shopkeeperUser._id,
      description: 'Diwali crackers, rockets, sparklers/phuljhadi, chakri, anar, lad bombs & party fireworks.',
      phone: '9876543211',
      address: 'Nagpur Road, Shivaji Chowk, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5492, 21.1718] as [number, number] },
      categoryIds: [categories['fireworks']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '08:00', close: '22:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    // 7. Electronics Shop (TV, AC, Fridge, Washing Machine)
    {
      name: 'Vijay Electronics & Home Appliances',
      ownerId: shopkeeperUser._id,
      description: 'Smart LED TVs, Inverter Split ACs, Refrigerators, Washing Machines & Kitchen Appliances.',
      phone: '9876543211',
      address: 'Near Bus Stand, Station Road, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5468, 21.1725] as [number, number] },
      categoryIds: [categories['electronic']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '09:00', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    // 8. Electrical & Lighting Shop (Wires, Bulbs, Decorative Lights, Fans)
    {
      name: 'Bharat Electricals & Lighting Hub',
      ownerId: shopkeeperUser._id,
      description: 'Finolex copper wires, Syska LED bulbs, decorative fairy rice lights, fans, and modular switchboards.',
      phone: '9876543211',
      address: 'Shop No. 5, Main Bazaar, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5485, 21.1715] as [number, number] },
      categoryIds: [categories['electric']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '08:30', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    // 9. Cloth & Fashion Shop
    {
      name: 'Royal Cloth Center & Garments',
      ownerId: shopkeeperUser._id,
      description: 'Pure cotton kurtis, traditional Paithani sarees, men denim jeans, shirts & kids festive wear.',
      phone: '9876543211',
      address: 'Kapda Bazaar, Near Gandhi Chowk, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5478, 21.1708] as [number, number] },
      categoryIds: [categories['cloth']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '09:30', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
    },
    // 10. Mobile & Accessories Shop
    {
      name: 'Sai Mobile Care & Gadgets',
      ownerId: shopkeeperUser._id,
      description: '5G smartphones, fast chargers, braided Type-C cables, TWS earbuds, power banks & screen guards.',
      phone: '9876543211',
      address: 'Shop No. 8, Station Road, Karanja (Ghadge)',
      geo: { type: 'Point' as const, coordinates: [78.5505, 21.1712] as [number, number] },
      categoryIds: [categories['mobile']._id],
      status: 'approved' as const,
      isPaused: false,
      fulfilmentOptions: ['delivery' as const, 'pickup' as const],
      hours: { open: '09:00', close: '21:30', daysOpen: [0, 1, 2, 3, 4, 5, 6] },
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
      name: 'Tata Salt Vacuum Evaporated',
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
      description: 'Fresh clean sorting potatoes',
      unit: '1 kg',
      pricePaise: 2500, // ₹25
      mrpPaise: 3000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
    },

    // Shop 3: Shri Krishna Dairy
    {
      shopId: createdShops[2]._id,
      categoryId: categories['dairy-milk']._id,
      name: 'Fresh Buffalo Milk',
      description: 'Thick pasteurized whole buffalo milk',
      unit: '1 L',
      pricePaise: 6800, // ₹68
      mrpPaise: 7000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
    },
    {
      shopId: createdShops[2]._id,
      categoryId: categories['dairy-milk']._id,
      name: 'Fresh Malai Paneer',
      description: 'Soft cow milk cottage cheese block',
      unit: '250 g',
      pricePaise: 11000, // ₹110
      mrpPaise: 12000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'],
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

    // Shop 6: Laxmi Fireworks & Crackers Mart
    {
      shopId: createdShops[5]._id,
      categoryId: categories['fireworks']._id,
      name: '1000 Lad Crackers Garland',
      description: 'Loud traditional red garland crackers box',
      unit: '1 Box',
      pricePaise: 38000, // ₹380
      mrpPaise: 45000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400'],
    },
    {
      shopId: createdShops[5]._id,
      categoryId: categories['fireworks']._id,
      name: 'Special Peacock Sparklers (Phuljhadi)',
      description: 'Bright multi-colour low-smoke sparklers (pack of 10)',
      unit: '10 Pcs',
      pricePaise: 12000, // ₹120
      mrpPaise: 15000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400'],
    },
    {
      shopId: createdShops[5]._id,
      categoryId: categories['fireworks']._id,
      name: 'Colorful Ground Spinners (Chakri)',
      description: 'Fast-spinning bright green & red ground chakri',
      unit: '10 Pcs',
      pricePaise: 18000, // ₹180
      mrpPaise: 22000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1533230393619-3fdd70b4f8fb?w=400'],
    },
    {
      shopId: createdShops[5]._id,
      categoryId: categories['fireworks']._id,
      name: 'Flower Pots Special (Anar)',
      description: 'High fountain sparkling silver & golden anar',
      unit: '10 Pcs',
      pricePaise: 22000, // ₹220
      mrpPaise: 28000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400'],
    },
    {
      shopId: createdShops[5]._id,
      categoryId: categories['fireworks']._id,
      name: '12 Shot Sky Shots Multi-Color',
      description: 'Aerial repeating shots with sparkling glitter bursts',
      unit: '1 Box',
      pricePaise: 65000, // ₹650
      mrpPaise: 80000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400'],
    },

    // Shop 7: Vijay Electronics & Home Appliances (TV, AC, Fridge)
    {
      shopId: createdShops[6]._id,
      categoryId: categories['electronic']._id,
      name: '32-inch Smart HD LED TV',
      description: 'Frameless display, Dolby Audio, Netflix/YouTube preloaded',
      unit: '1 Unit',
      pricePaise: 1199900, // ₹11,999
      mrpPaise: 1499900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'],
    },
    {
      shopId: createdShops[6]._id,
      categoryId: categories['electronic']._id,
      name: '1.5 Ton 3-Star Inverter Split AC',
      description: 'Fast cooling 4-way swing, 100% copper condenser',
      unit: '1 Unit',
      pricePaise: 3149900, // ₹31,499
      mrpPaise: 3699900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400'],
    },
    {
      shopId: createdShops[6]._id,
      categoryId: categories['electronic']._id,
      name: '190L Direct Cool Single Door Refrigerator (Fridge)',
      description: 'Toughened glass shelves, fast ice making, 4-star efficiency',
      unit: '1 Unit',
      pricePaise: 1450000, // ₹14,500
      mrpPaise: 1699000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400'],
    },
    {
      shopId: createdShops[6]._id,
      categoryId: categories['electronic']._id,
      name: '7 kg Semi-Automatic Washing Machine',
      description: 'Roller jet pulsator, lint filter, rust-free plastic body',
      unit: '1 Unit',
      pricePaise: 899000, // ₹8,990
      mrpPaise: 1099000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400'],
    },
    {
      shopId: createdShops[6]._id,
      categoryId: categories['electronic']._id,
      name: 'Heavy Dry Iron 1000W',
      description: 'Non-stick American Heritage soleplate with thermal fuse',
      unit: '1 Unit',
      pricePaise: 64900, // ₹649
      mrpPaise: 85000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400'],
    },

    // Shop 8: Bharat Electricals & Lighting Hub (Wires, Bulbs, Lighting, Fans)
    {
      shopId: createdShops[7]._id,
      categoryId: categories['electric']._id,
      name: 'Finolex 1.5 sq mm Copper Wire (90m Roll)',
      description: 'Flame retardant multi-strand PVC insulated industrial wire',
      unit: '90m Roll',
      pricePaise: 185000, // ₹1,850
      mrpPaise: 220000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400'],
    },
    {
      shopId: createdShops[7]._id,
      categoryId: categories['electric']._id,
      name: 'Syska 9W B22 Cool Daylight LED Bulb (Pack of 2)',
      description: 'Energy saving high lumen LED bulb, 1-year replacement warranty',
      unit: 'Pack of 2',
      pricePaise: 14900, // ₹149
      mrpPaise: 22000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1550524514-9b9354784a0a?w=400'],
    },
    {
      shopId: createdShops[7]._id,
      categoryId: categories['electric']._id,
      name: '50m Festive Decorative Fairy Rice Lights',
      description: 'Warm golden yellow series lighting string for home & pooja decoration',
      unit: '50m Roll',
      pricePaise: 18000, // ₹180
      mrpPaise: 25000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400'],
    },
    {
      shopId: createdShops[7]._id,
      categoryId: categories['electric']._id,
      name: 'Havells 1200mm High-Speed Ceiling Fan',
      description: 'Double ball bearing, rust-free aluminium blades with high air delivery',
      unit: '1 Unit',
      pricePaise: 215000, // ₹2,150
      mrpPaise: 260000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400'],
    },
    {
      shopId: createdShops[7]._id,
      categoryId: categories['electric']._id,
      name: 'Anchor 6-Socket Surge Protector Extension Board',
      description: 'Heavy duty 2m cord with master switch & overload reset circuit breaker',
      unit: '1 Unit',
      pricePaise: 39900, // ₹399
      mrpPaise: 55000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400'],
    },

    // Shop 9: Royal Cloth Center & Garments
    {
      shopId: createdShops[8]._id,
      categoryId: categories['cloth']._id,
      name: 'Pure Cotton Printed Kurti for Women',
      description: 'Soft breathable cotton with elegant floral print (Size M/L/XL)',
      unit: '1 Piece',
      pricePaise: 49900, // ₹499
      mrpPaise: 79900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=400'],
    },
    {
      shopId: createdShops[8]._id,
      categoryId: categories['cloth']._id,
      name: 'Traditional Paithani Silk Saree',
      description: 'Grand peacock border design with matching unstitched blouse piece',
      unit: '1 Saree',
      pricePaise: 185000, // ₹1,850
      mrpPaise: 240000,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
    },
    {
      shopId: createdShops[8]._id,
      categoryId: categories['cloth']._id,
      name: 'Men Slim Fit Stretch Denim Jeans',
      description: 'Durable stretch denim with 5-pocket styling and brass rivets',
      unit: '1 Pair',
      pricePaise: 89900, // ₹899
      mrpPaise: 129900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=400'],
    },
    {
      shopId: createdShops[8]._id,
      categoryId: categories['cloth']._id,
      name: 'Men Cotton Casual Formal Shirt',
      description: 'Premium combed cotton regular fit shirt with spread collar',
      unit: '1 Shirt',
      pricePaise: 54900, // ₹549
      mrpPaise: 79900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'],
    },

    // Shop 10: Sai Mobile Care & Gadgets
    {
      shopId: createdShops[9]._id,
      categoryId: categories['mobile']._id,
      name: '5G Smartphone 6GB RAM / 128GB Storage',
      description: '50MP AI Camera, 5000mAh Battery with 33W Turbo Charging',
      unit: '1 Phone',
      pricePaise: 1249900, // ₹12,499
      mrpPaise: 1499900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
    },
    {
      shopId: createdShops[9]._id,
      categoryId: categories['mobile']._id,
      name: '65W Super Fast Charging Adapter with Type-C',
      description: 'GaN technology charger compatible with all Android & iOS devices',
      unit: '1 Unit',
      pricePaise: 69900, // ₹699
      mrpPaise: 99900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'],
    },
    {
      shopId: createdShops[9]._id,
      categoryId: categories['mobile']._id,
      name: 'Braided Fast Charging Type-C Cable (1.2m)',
      description: 'Nylon tangle-free 3A fast charging data sync cable',
      unit: '1 Cable',
      pricePaise: 19900, // ₹199
      mrpPaise: 34900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1596742578443-7682ef5251cd?w=400'],
    },
    {
      shopId: createdShops[9]._id,
      categoryId: categories['mobile']._id,
      name: 'Wireless TWS Bluetooth Earbuds with ANC',
      description: 'Active Noise Cancellation, 36hr battery backup with gaming low-latency mode',
      unit: '1 Pair',
      pricePaise: 129900, // ₹1,299
      mrpPaise: 199900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
    },
    {
      shopId: createdShops[9]._id,
      categoryId: categories['mobile']._id,
      name: '10000mAh Power Bank Fast Charge',
      description: 'Dual USB output with Type-C two-way fast charging pocket power bank',
      unit: '1 Unit',
      pricePaise: 89900, // ₹899
      mrpPaise: 129900,
      stockStatus: 'in_stock' as const,
      active: true,
      imageKeys: ['https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=400'],
    },
  ];

  for (const prod of productsData) {
    await ProductModel.findOneAndUpdate(
      { shopId: prod.shopId, name: prod.name },
      prod,
      { upsert: true }
    );
  }

  console.log(`[Seed] Database successfully seeded with ${createdShops.length} shops, 10 categories, ${productsData.length} products!`);
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
