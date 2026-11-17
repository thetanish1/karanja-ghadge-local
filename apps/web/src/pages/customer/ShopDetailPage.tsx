import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowLeft, Clock, MapPin, Phone, ShoppingBag, Plus, Minus, Search, AlertCircle } from 'lucide-react';

interface ShopDetailPageProps {
  shopId: string;
  onBack: () => void;
  onNavigateCart: () => void;
}

export const ShopDetailPage: React.FC<ShopDetailPageProps> = ({ shopId, onBack, onNavigateCart }) => {
  const { cart, updateQuantity } = useCart();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShop();
  }, [shopId]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const [shopRes, prodsRes] = await Promise.all([
        api.getShopDetail(shopId),
        api.getProducts({ shopId }),
      ]);
      if (shopRes.success) setShop(shopRes.shop);
      if (prodsRes.success) setProducts(prodsRes.products);
    } catch (e) {
      console.warn('Failed to load shop details:', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemQtyInCart = (productId: string) => {
    const item = cart?.items.find((i) => i.productId === productId);
    return item?.qty || 0;
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto animate-pulse">
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-16 bg-slate-200 rounded-xl" />
          <div className="h-16 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">Shop not found.</p>
        <button onClick={onBack} className="mt-4 text-xs font-bold text-emerald-600 underline">
          Go back to shops
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-md mx-auto">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-14 z-30 flex items-center justify-between">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Shops</span>
        </button>
        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{shop.name}</span>
        <div className="w-6" />
      </div>

      {/* Shop Profile Banner Card */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{shop.name}</h1>
            <p className="text-xs text-slate-600 mt-1">{shop.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{shop.phone}</span>
            </div>
          </div>
        </div>

        {shop.isPaused && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>This shop is currently paused and not taking orders right now.</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            {shop.hours?.open} - {shop.hours?.close}
          </span>
          <span className="text-emerald-700 font-semibold">
            {shop.fulfilmentOptions?.join(' & ')}
          </span>
        </div>
      </div>

      {/* Product Search */}
      <div className="p-4">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Search items in ${shop.name}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Product Items List */}
        <div className="space-y-2.5">
          {filteredProducts.map((p) => {
            const qty = getItemQtyInCart(p.id);
            const isOutOfStock = p.stockStatus === 'out_of_stock';
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {p.imageKeys?.[0] ? (
                      <img src={p.imageKeys[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.unit}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">
                        {formatPaiseToRupees(p.pricePaise)}
                      </span>
                      {p.mrpPaise && p.mrpPaise > p.pricePaise && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPaiseToRupees(p.mrpPaise)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add / Qty Control */}
                <div className="flex-shrink-0">
                  {isOutOfStock ? (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                      Out of Stock
                    </span>
                  ) : shop.isPaused ? (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      Unavailable
                    </span>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-2 py-1 text-xs font-bold shadow-sm">
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
      </div>

      {/* Floating View Cart Pill if cart has items */}
      {cart && cart.itemCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={onNavigateCart}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs transition"
          >
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 px-2 py-0.5 rounded-full">{cart.itemCount} items</span>
              <span>•</span>
              <span>{formatPaiseToRupees(cart.totalPaise)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>View Cart</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
