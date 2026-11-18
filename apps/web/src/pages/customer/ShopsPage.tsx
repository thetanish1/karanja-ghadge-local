import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ArrowLeft, Search, Star, Clock, MapPin, ChevronRight } from 'lucide-react';

interface ShopsPageProps {
  onBack: () => void;
  onSelectShop: (shopId: string) => void;
  onOpenSearch: () => void;
}

const SHOP_FALLBACK_IMAGES: Record<string, string> = {
  'vegetables': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  'dairy': 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&auto=format&fit=crop&q=80',
  'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  'cloth': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
  'mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
  'electric': 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80',
  'electronic': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80',
  'fireworks': 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80',
};

export const ShopsPage: React.FC<ShopsPageProps> = ({
  onBack,
  onSelectShop,
  onOpenSearch,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'topRated'>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    api.getCategories()
      .then((res) => { if (res.success) setCategories(res.categories); })
      .catch(() => {});
  }, []);

  // Load shops when category filter changes
  useEffect(() => {
    setLoading(true);
    const selectedCat = categories.find((c) => c._id === categoryFilter || c.slug === categoryFilter);
    api.getShops(selectedCat?.slug ? { category: selectedCat.slug } : undefined)
      .then((res) => { if (res.success) setShops(res.shops); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryFilter, categories]);

  const getShopImage = (shop: any) => {
    if (shop.photos?.length) return shop.photos[0];
    const slug = shop.categorySlug || '';
    return SHOP_FALLBACK_IMAGES[slug] || SHOP_FALLBACK_IMAGES['grocery'];
  };

  const filteredShops = shops.filter((s) => {
    if (filter === 'topRated' && (!s.rating || parseFloat(s.rating) < 4.8)) return false;
    return true;
  });

  return (
    <div className="space-y-4 px-4 pt-3 pb-24 font-sans select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Shops near you</h1>
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setCategoryFilter(cat._id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              categoryFilter === cat._id
                ? 'bg-[#1b5e39] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Quick Filter Pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('topRated')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            filter === 'topRated' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ★ Top rated
        </button>
      </div>

      {/* Local Stores Delivery Banner */}
      <div className="bg-[#e8f3ea]/50 border border-[#cde5d2] rounded-[18px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1b5e39] text-white flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#111827]">
            {loading ? '...' : filteredShops.length} stores deliver to your location
          </div>
          <div className="text-[11px] text-[#6b7280]">Karanja (Ghadge) • within 5 km</div>
        </div>
      </div>

      {/* Store Cards */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-[20px] animate-pulse" />)
        ) : filteredShops.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No shops found under this category filter.
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop._id}
              onClick={() => onSelectShop(shop._id)}
              className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={getShopImage(shop)}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{shop.name}</h3>
                      {shop.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {shop.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b7280] mt-0.5">{shop.category || shop.address}</p>
                    {shop.hours && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{shop.hours.open} – {shop.hours.close}</span>
                        {shop.isPaused && (
                          <span className="text-red-500 font-bold">• Paused</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* AapnaCart Community Mission Card */}
      <div className="bg-[#f0f7f2] border border-[#d6ecda] rounded-[24px] p-5 text-center space-y-2 mt-4">
        <div className="flex justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1b5e39] flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
              <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" />
            </svg>
          </div>
          <div className="text-lg font-extrabold tracking-tight leading-none">
            <span className="text-[#1b5e39]">Aapna</span>
            <span className="text-[#f97316]">Cart</span>
          </div>
        </div>
        <p className="text-xs text-[#6b7280]">
          Every order supports a business in your neighbourhood.
        </p>
      </div>

    </div>
  );
};
