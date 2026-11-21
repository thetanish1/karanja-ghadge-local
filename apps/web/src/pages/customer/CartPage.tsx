import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowLeft, Clock, Store, Plus, Minus, Tag, ChevronRight, Check, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartPageProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
  onBrowseShops: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onBack,
  onProceedToCheckout,
  onBrowseShops,
}) => {
  const { cart, updateQuantity, clearCart } = useCart();
  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const shopName = cart?.shopName || 'Local Karanja Shop';
  const itemsTotalPaise = cart?.itemsTotalPaise || 0;
  const totalPaise = cart?.totalPaise || 0;

  // Empty cart state
  if (!cart || items.length === 0 || itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans select-none">
        {/* Top Header */}
        <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-slate-100">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-extrabold text-[#111827]">Your Cart</h1>
          <div className="w-10" />
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-[#e8f3ea] flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-[#1b5e39]" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111827] mb-1.5">Your cart is empty</h2>
          <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
            You haven't added any items yet. Explore verified local shops in Karanja to start ordering.
          </p>
          <button
            onClick={onBrowseShops}
            className="px-6 py-3.5 bg-[#1b5e39] hover:bg-[#155a34] active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
          >
            <span>Browse Local Shops</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between font-sans select-none pb-28">
      {/* ── TOP HEADER ── */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-extrabold text-[#111827]">Your Cart</h1>
          <p className="text-[10px] text-slate-400 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''} from {shopName}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer px-2 py-1"
        >
          Clear
        </button>
      </div>

      <div className="p-4 space-y-3.5 flex-1">
        {/* 1. Delivery Estimate Banner */}
        <div className="bg-[#155a34] rounded-[22px] p-4 text-white flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Delivery in 15–20 minutes</div>
            <div className="text-xs text-emerald-200 mt-0.5">Direct from {shopName}</div>
          </div>
        </div>

        {/* 2. Shop Items List */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          {/* Shop Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#1b5e39]" />
              <span className="text-xs font-extrabold text-[#111827]">{shopName}</span>
              <span className="text-[9px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.2 rounded-full">
                Verified
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Dynamic Item Rows */}
          <div className="space-y-3 divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.productId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🛍</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#111827] truncate">{item.name}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.unit}</div>
                    <div className="text-xs font-extrabold text-[#111827] mt-1">
                      {formatPaiseToRupees(item.pricePaise)}
                    </div>
                  </div>
                </div>

                {/* Stepper Pill */}
                <div className="flex items-center gap-2.5 bg-[#1b5e39] text-white rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.qty - 1)}
                    className="hover:opacity-80 active:scale-90 transition cursor-pointer p-0.5"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[14px] text-center font-bold">{item.qty}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.qty + 1)}
                    className="hover:opacity-80 active:scale-90 transition cursor-pointer p-0.5"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add more items from shop */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onBrowseShops}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b5e39] hover:underline cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add more items</span>
            </button>
          </div>
        </div>

        {/* 3. Apply a Coupon */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1b5e39] transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f97316] flex items-center justify-center font-bold text-sm">
              %
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111827]">AAPNAFIRST</span>
                <span className="text-[9px] font-extrabold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.2 rounded">APPLIED</span>
              </div>
              <div className="text-[11px] text-slate-400">Zero delivery fee applied on pilot order</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 4. Bill Details */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider mb-1">
            Bill details
          </h3>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Item total ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
            <span className="font-semibold text-[#111827]">{formatPaiseToRupees(itemsTotalPaise)}</span>
          </div>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Delivery fee</span>
            <span className="font-bold text-[#1b5e39]">FREE</span>
          </div>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Handling &amp; Packaging</span>
            <span className="font-bold text-[#1b5e39]">FREE</span>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-sm">
            <span className="font-extrabold text-[#111827]">To pay</span>
            <span className="font-extrabold text-[#111827] text-base">{formatPaiseToRupees(totalPaise)}</span>
          </div>
        </div>

        {/* 5. Zero Fee Trust Badge */}
        <div className="rounded-2xl bg-[#f0fdf4] border border-[#cde5d2] p-3 flex items-center gap-2.5 text-xs text-[#1b5e39]">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span className="text-[11px] font-semibold">Zero Commission Pilot Guarantee • 100% of price goes to local shop</span>
        </div>
      </div>

      {/* ── STICKY BOTTOM CHECKOUT ACTION ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center justify-between max-w-md mx-auto shadow-lg">
        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total to pay</div>
          <div className="text-lg font-black text-[#111827]">{formatPaiseToRupees(totalPaise)}</div>
        </div>

        <button
          onClick={onProceedToCheckout}
          className="px-6 py-3.5 bg-[#1b5e39] hover:bg-[#155a34] active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
