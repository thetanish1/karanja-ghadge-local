import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { Search, ChevronRight, Clock, Star, Plus, Minus, ArrowRight, Check, SlidersHorizontal } from 'lucide-react';

interface HomePageProps {
  onSelectShop: (shopId: string) => void;
  onNavigateShops: () => void;
  onNavigateSearch: () => void;
  onNavigateCart?: () => void;
}

const CATEGORY_META: Record<string, { emoji: string; bg: string }> = {
  'vegetables': { emoji: '🥬', bg: 'bg-[#ecf7ee]' },
  'dairy': { emoji: '🥛', bg: 'bg-[#eff6ff]' },
  'grocery': { emoji: '🛒', bg: 'bg-[#f5f3ff]' },
  'bakery': { emoji: '🥐', bg: 'bg-[#fffbeb]' },
  'cloth': { emoji: '👕', bg: 'bg-[#fdf4ff]' },
  'mobile': { emoji: '📱', bg: 'bg-[#f0f9ff]' },
  'electric': { emoji: '💡', bg: 'bg-[#fefce8]' },
  'electronic': { emoji: '📺', bg: 'bg-[#eef2ff]' },
  'fireworks': { emoji: '🎆', bg: 'bg-[#fff7ed]' },
};

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

export const HomePage: React.FC<HomePageProps> = ({
  onSelectShop,
  onNavigateShops,
  onNavigateSearch,
}) => {
  const { cart, updateQuantity } = useCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);

  // Load categories once
  useEffect(() => {
    api.getCategories()
      .then((res) => { if (res.success) setCategories(res.categories); })
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  // Reload shops + products when category changes
  useEffect(() => {
    setLoadingShops(true);
    setLoadingProds(true);

    const selectedCat = categories.find((c) => c._id === selectedCategoryId);
    const catSlug = selectedCat?.slug;

    api.getShops(catSlug ? { category: catSlug } : undefined)
      .then((res) => { if (res.success) setShops(res.shops); })
      .catch(() => {})
      .finally(() => setLoadingShops(false));

    api.getProducts(selectedCategoryId ? { categoryId: selectedCategoryId } : undefined)
      .then((res) => { if (res.success) setProducts(res.products); })
      .catch(() => {})
      .finally(() => setLoadingProds(false));
  }, [selectedCategoryId, categories]);

  const getItemQty = (id: string) => {
    const item = cart?.items.find((i) => i.productId === id);
    return item?.qty || 0;
  };

  const getProductBadge = (p: any) => {
    if (p.mrpPaise && p.pricePaise && p.mrpPaise > p.pricePaise) {
      const disc = Math.round((1 - p.pricePaise / p.mrpPaise) * 100);
      return { text: `${disc}% off`, color: 'bg-orange-50 text-orange-700 border-orange-200' };
    }
    return { text: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const getShopImage = (shop: any) => {
    if (shop.photos?.length) return shop.photos[0];
    const slug = shop.categorySlug || shop.slug || '';
    return SHOP_FALLBACK_IMAGES[slug] || SHOP_FALLBACK_IMAGES['grocery'];
  };

  const selectedCatLabel = selectedCategoryId
    ? categories.find((c) => c._id === selectedCategoryId)?.name
    : null;

  return (
    <div className="space-y-4 px-4 pt-3 pb-24 font-sans select-none">
      
      {/* 1. Search Bar */}
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

      {/* 2. Hero Promo Card */}
      <div className="relative bg-[#155a34] rounded-[24px] p-5 text-white overflow-hidden shadow-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-[20px] border-white/10 pointer-events-none" />
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-lg pointer-events-none">
          <img src="/images/fresh_basket.jpg" alt="Fresh produce" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-[210px] space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">LOCAL & FRESH</div>
          <h2 className="text-[20px] font-extrabold tracking-tight leading-snug">Your town's best, at your doorstep.</h2>
          <p className="text-[11px] text-white/80 font-normal pb-1">Up to 25% off on your first order</p>
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
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#111827]">Shop by category</h3>
            {selectedCatLabel && (
              <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full capitalize">
                {selectedCatLabel}
              </span>
            )}
          </div>
          {selectedCategoryId ? (
            <button
              onClick={() => setSelectedCategoryId(null)}
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

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 pt-1">
          {/* All pill */}
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="flex flex-col items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 w-16"
          >
            <div className={`w-14 h-14 rounded-2xl bg-[#f0fdf4] border-2 ${!selectedCategoryId ? 'border-[#1b5e39] shadow-sm ring-2 ring-[#1b5e39]/25 scale-105' : 'border-slate-100 hover:border-slate-200'} flex items-center justify-center text-2xl shadow-xs transition`}>
              ✨
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight truncate max-w-full ${!selectedCategoryId ? 'text-[#1b5e39] font-bold' : 'text-slate-600'}`}>
              All
            </span>
          </button>

          {loadingCats ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="flex-shrink-0 w-16 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                <div className="h-2.5 bg-slate-200 rounded mt-2 mx-auto w-10" />
              </div>
            ))
          ) : (
            categories.map((cat) => {
              const meta = CATEGORY_META[cat.slug] || { emoji: '🏪', bg: 'bg-slate-50' };
              const isSelected = selectedCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat._id)}
                  className="flex flex-col items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 w-16"
                >
                  <div className={`w-14 h-14 rounded-2xl ${meta.bg} border-2 ${isSelected ? 'border-[#1b5e39] shadow-sm ring-2 ring-[#1b5e39]/25 scale-105' : 'border-slate-100 hover:border-slate-200'} flex items-center justify-center text-2xl shadow-xs transition`}>
                    {meta.emoji}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight truncate max-w-full ${isSelected ? 'text-[#1b5e39] font-bold' : 'text-slate-600'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Feature Badges Strip */}
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
            {selectedCatLabel ? `${selectedCatLabel} Stores` : 'Shops near you'}
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
          {loadingShops ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-[20px] animate-pulse" />
            ))
          ) : shops.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-[20px] border border-slate-200">
              No shops found in this category yet.
            </div>
          ) : (
            shops.slice(0, 4).map((shop) => (
              <div
                key={shop._id}
                onClick={() => onSelectShop(shop._id)}
                className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={getShopImage(shop)}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#111827]">{shop.name}</h4>
                      {shop.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {shop.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6b7280] mt-0.5">{shop.category || shop.address}</p>
                    {shop.hours && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{shop.hours.open} – {shop.hours.close}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Popular products */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">
          {selectedCatLabel ? `${selectedCatLabel} Items` : 'Popular around you'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {loadingProds ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 bg-slate-200 rounded-[20px] animate-pulse" />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-slate-400 bg-white rounded-[20px] border border-slate-200">
              No products found in this category yet.
            </div>
          ) : (
            products.slice(0, 12).map((p) => {
              const qty = getItemQty(p._id);
              const badge = getProductBadge(p);
              const imgSrc = p.imageKeys?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
              const shopForCard = shops.find((s) => s._id === p.shopId);
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-28 rounded-xl bg-slate-50 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                      <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{p.unit}</div>
                    <h4 className="text-xs font-bold text-[#111827] line-clamp-1 leading-tight mt-0.5">{p.name}</h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-extrabold text-[#111827]">₹{Math.round(p.pricePaise / 100)}</span>
                      {p.mrpPaise && p.mrpPaise > p.pricePaise && (
                        <span className="text-[10px] text-slate-400 line-through ml-1">
                          ₹{Math.round(p.mrpPaise / 100)}
                        </span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => {
                          updateQuantity(p._id, 1, {
                            name: p.name,
                            unit: p.unit,
                            pricePaise: p.pricePaise,
                            shopId: p.shopId,
                            shopName: shopForCard?.name || p.shopName || 'Local Shop',
                            image: imgSrc,
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl border-2 border-[#1b5e39] text-[#1b5e39] hover:bg-[#1b5e39] hover:text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#1b5e39] text-white rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs">
                        <button
                          onClick={() => updateQuantity(p._id, qty - 1, {
                            name: p.name, unit: p.unit, pricePaise: p.pricePaise,
                            shopId: p.shopId, shopName: shopForCard?.name || p.shopName || 'Local Shop', image: imgSrc,
                          })}
                          className="hover:opacity-80 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[14px] text-center font-bold">{qty}</span>
                        <button
                          onClick={() => updateQuantity(p._id, qty + 1, {
                            name: p.name, unit: p.unit, pricePaise: p.pricePaise,
                            shopId: p.shopId, shopName: shopForCard?.name || p.shopName || 'Local Shop', image: imgSrc,
                          })}
                          className="hover:opacity-80 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
