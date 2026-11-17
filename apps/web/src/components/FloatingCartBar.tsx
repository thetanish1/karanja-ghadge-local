import React from 'react';
import { useCart } from '../context/CartContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onOpenCart }) => {
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;
  const totalPaise = (cart?.items?.reduce((sum: number, i: any) => sum + (i.pricePaise || 3600) * (i.qty || 1), 0)) || (itemCount * 3600) || 3600;

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 sm:left-auto sm:right-auto sm:w-full sm:max-w-[430px] z-30 px-4 py-2 pointer-events-none">
      <button
        onClick={onOpenCart}
        className="w-full h-13 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white rounded-[20px] shadow-xl px-4 flex items-center justify-between pointer-events-auto transition cursor-pointer"
      >
        {/* Left: Bag icon with orange badge */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
              <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              {itemCount}
            </span>
          </div>

          <div className="text-left">
            <div className="text-xs font-bold text-white leading-tight">View cart</div>
            <div className="text-[11px] text-white/80 font-medium">
              {formatPaiseToRupees(totalPaise)} • incl. taxes
            </div>
          </div>
        </div>

        {/* Right: Arrow */}
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
