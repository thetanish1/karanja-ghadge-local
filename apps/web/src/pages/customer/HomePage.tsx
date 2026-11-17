import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Search, Store, Clock, ShoppingBag, Plus, Minus, Check, ArrowRight, Sparkles } from 'lucide-react';

interface HomePageProps {
  onSelectShop: (shopId: string) => void;
  onNavigateSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectShop, onNavigateSearch }) => {
  const { cart, updateQuantity } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, shopsRes, prodsRes] = await Promise.all([
        api.getCategories(),
        api.getShops(selectedCategory ? { category: selectedCategory } : undefined),
        api.getProducts({ inStockOnly: true }),
      ]);

      if (catsRes.success) setCategories(catsRes.categories);
      if (shopsRes.success) setShops(shopsRes.shops);
      if (prodsRes.success) setPopularProducts(prodsRes.products.slice(0, 6));
    } catch (e) {
      console.warn('Failed to load homepage data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemQtyInCart = (productId: string) => {
    const item = cart?.items.find((i) => i.productId === productId);
    return item?.qty || 0;
  };

  return (
    <div className="space-y-4 pb-24 font-sans select-none">
      
      {/* 
        FIGMA HERO BANNER
        Matches the Figma design: mint gradient, decorative ring, circular fresh produce basket, 
        and "WELCOME TO AAPNACART / Everything local, delivered fresh."
      */}
      <div className="relative bg-gradient-to-b from-[#e8f3ea] via-[#f2f7f3] to-white pt-6 pb-6 px-6 overflow-hidden rounded-b-[32px] shadow-xs">
        
        {/* Figma Decorative Mint Ring Accent */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border-[28px] border-[#d4ead8]/55 pointer-events-none" />

        {/* Circular Masked Basket of Fresh Local Produce */}
        <div className="absolute right-[-4px] top-6 w-40 h-40 rounded-full overflow-hidden border-[3.5px] border-white shadow-xl pointer-events-none z-10 bg-slate-100">
          <img
            src="/images/fresh_basket.jpg"
            alt="Basket of fresh local vegetables"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Typography from Figma */}
        <div className="relative z-10 pr-24 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1b5e39] mb-1">
            WELCOME TO AAPNACART
          </div>
          
          <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight leading-[1.18]">
            Everything local,<br />delivered fresh.
          </h1>
          
          <p className="text-[12px] text-[#6b7280] mt-1.5 leading-relaxed max-w-[240px]">
            Shop from trusted stores around Karanjaghadge and get it at your doorstep.
          </p>
        </div>

        {/* Integrated Mobile Search Bar */}
        <div className="mt-5 relative z-10">
          <button
            onClick={onNavigateSearch}
            className="w-full flex items-center gap-2.5 px-4 h-12 bg-white border border-[#e2e8f0] rounded-[16px] text-slate-400 text-xs shadow-xs hover:border-[#1b5e39] transition text-left"
          >
            <Search className="w-4 h-4 text-[#1b5e39]" />
            <span className="text-slate-400 text-xs">Search groceries, vegetables, milk, shops...</span>
          </button>
        </div>

      </div>

      {/* Categories Horizontal Scroller */}
      <div className="px-4 pt-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories</h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-[#1b5e39] font-bold hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              selectedCategory === null
                ? 'bg-[#1b5e39] text-white border-[#1b5e39] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All Stores
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                selectedCategory === c._id
                  ? 'bg-[#1b5e39] text-white border-[#1b5e39] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Local Shops in Karanjaghadge */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verified Local Shops in Karanjaghadge
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">{shops.length} open</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onSelectShop(shop.id)}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-[#1b5e39] transition cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{shop.name}</h3>
                      {shop.isPaused ? (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                          Paused
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#e8f3ea] text-[#1b5e39] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Open
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{shop.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{shop.address}</p>

                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {shop.hours?.open} - {shop.hours?.close}
                      </span>
                      <span className="text-[#1b5e39] font-semibold">
                        {shop.fulfilmentOptions?.join(' • ')}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Daily Essentials */}
      <div className="px-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Daily Essentials
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {popularProducts.map((p) => {
            const qty = getItemQtyInCart(p.id);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-24 rounded-xl bg-slate-50 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                    {p.imageKeys?.[0] ? (
                      <img
                        src={p.imageKeys[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.unit}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatPaiseToRupees(p.pricePaise)}
                    </span>
                    {p.mrpPaise && p.mrpPaise > p.pricePaise && (
                      <span className="text-[10px] text-slate-400 line-through ml-1">
                        {formatPaiseToRupees(p.mrpPaise)}
                      </span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      className="px-2.5 py-1 rounded-lg bg-[#e8f3ea] hover:bg-[#d6ecda] border border-[#bfe3c8] text-[#1b5e39] text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-[#1b5e39] text-white rounded-lg px-1.5 py-0.5 text-xs font-bold">
                      <button
                        onClick={() => updateQuantity(p.id, qty - 1)}
                        className="p-0.5 hover:bg-[#164d2d] rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-[14px] text-center">{qty}</span>
                      <button
                        onClick={() => updateQuantity(p.id, qty + 1)}
                        className="p-0.5 hover:bg-[#164d2d] rounded"
                      >
                        <Plus className="w-3 h-3" />
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
