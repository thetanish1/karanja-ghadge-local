import React, { useState, useEffect } from 'react';
import { formatPaiseToRupees } from '@karanjaghadge/shared';

interface OrderSuccessPageProps {
  orderId: string;
  orderNumber: string;
  totalPaise: number;
  shopName: string;
  estimatedMinutes?: number;
  onTrackOrder: () => void;
  onShopMore: () => void;
}

function generateHandoverPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId: _orderId,
  orderNumber,
  totalPaise,
  shopName,
  estimatedMinutes = 20,
  onTrackOrder,
  onShopMore,
}) => {
  const [handoverPin] = useState<string>(generateHandoverPin);

  // Animate confetti dots on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const displayOrderNum = orderNumber ? `#AC-${orderNumber}` : '#AC-89241';
  const minLow = Math.max(10, estimatedMinutes - 5);
  const minHigh = estimatedMinutes;

  const confettiDots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.17) % 100}%`,
    delay: `${(i * 0.13) % 1.5}s`,
    size: 6 + (i % 4) * 3,
    color: i % 3 === 0 ? '#1b5e39' : i % 3 === 1 ? '#f97316' : '#e8f3ea',
    top: `${(i * 7.3) % 40}%`,
    duration: `${1.5 + (i % 5) * 0.3}s`,
  }));

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none relative overflow-hidden">

      {/* ── CSS Confetti Dots ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiDots.map((dot) => (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              backgroundColor: dot.color,
              opacity: mounted ? 0.6 : 0,
              transform: mounted ? `translateY(${dot.id % 2 === 0 ? '20px' : '-20px'}) rotate(${dot.id * 15}deg)` : 'translateY(0)',
              transition: `opacity ${dot.duration} ${dot.delay} ease-out, transform ${dot.duration} ${dot.delay} ease-out`,
            }}
          />
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10 relative z-10">

        {/* Giant success icon */}
        <div
          className="w-20 h-20 rounded-full bg-[#e8f3ea] flex items-center justify-center mb-5"
          style={{
            transform: mounted ? 'scale(1)' : 'scale(0.6)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="text-4xl">✅</span>
        </div>

        {/* Payment badge */}
        <div
          className="inline-flex items-center gap-1.5 bg-[#e8f3ea] text-[#1b5e39] text-[11px] font-bold px-3 py-1 rounded-full mb-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s 0.15s, transform 0.4s 0.15s',
          }}
        >
          ✅ Payment Successful via UPI
        </div>

        {/* Big heading */}
        <h1
          className="text-[26px] font-extrabold text-[#111827] text-center leading-tight mb-2"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s 0.22s, transform 0.4s 0.22s',
          }}
        >
          Order Placed<br />with AapnaCart!
        </h1>

        {/* Subtext */}
        <p
          className="text-[12px] text-slate-400 text-center mb-5"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.4s 0.3s',
          }}
        >
          From {shopName} • {formatPaiseToRupees(totalPaise)} paid
        </p>

        {/* Order ID badge */}
        <div
          className="bg-slate-100 text-slate-600 text-[12px] font-bold px-4 py-1.5 rounded-full mb-4"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.4s 0.32s',
          }}
        >
          {displayOrderNum}
        </div>

        {/* ETA card */}
        <div
          className="w-full bg-white border border-[#1b5e39]/20 rounded-[24px] p-4 flex items-center justify-between mb-4 shadow-xs"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s 0.38s, transform 0.4s 0.38s',
          }}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Estimated Arrival</div>
            <div className="text-[18px] font-extrabold text-[#111827]">🕐 {minLow} – {minHigh} Mins</div>
          </div>
          <span className="bg-[#e8f3ea] text-[#1b5e39] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
            On Time
          </span>
        </div>

        {/* Handover PIN */}
        <div
          className="w-full bg-white border border-[#1b5e39]/30 rounded-[24px] p-4 mb-6"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s 0.44s, transform 0.4s 0.44s',
          }}
        >
          <div className="text-[12px] font-extrabold text-[#111827] mb-0.5">🔐 Delivery Handover PIN</div>
          <div className="text-[10px] text-slate-400 mb-3">Share this PIN with your delivery partner at doorstep</div>
          <div className="flex gap-2.5 justify-center">
            {handoverPin.split('').map((digit, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-2xl bg-[#f8faf9] border-2 border-[#1b5e39]/30 flex items-center justify-center text-xl font-extrabold text-[#1b5e39] shadow-xs"
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className="w-full space-y-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s 0.5s, transform 0.4s 0.5s',
          }}
        >
          <button
            onClick={onTrackOrder}
            className="w-full py-4 rounded-[24px] bg-[#1b5e39] text-white text-[14px] font-extrabold hover:bg-[#155a34] active:scale-[0.98] transition cursor-pointer shadow-md"
          >
            📦 Track My Order
          </button>
          <button
            onClick={onShopMore}
            className="w-full py-3.5 rounded-[24px] border-2 border-[#1b5e39] text-[#1b5e39] text-[14px] font-extrabold hover:bg-[#f0faf2] active:scale-[0.98] transition cursor-pointer"
          >
            🛍 Shop More Items
          </button>
        </div>

      </div>
    </div>
  );
};
