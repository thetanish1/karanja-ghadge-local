import React from 'react';
import { useCart } from '../context/CartContext.js';
import { ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  onOpenCart: () => void;
  isShopDetail?: boolean;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  onOpenCart,
  isShopDetail = false,
}) => {
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;
  const totalPaise = cart?.totalPaise || 0;

  if (itemCount <= 0) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-3.5 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
        isShopDetail ? 'bottom-4' : 'bottom-[72px]'
      }`}
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full h-[54px] bg-[#155030] hover:bg-[#124529] active:scale-[0.99] text-white rounded-[20px] shadow-[0_10px_25px_-5px_rgba(21,80,48,0.4)] px-3.5 flex items-center justify-between pointer-events-auto transition cursor-pointer border border-[#1b5e39]"
      >
        {/* Left: Bag icon with orange counter badge + Text */}
        <div className="flex items-center gap-3">
          {/* Rounded translucent green bag box */}
          <div className="relative w-9 h-9 rounded-[13px] bg-[#225e3c] flex items-center justify-center flex-shrink-0 shadow-xs">
            <svg
              className="w-4.5 h-4.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
              <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" strokeLinecap="round" />
            </svg>

            {/* Figma Orange item count pill */}
            <span className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center shadow-xs leading-none">
              {itemCount}
            </span>
          </div>

          {/* Typography */}
          <div className="text-left">
            <div className="text-sm font-bold text-white tracking-tight leading-tight">
              View cart
            </div>
            <div className="text-[11px] text-white/80 font-medium leading-tight mt-0.5">
              ₹{(totalPaise / 100).toFixed(0)} • incl. taxes
            </div>
          </div>
        </div>

        {/* Right: Sleek White Arrow */}
        <div className="text-white flex items-center justify-center pr-1">
          <ArrowRight className="w-5 h-5 stroke-[2.2]" />
        </div>
      </button>
    </div>
  );
};
