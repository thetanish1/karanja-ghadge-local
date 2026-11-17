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

  const quickSearchTags = [
    { label: '💡 LED Bulb', search: 'bulb' },
    { label: '🔌 Wire', search: 'wire' },
    { label: '👕 Cotton Shirt', search: 'shirt' },
    { label: '📱 Fast Charger', search: 'charger' },
    { label: '📺 Smart TV', search: 'tv' },
    { label: '❄️ Refrigerator', search: 'fridge' },
    { label: '🎆 Fireworks', search: 'sparkler' },
    { label: '🥛 Fresh Milk', search: 'milk' },
    { label: '🥬 Tomatoes', search: 'tomato' },
  ];

  // Local catalogue items across all categories for instant zero-latency search
  const allCatalogProducts = [
    { id: 'prod-1', name: 'Fresh Red Tomatoes', unit: '500 g', price: 36, shopId: 'shop-gupta', category: 'Vegetables' },
    { id: 'prod-2', name: 'Farm Fresh Milk', unit: '1 L', price: 62, shopId: 'shop-morning', category: 'Dairy' },
    { id: 'prod-3', name: 'Seasonal Veggie Box', unit: '1 pack', price: 149, shopId: 'shop-gupta', category: 'Vegetables' },
    { id: 'prod-c1', name: 'Pure Cotton Casual Shirt', unit: 'M / L / XL', price: 499, shopId: 'shop-ganesh-cloth', category: 'Cloth' },
    { id: 'prod-c2', name: 'Traditional Paithani Silk Saree', unit: '1 piece', price: 1250, shopId: 'shop-ganesh-cloth', category: 'Cloth' },
    { id: 'prod-m1', name: 'Fast Type-C Fast Charger (33W)', unit: '1 adapter + cable', price: 349, shopId: 'shop-sai-mobile', category: 'Mobile' },
    { id: 'prod-m2', name: 'Universal Magnetic Mobile Cover', unit: 'All models', price: 149, shopId: 'shop-sai-mobile', category: 'Mobile' },
    { id: 'prod-e1', name: 'Havells 9W LED Cool Bulb (Pack of 2)', unit: 'Pack of 2', price: 160, shopId: 'shop-pawan-electric', category: 'Electric' },
    { id: 'prod-e2', name: 'Polycab 1.5 sq mm Copper Wire (10m)', unit: '10m coil', price: 380, shopId: 'shop-pawan-electric', category: 'Electric' },
    { id: 'prod-e3', name: 'Festive Decorative Fairy Lighting (15m)', unit: '15m roll', price: 120, shopId: 'shop-pawan-electric', category: 'Electric' },
    { id: 'prod-el1', name: 'Samsung 32" HD Smart LED TV', unit: '1 unit', price: 12490, shopId: 'shop-mahalaxmi-el', category: 'Electronic' },
    { id: 'prod-el2', name: 'Voltas 1.5 Ton Inverter Split AC', unit: '1 unit', price: 31990, shopId: 'shop-mahalaxmi-el', category: 'Electronic' },
    { id: 'prod-el3', name: 'Whirlpool 192L Refrigerator (Fridge)', unit: '1 unit', price: 14990, shopId: 'shop-mahalaxmi-el', category: 'Electronic' },
    { id: 'prod-f1', name: 'Electric Sparklers Fuljhadi (10 boxes)', unit: 'Pack of 10 boxes', price: 180, shopId: 'shop-utsav-fireworks', category: 'Fireworks' },
    { id: 'prod-f2', name: 'Special Ground Spinner Chakri (10 pcs)', unit: 'Box of 10', price: 160, shopId: 'shop-utsav-fireworks', category: 'Fireworks' },
  ];

  const allCatalogShops = [
    { id: 'shop-gupta', name: 'Gupta Fresh Mart', address: 'Main Bazaar Road, Karanja (Ghadge)', category: 'Grocery & Vegetables' },
    { id: 'shop-morning', name: 'Morning Dairy', address: 'Near Bus Stand, Karanja (Ghadge)', category: 'Dairy & Milk' },
    { id: 'shop-ganesh-cloth', name: 'Shree Ganesh Cloth Center', address: 'Market Chowk, Karanja (Ghadge)', category: 'Cloth & Fashion' },
    { id: 'shop-sai-mobile', name: 'Sai Mobile Care & Gadgets', address: 'Station Road, Karanja (Ghadge)', category: 'Mobile & Accessories' },
    { id: 'shop-pawan-electric', name: 'Pawan Electricals', address: 'Power House Road, Karanja (Ghadge)', category: 'Electric, Wire & Lighting' },
    { id: 'shop-mahalaxmi-el', name: 'Mahalaxmi Electronics', address: 'Main Highway Road, Karanja (Ghadge)', category: 'TV, AC, Fridge & Appliances' },
    { id: 'shop-utsav-fireworks', name: 'Utsav Fireworks & Crackers', address: 'Open Ground, Karanja (Ghadge)', category: 'Fireworks & Sparklers' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) {
      setProducts(allCatalogProducts.slice(0, 6));
      setShops(allCatalogShops.slice(0, 3));
      return;
    }

    try {
      setLoading(true);
      const [prodsRes, shopsRes] = await Promise.all([
        api.getProducts({ search: q || undefined }).catch(() => ({ success: false, products: [] })),
        api.getShops({ search: q || undefined }).catch(() => ({ success: false, shops: [] })),
      ]);

      if (prodsRes.success && prodsRes.products && prodsRes.products.length > 0) {
        setProducts(prodsRes.products);
      } else {
        // Fallback to local full catalogue matching
        const matched = allCatalogProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
        setProducts(matched);
      }

      if (shopsRes.success && shopsRes.shops && shopsRes.shops.length > 0) {
        setShops(shopsRes.shops);
      } else {
        const matchedShops = allCatalogShops.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        );
        setShops(matchedShops);
      }
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
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24 font-sans select-none">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#1b5e39] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search bulb, wire, mobile, shirt, TV, AC, fridge, fireworks..."
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

      {/* Quick Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {quickSearchTags.map((tag) => (
          <button
            key={tag.label}
            onClick={() => setQuery(tag.search)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              query.toLowerCase() === tag.search.toLowerCase()
                ? 'bg-[#1b5e39] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tag.label}
          </button>
        ))}
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
