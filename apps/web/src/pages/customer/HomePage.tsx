import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { Search, ChevronRight, Clock, Star, Plus, Minus, ArrowRight, Check, SlidersHorizontal } from 'lucide-react';
import { AddToCartModal, AddedProductItem } from '../../components/AddToCartModal.js';

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
  const [addedModalProduct, setAddedModalProduct] = useState<AddedProductItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Initial mockup products matching Figma design
  const popularProducts = [
    {
      id: 'prod-1',
      shopId: 'shop-gupta',
      name: 'Fresh Red Tomatoes',
      unit: '500 g',
      price: 36,
      mrp: 45,
      badge: '20% off',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-2',
      shopId: 'shop-morning',
      name: 'Farm Fresh Milk',
      unit: '1 L',
      price: 62,
      mrp: 66,
      badge: 'Fresh',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-3',
      shopId: 'shop-gupta',
      name: 'Seasonal Veggie Box',
      unit: '1 pack',
      price: 149,
      mrp: 189,
      badge: 'Bestseller',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      image: '/images/fresh_basket.jpg',
    },
    {
      id: 'prod-4',
      shopId: 'shop-bread',
      name: 'Artisan Bread',
      unit: '400 g',
      price: 75,
      mrp: 90,
      badge: 'Baked today',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Verified shops from Figma
  const shops = [
    {
      id: 'shop-gupta',
      name: 'Gupta Fresh Mart',
      category: 'Grocery & vegetables',
      rating: '4.8',
      time: '18–24 min',
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-morning',
      name: 'Morning Dairy',
      category: 'Milk, paneer & daily needs',
      rating: '4.7',
      time: '12–18 min',
      distance: '1.1 km',
      image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Categories with cute graphic emojis from Figma
  const categories = [
    { id: 'veg', label: 'Vegetables', emoji: '🥬', bg: 'bg-[#ecf7ee]' },
    { id: 'dairy', label: 'Dairy', emoji: '🥛', bg: 'bg-[#eff6ff]' },
    { id: 'grocery', label: 'Grocery', emoji: '🛒', bg: 'bg-[#f5f3ff]' },
    { id: 'bakery', label: 'Bakery', emoji: '🥐', bg: 'bg-[#fffbeb]' },
    { id: 'fruits', label: 'Fruits', emoji: '🍎', bg: 'bg-[#fef2f2]' },
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

      {/* 3. Shop by category */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#111827]">Shop by category</h3>
          <button
            onClick={onNavigateShops}
            className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Category Items */}
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className="flex flex-col items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${cat.bg} border ${
                  selectedCategory === cat.id ? 'border-[#1b5e39] shadow-sm' : 'border-transparent'
                } flex items-center justify-center text-2xl shadow-xs`}
              >
                {cat.emoji}
              </div>
              <span className="text-[11px] font-medium text-[#374151] truncate max-w-full">
                {cat.label}
              </span>
            </button>
          ))}
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
          <h3 className="text-sm font-bold text-[#111827]">Shops near you</h3>
          <button
            onClick={onNavigateShops}
            className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shops.map((shop) => (
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
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">Popular around you</h3>
        <div className="grid grid-cols-2 gap-3">
          {popularProducts.map((p) => {
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
                        updateQuantity(p.id, 1);
                        setAddedModalProduct({
                          id: p.id,
                          name: p.name,
                          unit: p.unit,
                          price: p.price,
                          mrp: p.mrp,
                          image: p.image,
                          shopName: shops.find((s) => s.id === p.shopId)?.name || 'Gupta Fresh Mart',
                        });
                        setShowAddModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border-2 border-[#1b5e39] text-[#1b5e39] hover:bg-[#1b5e39] hover:text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      ADD +
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#1b5e39] text-white rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs">
                      <button
                        onClick={() => updateQuantity(p.id, qty - 1)}
                        className="hover:opacity-80 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[14px] text-center font-bold">{qty}</span>
                      <button
                        onClick={() => {
                          updateQuantity(p.id, qty + 1);
                          setAddedModalProduct({
                            id: p.id,
                            name: p.name,
                            unit: p.unit,
                            price: p.price,
                            mrp: p.mrp,
                            image: p.image,
                            shopName: shops.find((s) => s.id === p.shopId)?.name || 'Gupta Fresh Mart',
                          });
                          setShowAddModal(true);
                        }}
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

      {/* Interactive Add to Cart Popup Modal */}
      <AddToCartModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        product={addedModalProduct}
        onViewCart={onNavigateCart || onNavigateShops}
      />

    </div>
  );
};
