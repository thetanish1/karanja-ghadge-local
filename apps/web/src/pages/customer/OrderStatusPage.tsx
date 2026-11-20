import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ShoppingBag, Phone, MessageCircle, MapPin, Store, Star } from 'lucide-react';

interface OrderStatusPageProps {
  orderId?: string;
  onBack: () => void;
  onBrowseShops: () => void;
}

function generateHandoverPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function formatTime(ts: string | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

type TrackStep = {
  key: string;
  icon: string;
  label: string;
  sublabel: string;
  statusKeys: string[];
  badge?: string;
  badgeColor?: string;
};

const TRACK_STEPS: TrackStep[] = [
  {
    key: 'placed',
    icon: '✅',
    label: 'Order Placed',
    sublabel: 'Payment confirmed via Google Pay UPI',
    statusKeys: ['placed', 'shop_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'picked_up', 'delivered', 'completed'],
  },
  {
    key: 'shop_accepted',
    icon: '✅',
    label: 'Store Confirmed',
    sublabel: 'Store accepted your order',
    statusKeys: ['shop_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'picked_up', 'delivered', 'completed'],
  },
  {
    key: 'preparing',
    icon: '🟡',
    label: 'Packing Your Bag',
    sublabel: 'Fresh items being weighed and packed safely',
    statusKeys: ['preparing', 'ready_for_pickup', 'out_for_delivery', 'picked_up', 'delivered', 'completed'],
    badge: 'NOW',
    badgeColor: 'bg-[#f97316] text-white',
  },
  {
    key: 'out_for_delivery',
    icon: '⬜',
    label: 'Delivery Partner En Route to Store',
    sublabel: 'Rider is on the way to the store',
    statusKeys: ['out_for_delivery', 'picked_up', 'delivered', 'completed'],
    badge: 'Next',
    badgeColor: 'bg-slate-100 text-slate-500',
  },
  {
    key: 'delivered',
    icon: '⬜',
    label: 'Delivered at Doorstep',
    sublabel: '~15–20 mins estimated',
    statusKeys: ['delivered', 'completed'],
  },
];

const STATUS_RANK: Record<string, number> = {
  placed: 0,
  shop_accepted: 1,
  preparing: 2,
  ready_for_pickup: 3,
  out_for_delivery: 4,
  picked_up: 4,
  delivered: 5,
  completed: 5,
};

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
  orderId,
  onBack,
  onBrowseShops,
}) => {
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [handoverPin] = useState<string>(generateHandoverPin);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await api.getOrderById(orderId);
      if (res.success) {
        setOrder(res.order);
        setItems(res.items || []);
        setEvents(res.events || []);
        setError('');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      const interval = setInterval(loadOrder, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [orderId, loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans animate-pulse select-none">
        <div className="bg-white px-4 py-3 h-14 border-b border-slate-100" />
        <div className="h-28 bg-[#e8f3ea]" />
        <div className="p-4 space-y-3">
          <div className="h-24 bg-slate-200 rounded-[24px]" />
          <div className="h-32 bg-slate-200 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (!orderId || (!order && !loading)) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center gap-4 font-sans px-4 select-none">
        <ShoppingBag className="w-16 h-16 text-slate-300" />
        <h2 className="text-base font-extrabold text-slate-800">No Order Selected</h2>
        <p className="text-xs text-slate-500 text-center">
          {error || 'Select an order from your order history to track it.'}
        </p>
        <button
          onClick={onBrowseShops}
          className="px-6 py-2.5 bg-[#1b5e39] text-white rounded-full text-xs font-bold"
        >
          Browse Shops
        </button>
      </div>
    );
  }

  const rank = STATUS_RANK[order?.status] ?? 0;
  const displayOrderNum = order?.orderNumber || (orderId ? orderId.replace(/^#?/, '#AC-') : '#AC-89241');
  const totalPaise = order?.totalPaise ?? 0;
  const itemTotal = items.reduce((s: number, it: any) => s + (it.subtotalPaise ?? 0), 0);
  const shopName = order?.shopName || 'Shree Ganesh Kirana';
  const deliveryAddress = order?.deliveryAddress;
  const riderName = order?.riderName || 'Suresh Kumar';
  const riderPhone = order?.riderPhone || '';
  const riderRating = order?.riderRating || 4.8;
  const riderInitials = riderName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  // Build timestamp map from events
  const eventMap: Record<string, string> = {};
  (events || []).forEach((ev: any) => {
    if (ev.status) eventMap[ev.status] = ev.createdAt || ev.timestamp || '';
  });
  if (!eventMap['placed'] && order?.createdAt) eventMap['placed'] = order.createdAt;

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans select-none pb-10">

      {/* ── TOP HEADER ── */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Back"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[15px] font-extrabold text-[#1b5e39] tracking-tight">AapnaCart</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">Customer Order Tracking &amp; Payment S…</span>
          </div>
        </div>
        <button className="text-[11px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-3 py-1.5 rounded-full cursor-pointer">
          Help
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ── PAYMENT BADGE + HEADING ── */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs">
          <div className="inline-flex items-center gap-1.5 bg-[#e8f3ea] text-[#1b5e39] text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            <span>✅</span> Payment Successful via UPI
          </div>
          <h1 className="text-[22px] font-extrabold text-[#111827] leading-tight mb-1">
            Order Placed with AapnaCart!
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {displayOrderNum}
            </span>
            <div className="flex items-center gap-1.5 bg-[#e8f3ea] text-[#1b5e39] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span>🕐</span> 15 – 20 Mins
              <span className="bg-[#1b5e39] text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">On Time</span>
            </div>
          </div>
        </div>

        {/* ── DELIVERY HANDOVER PIN ── */}
        <div className="bg-white rounded-[24px] p-5 border border-[#1b5e39]/20 shadow-xs">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="text-[13px] font-extrabold text-[#111827]">🔐 Delivery Handover PIN</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Share upon arrival</div>
            </div>
            <span className="text-[9px] text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full font-bold">SECURE</span>
          </div>
          <div className="flex gap-2.5 my-3 justify-center">
            {handoverPin.split('').map((digit, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl bg-[#f8faf9] border-2 border-[#1b5e39]/30 flex items-center justify-center text-2xl font-extrabold text-[#1b5e39] shadow-xs"
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            This PIN is shown to your delivery partner at doorstep
          </p>
        </div>

        {/* ── RIDER INFO STRIP ── */}
        <div className="bg-white rounded-[24px] px-4 py-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1b5e39] flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
            {riderInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-[#111827] truncate">{riderName}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-2.5 h-2.5 ${s <= Math.round(riderRating) ? 'fill-[#f97316] text-[#f97316]' : 'text-slate-300'}`}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-0.5">{riderRating}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hero Electric Nyx • 1.2 km away</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={riderPhone ? `tel:${riderPhone}` : '#'}
              className="w-9 h-9 rounded-full bg-[#e8f3ea] flex items-center justify-center cursor-pointer hover:bg-[#d1ead4] transition"
              aria-label="Call rider"
            >
              <Phone className="w-4 h-4 text-[#1b5e39]" />
            </a>
            <button className="w-9 h-9 rounded-full bg-[#fff7ed] flex items-center justify-center cursor-pointer hover:bg-orange-100 transition" aria-label="Chat">
              <MessageCircle className="w-4 h-4 text-[#f97316]" />
            </button>
          </div>
        </div>

        {/* ── ORDER TRACKING TIMELINE ── */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-extrabold text-[#111827]">Order Tracking</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e39] animate-pulse inline-block" />
              Live Updates
            </span>
          </div>
          <div className="space-y-5">
            {TRACK_STEPS.map((step, idx) => {
              const isDone = rank > idx;
              const isActive = rank === idx;
              const isFuture = rank < idx;
              const ts = eventMap[step.key];
              const isLast = idx === TRACK_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* connector line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[14px] top-7 bottom-[-20px] w-0.5 ${isDone ? 'bg-[#1b5e39]' : 'bg-slate-200'}`}
                    />
                  )}
                  {/* icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs border-2 ${
                    isDone
                      ? 'bg-[#e8f3ea] border-[#1b5e39] text-[#1b5e39]'
                      : isActive
                        ? 'bg-[#e8f3ea] border-[#1b5e39] ring-4 ring-[#e8f3ea]/60 text-[#1b5e39]'
                        : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}>
                    {isDone ? '✓' : isActive ? '●' : '○'}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[12px] font-bold ${isFuture ? 'text-slate-400' : 'text-[#111827]'}`}>
                        {step.label}
                      </span>
                      {isActive && step.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${step.badgeColor}`}>
                          {step.badge}
                        </span>
                      )}
                      {isFuture && step.badge && step.badge === 'Next' && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
                          Next
                        </span>
                      )}
                    </div>
                    {ts && (
                      <div className="text-[10px] text-slate-400 mt-0.5">{formatTime(ts)}</div>
                    )}
                    <div className={`text-[10px] mt-0.5 ${isFuture ? 'text-slate-300' : 'text-slate-500'}`}>
                      {step.key === 'placed' && totalPaise > 0
                        ? `Payment of ${formatPaiseToRupees(totalPaise)} confirmed via Google Pay UPI`
                        : step.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SHOP + BILL SECTION ── */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs">
          {/* Shop info */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f3ea] flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-[#1b5e39]" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-extrabold text-[#111827]">{shopName}</div>
              <div className="text-[10px] text-slate-400">Civil Lines · Hyperlocal Verified</div>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#e8f3ea] flex items-center justify-center cursor-pointer hover:bg-[#d1ead4] transition" aria-label="Call shop">
              <Phone className="w-4 h-4 text-[#1b5e39]" />
            </button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="py-3 border-b border-slate-100 space-y-2">
              {items.map((it: any) => (
                <div key={it._id || it.id || it.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-700">
                    <span className="font-bold text-slate-900">{it.qty}×</span> {it.name}
                    {it.unit ? <span className="text-slate-400 ml-1">({it.unit})</span> : null}
                  </span>
                  <span className="font-semibold text-[#111827]">{formatPaiseToRupees(it.subtotalPaise ?? 0)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bill breakdown */}
          <div className="pt-3 space-y-2">
            <div className="flex justify-between text-[12px] text-slate-600">
              <span>Item Total</span>
              <span className="font-semibold">{formatPaiseToRupees(itemTotal)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-slate-600">
              <span>Delivery Partner Fee (Local)</span>
              <span className="font-bold text-[#1b5e39]">FREE</span>
            </div>
            <div className="flex justify-between text-[12px] text-slate-600">
              <span>Handling &amp; Packaging</span>
              <span className="font-bold text-[#1b5e39]">FREE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-[13px]">
              <span className="font-extrabold text-[#111827]">Total Paid</span>
              <span className="font-extrabold text-[#111827]">{formatPaiseToRupees(totalPaise)}</span>
            </div>
            <div className="text-[10px] text-slate-400 text-right">
              via Google Pay UPI • Ref {displayOrderNum.replace('#AC-', '#')}
            </div>
          </div>
        </div>

        {/* ── DELIVERY ADDRESS ── */}
        {deliveryAddress && (
          <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e8f3ea] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#1b5e39]" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-[#111827] mb-0.5">📍 Home</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                {[deliveryAddress.line, deliveryAddress.landmark, deliveryAddress.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="text-center pt-1 text-[11px] text-slate-400">
          <button className="font-bold text-[#1b5e39] hover:underline cursor-pointer">
            💬 Need help with this order? Chat with Support
          </button>
        </div>

        <button
          onClick={onBrowseShops}
          className="w-full py-4 rounded-[24px] bg-[#1b5e39] text-white text-[14px] font-extrabold tracking-wide hover:bg-[#155a34] active:scale-[0.98] transition cursor-pointer shadow-md"
        >
          🛍 Shop More Items
        </button>

      </div>
    </div>
  );
};
