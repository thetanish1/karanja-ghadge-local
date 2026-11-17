import React from 'react';
import { ArrowLeft, MoreHorizontal, Check, ShoppingBag, Truck, Home, Phone, Star, Store } from 'lucide-react';

interface OrderStatusPageProps {
  orderId?: string;
  onBack: () => void;
  onBrowseShops: () => void;
}

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
  orderId = '#AC2409',
  onBack,
  onBrowseShops,
}) => {
  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between font-sans select-none pb-12">
      
      {/* 1. Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Track order</h1>
        <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        
        {/* 2. Top Stylized Delivery Route Map */}
        <div className="relative h-48 bg-[#e2eee4] overflow-hidden flex items-center justify-between px-8">
          {/* Subtle vector map roads */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M-20,100 L420,100" stroke="#ffffff" strokeWidth="20" />
            <path d="M100,-20 L280,220" stroke="#ffffff" strokeWidth="12" />
          </svg>

          {/* Dotted green delivery path */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0 border-b-2 border-dashed border-[#1b5e39] z-10" />

          {/* Store Pin (Left) */}
          <div className="relative z-20 w-12 h-12 rounded-2xl bg-[#1b5e39] text-white flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-white" />
          </div>

          {/* Delivery Vehicle Icon on Route (Middle) */}
          <div className="relative z-20 w-11 h-11 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Truck className="w-5 h-5 text-white" />
          </div>

          {/* Home Pin (Right) */}
          <div className="relative z-20 w-12 h-12 rounded-2xl bg-white text-[#1b5e39] flex items-center justify-center shadow-md border border-slate-200">
            <Home className="w-6 h-6 text-[#1b5e39]" />
          </div>
        </div>

        <div className="px-4 space-y-3.5">
          
          {/* 3. ETA Card */}
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Arriving by</div>
              <div className="text-[28px] font-extrabold text-[#111827] tracking-tight leading-tight mt-0.5">
                10:10 AM
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b5e39] bg-[#e8f3ea] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#1b5e39] animate-pulse" />
              <span>On time • 18–24 min</span>
            </div>
          </div>

          {/* 4. Timeline Milestones */}
          <div className="bg-white rounded-[22px] p-5 border border-slate-200/80 shadow-xs space-y-6">
            
            {/* Step 1: Order confirmed */}
            <div className="flex items-start gap-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-[#111827]">Order confirmed</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">9:42 AM</p>
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-[#1b5e39]" />
            </div>

            {/* Step 2: Preparing your order (Active) */}
            <div className="flex items-start gap-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center flex-shrink-0 z-10 shadow-xs ring-4 ring-[#e8f3ea]/50">
                <ShoppingBag className="w-4 h-4 text-[#1b5e39]" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-[#111827]">Preparing your order</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">The shop is packing your items</p>
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200" />
            </div>

            {/* Step 3: Out for delivery */}
            <div className="flex items-start gap-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 z-10">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-slate-700">Out for delivery</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Next</p>
              </div>
              {/* Connecting vertical line */}
              <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200" />
            </div>

            {/* Step 4: Delivered */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 z-10">
                <Home className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-slate-700">Delivered</h4>
              </div>
            </div>

          </div>

          {/* 5. Delivery Partner Card */}
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#fed7aa] text-[#c2410c] font-bold text-sm flex items-center justify-center flex-shrink-0">
                RS
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Your delivery partner</div>
                <div className="text-xs font-bold text-[#111827] mt-0.5">Ravi Singh</div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">4.9</span>
                  <span>•</span>
                  <span>520 deliveries</span>
                </div>
              </div>
            </div>

            <button className="w-10 h-10 rounded-full bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center hover:bg-[#d5edd9] transition shadow-xs cursor-pointer">
              <Phone className="w-4 h-4" />
            </button>
          </div>

          {/* Support Link */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Need help with your order?{' '}
            <button className="font-bold text-[#1b5e39] hover:underline cursor-pointer">
              Get support
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
