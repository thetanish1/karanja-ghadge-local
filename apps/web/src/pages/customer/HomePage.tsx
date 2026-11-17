import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Search, Store, Clock, ShoppingBag, Plus, Minus, Check, ArrowRight } from 'lucide-react';

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
    <div className="space-y-5 pb-20">
      {/* Mobile Search Bar Trigger */}
      <div className="px-4 pt-3">
        <button
          onClick={onNavigateSearch}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-sm hover:border-slate-300 transition"
        >
          <Search className="w-4 h-4 text-emerald-600" />
          <span>Search groceries, milk, vegetables, shops...</span>
        </button>
      </div>

      {/* Categories Horizontal Scroller */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories</h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-emerald-600 font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              selectedCategory === null
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All Shops
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedCategory === c._id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Shops */}
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
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer relative overflow-hidden"
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
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Open
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{shop.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{shop.address}</p>

                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {shop.hours?.open} - {shop.hours?.close}
                      </span>
                      <span className="text-emerald-700 font-medium">
                        {shop.fulfilmentOptions?.join(' • ')}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
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
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-24 rounded-xl bg-slate-100 mb-2 overflow-hidden flex items-center justify-center">
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
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-lg px-1.5 py-0.5 text-xs font-bold">
                      <button
                        onClick={() => updateQuantity(p.id, qty - 1)}
                        className="p-0.5 hover:bg-emerald-700 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-[14px] text-center">{qty}</span>
                      <button
                        onClick={() => updateQuantity(p.id, qty + 1)}
                        className="p-0.5 hover:bg-emerald-700 rounded"
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
