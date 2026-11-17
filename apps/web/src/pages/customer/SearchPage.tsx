import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Search, ShoppingBag, Plus, Minus, Store, X } from 'lucide-react';

interface SearchPageProps {
  onSelectShop: (shopId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectShop }) => {
  const { cart, updateQuantity } = useCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    try {
      setLoading(true);
      const [prodsRes, shopsRes] = await Promise.all([
        api.getProducts({ search: searchTerm || undefined }),
        api.getShops({ search: searchTerm || undefined }),
      ]);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (shopsRes.success) setShops(shopsRes.shops);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemQtyInCart = (productId: string) => {
    const item = cart?.items.find((i) => i.productId === productId);
    return item?.qty || 0;
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search flour, milk, dal, shops in Karanja..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Matching Shops */}
      {shops.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Matching Shops</h3>
          <div className="space-y-2">
            {shops.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectShop(s.id)}
                className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-300 transition"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                  <p className="text-[11px] text-slate-500">{s.address}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  View Shop
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Products ({products.length})</h3>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-slate-200 rounded-xl" />
            <div className="h-16 bg-slate-200 rounded-xl" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No products found matching "{query}".
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map((p) => {
              const qty = getItemQtyInCart(p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {p.imageKeys?.[0] ? (
                        <img src={p.imageKeys[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">{p.unit}</p>
                      <span className="text-xs font-extrabold text-slate-900 mt-0.5 inline-block">
                        {formatPaiseToRupees(p.pricePaise)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {qty === 0 ? (
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-2 py-1 text-xs font-bold">
                        <button onClick={() => updateQuantity(p.id, qty - 1)} className="p-0.5 hover:bg-emerald-700 rounded">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[16px] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(p.id, qty + 1)} className="p-0.5 hover:bg-emerald-700 rounded">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
