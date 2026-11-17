import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { ArrowLeft, Clock, Store, Plus, Minus, Percent, ChevronRight, Check, ArrowRight } from 'lucide-react';

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
  const itemCount = cart?.itemCount || 1;

  // Values matching Figma design
  const itemTotal = 36;
  const deliveryFee = 0; // FREE
  const handlingFee = 7;
  const toPay = itemTotal + deliveryFee + handlingFee;

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between font-sans select-none pb-24">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Your cart</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-[#1b5e39] hover:underline cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="p-4 space-y-3.5 flex-1">
        
        {/* 1. Delivery Estimate Banner */}
        <div className="bg-[#155a34] rounded-[20px] p-4 text-white flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Delivery in 18–24 minutes</div>
            <div className="text-xs text-white/80 mt-0.5">From Gupta Fresh Mart</div>
          </div>
        </div>

        {/* 2. Shop Items Card */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          {/* Shop Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#1b5e39]" />
              <span className="text-xs font-bold text-[#111827]">Gupta Fresh Mart</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">1 items</span>
          </div>

          {/* Product Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80"
                  alt="Fresh Red Tomatoes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Fresh Red Tomatoes</h4>
                <div className="text-[10px] text-slate-400 mt-0.5">500 g</div>
                <div className="text-xs font-extrabold text-[#111827] mt-1">₹36</div>
              </div>
            </div>

            {/* Stepper Pill */}
            <div className="flex items-center gap-2.5 bg-[#1b5e39] text-white rounded-xl px-2.5 py-1 text-xs font-bold shadow-xs">
              <button
                onClick={() => updateQuantity('prod-1', Math.max(itemCount - 1, 0))}
                className="hover:opacity-80 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[12px] text-center font-bold">{itemCount}</span>
              <button
                onClick={() => updateQuantity('prod-1', itemCount + 1)}
                className="hover:opacity-80 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add more items */}
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

        {/* 3. Apply a coupon */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1b5e39] transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center font-bold text-sm">
              %
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827]">Apply a coupon</div>
              <div className="text-[11px] text-slate-400">Save more on this order</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 4. Bill details */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
            Bill details
          </h3>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Item total</span>
            <span>₹{itemTotal}</span>
          </div>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Delivery fee</span>
            <span className="font-bold text-[#1b5e39]">FREE</span>
          </div>

          <div className="flex justify-between text-xs text-[#374151]">
            <span>Handling fee</span>
            <span>₹{handlingFee}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-[#111827]">
            <span>To pay</span>
            <span>₹{toPay}</span>
          </div>
        </div>

        {/* Savings banner */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1b5e39] py-1">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>You’re saving ₹42 on this order</span>
        </div>

      </div>

      {/* Bottom Fixed Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-full sm:max-w-[430px] z-30 bg-white border-t border-slate-200 p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Deliver to</div>
          <div className="text-xs font-bold text-[#111827]">Home • Sector 14</div>
        </div>

        <button
          onClick={onProceedToCheckout}
          className="flex-1 max-w-[200px] h-12 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-xs rounded-[16px] shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Proceed • ₹{toPay}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
