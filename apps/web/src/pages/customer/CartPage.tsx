import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Store, MapPin } from 'lucide-react';

interface CartPageProps {
  onProceedToCheckout: () => void;
  onBrowseShops: () => void;
  onOpenAuth: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onProceedToCheckout, onBrowseShops, onOpenAuth }) => {
  const { cart, updateQuantity, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto space-y-4 pt-16">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Sign in to View Your Cart</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sign in with your mobile number to view and manage items in your Karanjaghadge Local cart.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Sign In with Phone / OTP
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3 max-w-md mx-auto animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto space-y-4 pt-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Discover local grocery, milk, fresh vegetable, and bakery shops in Karanja to add items.
        </p>
        <button
          onClick={onBrowseShops}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Explore Local Shops
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28">
      {/* Shop Information Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ordering From</span>
            <h3 className="text-sm font-bold text-slate-900">{cart.shopName || 'Local Shop'}</h3>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="p-2 text-slate-400 hover:text-red-600 transition"
          title="Clear Entire Cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Items in Order</h4>
        <div className="divide-y divide-slate-100">
          {cart.items.map((item) => (
            <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                <p className="text-[11px] text-slate-500">
                  {formatPaiseToRupees(item.pricePaise)} / {item.unit}
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1 text-xs font-bold">
                <button
                  onClick={() => updateQuantity(item.productId, item.qty - 1)}
                  className="p-0.5 hover:text-red-600 text-slate-700"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[16px] text-center text-slate-900">{item.qty}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.qty + 1)}
                  className="p-0.5 hover:text-emerald-700 text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right min-w-[60px]">
                <span className="text-xs font-extrabold text-slate-900">
                  {formatPaiseToRupees(item.subtotalPaise)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill & Fee Breakdown (Paise Arithmetic Transparency) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Bill Summary</h4>

        <div className="flex justify-between text-slate-600">
          <span>Items Total</span>
          <span className="font-semibold text-slate-900">{formatPaiseToRupees(cart.itemsTotalPaise)}</span>
        </div>

        <div className="flex justify-between text-slate-600 items-center">
          <div className="flex items-center gap-1">
            <span>Delivery Fee</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">FREE</span>
          </div>
          <span className="font-semibold text-emerald-700">{formatPaiseToRupees(cart.deliveryFeePaise)}</span>
        </div>

        <div className="flex justify-between text-slate-600 items-center">
          <div className="flex items-center gap-1">
            <span>Platform Fee</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">FREE</span>
          </div>
          <span className="font-semibold text-emerald-700">{formatPaiseToRupees(cart.platformFeePaise)}</span>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
          <span>To Pay</span>
          <span className="text-base text-emerald-700">{formatPaiseToRupees(cart.totalPaise)}</span>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        onClick={onProceedToCheckout}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition"
      >
        <span>Proceed to Checkout ({formatPaiseToRupees(cart.totalPaise)})</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
