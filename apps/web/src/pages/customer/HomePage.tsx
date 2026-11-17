import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { Search, ChevronRight, Clock, Star, Plus, Minus, ArrowRight, Check, SlidersHorizontal } from 'lucide-react';

interface HomePageProps {
  onSelectShop: (shopId: string) => void;
  onNavigateShops: () => void;
  onNavigateSearch: () => void;
  onNavigateCart?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectShop,
  onNavigateShops,
  onNavigateSearch,
  onNavigateCart,
}) => {
  const { cart, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Expanded local products covering all local Karanja market categories
  const popularProducts = [
    // 1. Vegetables & Fresh Produce
    {
      id: 'prod-1',
      categoryId: 'veg',
      shopId: 'shop-gupta',
      shopName: 'Gupta Fresh Mart',
      name: 'Fresh Red Tomatoes',
      unit: '500 g',
      price: 36,
      mrp: 45,
      badge: '20% off',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-3',
      categoryId: 'veg',
      shopId: 'shop-gupta',
      shopName: 'Gupta Fresh Mart',
      name: 'Seasonal Veggie Box',
      unit: '1 pack',
      price: 149,
      mrp: 189,
      badge: 'Bestseller',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      image: '/images/fresh_basket.jpg',
    },

    // 2. Dairy
    {
      id: 'prod-2',
      categoryId: 'dairy',
      shopId: 'shop-morning',
      shopName: 'Morning Dairy',
      name: 'Farm Fresh Milk',
      unit: '1 L',
      price: 62,
      mrp: 66,
      badge: 'Fresh',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    },

    // 3. Cloth & Fashion
    {
      id: 'prod-c1',
      categoryId: 'cloth',
      shopId: 'shop-ganesh-cloth',
      shopName: 'Shree Ganesh Cloth Center',
      name: 'Pure Cotton Casual Shirt',
      unit: 'Size M / L / XL',
      price: 499,
      mrp: 699,
      badge: 'Trending',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-c2',
      categoryId: 'cloth',
      shopId: 'shop-ganesh-cloth',
      shopName: 'Shree Ganesh Cloth Center',
      name: 'Traditional Paithani Silk Saree',
      unit: '1 piece with blouse',
      price: 1250,
      mrp: 1699,
      badge: 'Festive',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
    },

    // 4. Mobile & Accessories
    {
      id: 'prod-m1',
      categoryId: 'mobile',
      shopId: 'shop-sai-mobile',
      shopName: 'Sai Mobile Care & Gadgets',
      name: 'Fast Type-C Fast Charger (33W)',
      unit: '1 adapter + cable',
      price: 349,
      mrp: 599,
      badge: 'Fast charge',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-m2',
      categoryId: 'mobile',
      shopId: 'shop-sai-mobile',
      shopName: 'Sai Mobile Care & Gadgets',
      name: 'Universal Magnetic Mobile Cover',
      unit: 'All models available',
      price: 149,
      mrp: 299,
      badge: 'Protection',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80',
    },

    // 5. Electric (Wire, Bulb, Lighting)
    {
      id: 'prod-e1',
      categoryId: 'electric',
      shopId: 'shop-pawan-electric',
      shopName: 'Pawan Electricals',
      name: 'Havells 9W LED Cool Bulb',
      unit: 'Pack of 2 bulbs',
      price: 160,
      mrp: 220,
      badge: '1 yr warranty',
      badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-e2',
      categoryId: 'electric',
      shopId: 'shop-pawan-electric',
      shopName: 'Pawan Electricals',
      name: 'Polycab 1.5 sq mm Copper Wire',
      unit: '10 meter coil',
      price: 380,
      mrp: 460,
      badge: 'FR Grade',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-e3',
      categoryId: 'electric',
      shopId: 'shop-pawan-electric',
      shopName: 'Pawan Electricals',
      name: 'Festive Decorative Fairy Lighting',
      unit: '15 meter roll (Multi)',
      price: 120,
      mrp: 180,
      badge: 'Festival',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&auto=format&fit=crop&q=80',
    },

    // 6. Electronic (TV, AC, Fridge)
    {
      id: 'prod-el1',
      categoryId: 'electronic',
      shopId: 'shop-mahalaxmi-el',
      shopName: 'Mahalaxmi Electronics',
      name: 'Samsung 32" HD Smart LED TV',
      unit: '1 unit • Free install',
      price: 12490,
      mrp: 15900,
      badge: 'Smart TV',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-el2',
      categoryId: 'electronic',
      shopId: 'shop-mahalaxmi-el',
      shopName: 'Mahalaxmi Electronics',
      name: 'Voltas 1.5 Ton Inverter Split AC',
      unit: 'Copper condenser',
      price: 31990,
      mrp: 38500,
      badge: '3 Star Rating',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      image: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-el3',
      categoryId: 'electronic',
      shopId: 'shop-mahalaxmi-el',
      shopName: 'Mahalaxmi Electronics',
      name: 'Whirlpool 192L Refrigerator (Fridge)',
      unit: 'Single door • Direct cool',
      price: 14990,
      mrp: 17990,
      badge: 'Top seller',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&auto=format&fit=crop&q=80',
    },

    // 7. Fireworks & Crackers
    {
      id: 'prod-f1',
      categoryId: 'fireworks',
      shopId: 'shop-utsav-fireworks',
      shopName: 'Utsav Fireworks',
      name: 'Electric Sparklers (Fuljhadi)',
      unit: 'Pack of 10 boxes',
      price: 180,
      mrp: 250,
      badge: 'Green cracker',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      image: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-f2',
      categoryId: 'fireworks',
      shopId: 'shop-utsav-fireworks',
      shopName: 'Utsav Fireworks',
      name: 'Special Ground Chakri (Spinners)',
      unit: 'Box of 10 chakris',
      price: 160,
      mrp: 220,
      badge: 'High spin',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80',
    },

    // 8. Bakery
    {
      id: 'prod-4',
      categoryId: 'bakery',
      shopId: 'shop-bread',
      shopName: 'The Bread House',
      name: 'Artisan Soft Bread',
      unit: '400 g',
      price: 75,
      mrp: 90,
      badge: 'Baked today',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Verified shops from across Karanja market
  const shops = [
    {
      id: 'shop-gupta',
      categoryId: 'veg',
      name: 'Gupta Fresh Mart',
      category: 'Grocery & fresh vegetables',
      rating: '4.8',
      time: '18–24 min',
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-morning',
      categoryId: 'dairy',
      name: 'Morning Dairy',
      category: 'Milk, paneer & daily dairy',
      rating: '4.7',
      time: '12–18 min',
      distance: '1.1 km',
      image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-ganesh-cloth',
      categoryId: 'cloth',
      name: 'Shree Ganesh Cloth Center',
      category: 'Shirts, cotton wear & sarees',
      rating: '4.9',
      time: '20–30 min',
      distance: '0.6 km',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-sai-mobile',
      categoryId: 'mobile',
      name: 'Sai Mobile Care & Gadgets',
      category: 'Mobile accessories, chargers & covers',
      rating: '4.8',
      time: '15–25 min',
      distance: '0.9 km',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-pawan-electric',
      categoryId: 'electric',
      name: 'Pawan Electricals',
      category: 'Wires, LED bulbs & decorative lighting',
      rating: '4.8',
      time: '20–25 min',
      distance: '1.2 km',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-mahalaxmi-el',
      categoryId: 'electronic',
      name: 'Mahalaxmi Electronics',
      category: 'Smart TV, Inverter AC & Refrigerators',
      rating: '4.9',
      time: '30–45 min',
      distance: '1.5 km',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-utsav-fireworks',
      categoryId: 'fireworks',
      name: 'Utsav Fireworks & Crackers',
      category: 'Sparklers, ground chakri & festive fireworks',
      rating: '4.8',
      time: '15–20 min',
      distance: '1.0 km',
      image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-bread',
      categoryId: 'bakery',
      name: 'The Bread House',
      category: 'Fresh bakery & bread',
      rating: '4.6',
      time: '25–30 min',
      distance: '1.4 km',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // All 10 Categories with distinct colors, cute icons & tags
  const categories = [
    { id: 'all', label: 'All', emoji: '✨', bg: 'bg-[#f0fdf4]' },
    { id: 'cloth', label: 'Cloth', emoji: '👕', bg: 'bg-[#fdf4ff]' },
    { id: 'mobile', label: 'Mobile', emoji: '📱', bg: 'bg-[#f0f9ff]' },
    { id: 'electric', label: 'Electric', emoji: '💡', bg: 'bg-[#fefce8]' },
    { id: 'electronic', label: 'Electronic', emoji: '📺', bg: 'bg-[#eef2ff]' },
    { id: 'fireworks', label: 'Fireworks', emoji: '🎆', bg: 'bg-[#fff7ed]' },
    { id: 'veg', label: 'Vegetables', emoji: '🥬', bg: 'bg-[#ecf7ee]' },
    { id: 'dairy', label: 'Dairy', emoji: '🥛', bg: 'bg-[#eff6ff]' },
    { id: 'grocery', label: 'Grocery', emoji: '🛒', bg: 'bg-[#f5f3ff]' },
    { id: 'bakery', label: 'Bakery', emoji: '🥐', bg: 'bg-[#fffbeb]' },
  ];

  const getItemQty = (id: string) => {
    const item = cart?.items.find((i) => i.productId === id);
    return item?.qty || 0;
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-24 font-sans select-none">
      
      {/* 1. Rounded Pill Search Bar */}
      <div>
        <button
          onClick={onNavigateSearch}
          className="w-full h-12 bg-white border border-[#e2e8f0] rounded-[20px] px-4 flex items-center justify-between text-xs text-slate-400 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-medium">Search products or shops</span>
          </div>
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 2. Hero Promo Card (Green banner with basket and orange button) */}
      <div className="relative bg-[#155a34] rounded-[24px] p-5 text-white overflow-hidden shadow-sm">
        {/* Subtle decorative curved pattern */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-[20px] border-white/10 pointer-events-none" />

        {/* Circular cropped vegetable basket on right */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-lg pointer-events-none">
          <img
            src="/images/fresh_basket.jpg"
            alt="Fresh produce"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[210px] space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
            LOCAL & FRESH
          </div>
          <h2 className="text-[20px] font-extrabold tracking-tight leading-snug">
            Your town’s best, at your doorstep.
          </h2>
          <p className="text-[11px] text-white/80 font-normal pb-1">
            Up to 25% off on your first order
          </p>
          <button
            onClick={onNavigateShops}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-bold text-xs rounded-full shadow-sm transition cursor-pointer"
          >
            <span>Shop now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Shop by category (Scrollable Pill Slider) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#111827]">Shop by category</h3>
            {selectedCategory && selectedCategory !== 'all' && (
              <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full capitalize">
                {categories.find((c) => c.id === selectedCategory)?.label}
              </span>
            )}
          </div>
          {selectedCategory && selectedCategory !== 'all' ? (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-[#1b5e39] hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          ) : (
            <button
              onClick={onNavigateShops}
              className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>See all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Category Scroll Slider */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id || (!selectedCategory && cat.id === 'all');
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                className="flex flex-col items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 w-16"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${cat.bg} border-2 ${
                    isSelected
                      ? 'border-[#1b5e39] shadow-sm ring-2 ring-[#1b5e39]/25 scale-105'
                      : 'border-slate-100 hover:border-slate-200'
                  } flex items-center justify-center text-2xl shadow-xs transition`}
                >
                  {cat.emoji}
                </div>
                <span
                  className={`text-[10px] font-semibold text-center leading-tight truncate max-w-full ${
                    isSelected ? 'text-[#1b5e39] font-bold' : 'text-slate-600'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Feature Badges Strip (Fast delivery, Local stores, Quality checked) */}
      <div className="bg-[#fffbf5] border border-[#fef3c7] rounded-[18px] py-2.5 px-3 flex items-center justify-around text-[11px] font-semibold text-[#78350f]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#b45309]" />
          <span>Fast delivery</span>
        </div>
        <span className="text-amber-200">|</span>
        <div className="flex items-center gap-1.5">
          <span>🏪</span>
          <span>Local stores</span>
        </div>
        <span className="text-amber-200">|</span>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-[#1b5e39]" />
          <span>Quality checked</span>
        </div>
      </div>

      {/* 5. Shops near you */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#111827]">
            {selectedCategory && selectedCategory !== 'all'
              ? `${categories.find((c) => c.id === selectedCategory)?.label} Stores`
              : 'Shops near you'}
          </h3>
          <button
            onClick={onNavigateShops}
            className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {(selectedCategory && selectedCategory !== 'all'
            ? shops.filter((s) => s.categoryId === selectedCategory)
            : shops
          ).slice(0, 4).map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#111827]">{shop.name}</h4>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {shop.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">{shop.category}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{shop.time}</span>
                    <span>•</span>
                    <span>{shop.distance}</span>
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Popular around you (2-column product grid) */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">
          {selectedCategory && selectedCategory !== 'all'
            ? `${categories.find((c) => c.id === selectedCategory)?.label} Items`
            : 'Popular around you'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(selectedCategory && selectedCategory !== 'all'
            ? popularProducts.filter((p) => p.categoryId === selectedCategory)
            : popularProducts
          ).map((p) => {
            const qty = getItemQty(p.id);
            return (
              <div
                key={p.id}
                className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Image with Tag badge */}
                  <div className="relative h-28 rounded-xl bg-slate-50 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${p.badgeColor}`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium">{p.unit}</div>
                  <h4 className="text-xs font-bold text-[#111827] line-clamp-1 leading-tight mt-0.5">
                    {p.name}
                  </h4>
                </div>

                {/* Price and Stepper/Add Button */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-[#111827]">₹{p.price}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="text-[10px] text-slate-400 line-through ml-1">
                        ₹{p.mrp}
                      </span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => {
                        updateQuantity(p.id, 1, {
                          name: p.name,
                          unit: p.unit,
                          pricePaise: p.price * 100,
                          shopId: p.shopId,
                          shopName: shops.find((s) => s.id === p.shopId)?.name || 'Gupta Fresh Mart',
                          image: p.image,
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl border-2 border-[#1b5e39] text-[#1b5e39] hover:bg-[#1b5e39] hover:text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#1b5e39] text-white rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs">
                      <button
                        onClick={() =>
                          updateQuantity(p.id, qty - 1, {
                            name: p.name,
                            unit: p.unit,
                            pricePaise: p.price * 100,
                            shopId: p.shopId,
                            shopName: shops.find((s) => s.id === p.shopId)?.name || 'Gupta Fresh Mart',
                            image: p.image,
                          })
                        }
                        className="hover:opacity-80 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[14px] text-center font-bold">{qty}</span>
                      <button
                        onClick={() =>
                          updateQuantity(p.id, qty + 1, {
                            name: p.name,
                            unit: p.unit,
                            pricePaise: p.price * 100,
                            shopId: p.shopId,
                            shopName: shops.find((s) => s.id === p.shopId)?.name || 'Gupta Fresh Mart',
                            image: p.image,
                          })
                        }
                        className="hover:opacity-80 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
