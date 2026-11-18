import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.js';
import { api } from '../../services/api.js';
import { ArrowLeft, Heart, Search, Star, Clock, Truck, Check, Plus, Minus, ChevronRight, Store } from 'lucide-react';

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
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([
    { id: 'all', label: 'All Items' }
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadShopAndProducts();
  }, [shopId]);

  const loadShopAndProducts = async () => {
    try {
      setLoading(true);
      const [shopRes, prodsRes] = await Promise.all([
        api.getShopDetail(shopId).catch(() => ({ success: false, shop: null })),
        api.getProducts({ shopId }).catch(() => ({ success: false, products: [] }))
      ]);

      if (shopRes.success && shopRes.shop) {
        setShop(shopRes.shop);
      }
      if (prodsRes.success && prodsRes.products) {
        setProducts(prodsRes.products);
        // Extract distinct categories
        const catMap = new Map<string, string>();
        prodsRes.products.forEach((p: any) => {
          if (p.category) {
            catMap.set(p.category.toLowerCase(), p.category);
          }
        });
        const dynamicCats = Array.from(catMap.entries()).map(([id, label]) => ({ id, label }));
        setCategories([{ id: 'all', label: 'All Items' }, ...dynamicCats]);
      }
    } catch (e) {
      console.warn('Error loading shop details:', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemQty = (id: string) => {
    const item = cart?.items.find((i) => i.productId === id);
    return item?.qty || 0;
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeTab === 'all' || (p.category && p.category.toLowerCase() === activeTab);
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] p-4 space-y-4 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-12 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const shopName = shop?.name || 'Local Store';
  const shopCategory = shop?.category || 'General Store';
  const shopImage = shop?.photos?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
  const isOpen = !shop?.isPaused;

  return (
    <div className="pb-28 font-sans select-none min-h-screen bg-[#f8faf9]">
      {/* 1. Hero Store Header Image */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        <img
          src={shopImage}
          alt={shopName}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

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
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${isOpen ? 'bg-[#a7f3d0] text-[#065f46]' : 'bg-red-100 text-red-700'}`}>
            {isOpen ? 'OPEN' : 'CURRENTLY CLOSED'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
            {shopName}
          </h1>
          <p className="text-xs text-white/90 font-medium">{shopCategory}</p>
          <div className="flex items-center gap-2 text-xs text-white/80 pt-0.5">
            <span className="flex items-center gap-0.5 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {shop?.rating || '4.8'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {shop?.hours ? `${shop.hours.open} – ${shop.hours.close}` : '8:00 AM – 9:00 PM'}
            </span>
            <span>•</span>
            <span>Karanja (Ghadge)</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pt-4">
        {/* 2. Perks Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#1b5e39]" />
            <div>
              <div className="text-xs font-bold text-[#111827]">Free delivery</div>
              <div className="text-[10px] text-[#6b7280]">Zero commission pilot</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Check className="w-5 h-5 text-[#1b5e39]" />
            <div>
              <div className="text-xs font-bold text-[#111827]">Direct from Store</div>
              <div className="text-[10px] text-[#6b7280]">Local verified seller</div>
            </div>
          </div>
        </div>

        {/* 3. Search in Store */}
        <div className="relative">
          <div className="flex items-center h-12 border border-[#e2e8f0] rounded-[18px] px-3.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39]">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={`Search products in ${shopName}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs text-[#111827] placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Filter Pills */}
        {categories.length > 1 && (
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
        )}

        {/* 5. Products Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#111827]">Products ({filteredProducts.length})</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const qty = getItemQty(p._id);
                const priceRs = Math.round(p.pricePaise / 100);
                const mrpRs = p.mrpPaise ? Math.round(p.mrpPaise / 100) : null;
                const imgSrc = p.imageKeys?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-[20px] p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-28 rounded-xl bg-slate-50 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        {mrpRs && mrpRs > priceRs && (
                          <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border bg-orange-50 text-orange-700 border-orange-200">
                            {Math.round(((mrpRs - priceRs) / mrpRs) * 100)}% off
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium">{p.unit}</div>
                      <h4 className="text-xs font-bold text-[#111827] line-clamp-1 leading-tight mt-0.5">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs font-extrabold text-[#111827]">₹{priceRs}</span>
                        {mrpRs && mrpRs > priceRs && (
                          <span className="text-[10px] text-slate-400 line-through ml-1">
                            ₹{mrpRs}
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
                              shopId,
                              shopName,
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
                            onClick={() =>
                              updateQuantity(p._id, qty - 1, {
                                name: p.name,
                                unit: p.unit,
                                pricePaise: p.pricePaise,
                                shopId,
                                shopName,
                                image: imgSrc,
                              })
                            }
                            className="hover:opacity-80 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[14px] text-center font-bold">{qty}</span>
                          <button
                            onClick={() =>
                              updateQuantity(p._id, qty + 1, {
                                name: p.name,
                                unit: p.unit,
                                pricePaise: p.pricePaise,
                                shopId,
                                shopName,
                                image: imgSrc,
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
          )}
        </div>
      </div>
    </div>
  );
};
