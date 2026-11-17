import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { ArrowLeft, Heart, Search, Star, Clock, Truck, Check, Plus, Minus, ChevronRight } from 'lucide-react';

interface ShopDetailPageProps {
  shopId: string;
  onBack: () => void;
  onNavigateCart: () => void;
}

export const ShopDetailPage: React.FC<ShopDetailPageProps> = ({
  shopId,
  onBack,
  onNavigateCart,
}) => {
  const { cart, updateQuantity } = useCart();
  const [activeTab, setActiveTab] = useState('bestsellers');
  const [isFavorite, setIsFavorite] = useState(false);

  const shop = {
    name: 'Gupta Fresh Mart',
    category: 'Grocery • Fruits • Vegetables',
    rating: '4.8',
    time: '18–24 min',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  };

  const categories = [
    { id: 'bestsellers', label: 'Best sellers' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'staples', label: 'Staples' },
  ];

  const products = [
    {
      id: 'prod-1',
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
      name: 'Artisan Bread',
      unit: '400 g',
      price: 75,
      mrp: 90,
      badge: 'Baked today',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const getItemQty = (id: string) => {
    const item = cart?.items.find((i) => i.productId === id);
    return item?.qty || 0;
  };

  return (
    <div className="pb-28 font-sans select-none">
      
      {/* 1. Hero Store Header Image */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Top Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Store Title & Details Overlaid */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
          <span className="inline-block text-[10px] font-bold bg-[#a7f3d0] text-[#065f46] px-2 py-0.5 rounded-md uppercase">
            OPEN
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
            {shop.name}
          </h1>
          <p className="text-xs text-white/90 font-medium">{shop.category}</p>
          <div className="flex items-center gap-2 text-xs text-white/80 pt-0.5">
            <span className="flex items-center gap-0.5 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {shop.rating}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {shop.time}
            </span>
            <span>•</span>
            <span>{shop.distance}</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pt-4">
        
        {/* 2. Perks Strip (Free delivery & Fresh guarantee) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#1b5e39]" />
            <div>
              <div className="text-xs font-bold text-[#111827]">Free delivery</div>
              <div className="text-[10px] text-[#6b7280]">Above ₹299</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Check className="w-5 h-5 text-[#1b5e39]" />
            <div>
              <div className="text-xs font-bold text-[#111827]">Fresh guarantee</div>
              <div className="text-[10px] text-[#6b7280]">Quality checked</div>
            </div>
          </div>
        </div>

        {/* 3. Search in Store */}
        <div className="relative">
          <div className="flex items-center h-12 border border-[#e2e8f0] rounded-[18px] px-3.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39]">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={`Search in ${shop.name}`}
              className="flex-1 text-xs text-[#111827] placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === c.id
                  ? 'bg-[#1b5e39] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 5. Best Sellers Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#111827]">Best sellers</h2>
            <button className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline">
              <span>18 items</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => {
              const qty = getItemQty(p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
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
                            shopId,
                            shopName: shop.name,
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
                              shopId,
                              shopName: shop.name,
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
                              shopId,
                              shopName: shop.name,
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
    </div>
  );
};
