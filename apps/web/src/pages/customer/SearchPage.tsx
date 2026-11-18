import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Search, ShoppingBag, Plus, Minus, Store, X, ArrowRight } from 'lucide-react';

interface SearchPageProps {
  onSelectShop: (shopId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectShop }) => {
  const { cart, updateQuantity } = useCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load categories for search suggestion chips
    api.getCategories()
      .then((res) => {
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    try {
      setLoading(true);
      const [prodsRes, shopsRes] = await Promise.all([
        api.getProducts(q ? { search: q } : undefined).catch(() => ({ success: false, products: [] })),
        api.getShops(q ? { search: q } : undefined).catch(() => ({ success: false, shops: [] })),
      ]);

      if (prodsRes.success && prodsRes.products) {
        setProducts(prodsRes.products);
      }
      if (shopsRes.success && shopsRes.shops) {
        setShops(shopsRes.shops);
      }
    } catch (e) {
      console.warn('Search query error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemQtyInCart = (productId: string) => {
    const item = cart?.items.find((i) => i.productId === productId);
    return item?.qty || 0;
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28 font-sans select-none min-h-screen bg-[#f8faf9]">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#1b5e39] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search items, clothes, mobile, wire, TV, AC, snacks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b5e39] shadow-sm"
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

      {/* Dynamic Category Chips from backend */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setQuery(cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                query.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-[#1b5e39] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Matching Shops */}
      {shops.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Local Shops ({shops.length})
          </h3>
          <div className="space-y-2">
            {shops.map((s) => (
              <div
                key={s._id}
                onClick={() => onSelectShop(s._id)}
                className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-300 transition"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                  <p className="text-[11px] text-slate-500">{s.category || s.address}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                  Visit Store <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Products ({products.length})
        </h3>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-slate-200 rounded-xl" />
            <div className="h-16 bg-slate-200 rounded-xl" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            {query ? `No items found matching "${query}".` : 'Type in the search bar or select a category.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map((p) => {
              const qty = getItemQtyInCart(p._id);
              const priceRs = Math.round(p.pricePaise / 100);
              const imgSrc = p.imageKeys?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
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
                        onClick={() =>
                          updateQuantity(p._id, 1, {
                            name: p.name,
                            unit: p.unit,
                            pricePaise: p.pricePaise,
                            shopId: p.shopId,
                            shopName: p.shopName || 'Local Shop',
                            image: imgSrc,
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#1b5e39] text-white rounded-xl px-2 py-1 text-xs font-bold">
                        <button
                          onClick={() =>
                            updateQuantity(p._id, qty - 1, {
                              name: p.name,
                              unit: p.unit,
                              pricePaise: p.pricePaise,
                              shopId: p.shopId,
                              shopName: p.shopName || 'Local Shop',
                              image: imgSrc,
                            })
                          }
                          className="p-0.5 hover:bg-[#155a34] rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[16px] text-center">{qty}</span>
                        <button
                          onClick={() =>
                            updateQuantity(p._id, qty + 1, {
                              name: p.name,
                              unit: p.unit,
                              pricePaise: p.pricePaise,
                              shopId: p.shopId,
                              shopName: p.shopName || 'Local Shop',
                              image: imgSrc,
                            })
                          }
                          className="p-0.5 hover:bg-[#155a34] rounded"
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
        )}
      </div>
    </div>
  );
};
