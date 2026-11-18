import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowLeft, MoreHorizontal, Check, ShoppingBag, Truck, Home, Phone, Store } from 'lucide-react';

interface OrderStatusPageProps {
  orderId?: string;
  onBack: () => void;
  onBrowseShops: () => void;
}

const STATUS_STEPS = [
  { key: 'placed', label: 'Order confirmed', icon: Check },
  { key: 'shop_accepted', label: 'Shop accepted', icon: Check },
  { key: 'preparing', label: 'Preparing your order', icon: ShoppingBag },
  { key: 'ready_for_pickup', label: 'Ready for delivery', icon: ShoppingBag },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STATUS_ORDER: Record<string, number> = {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
      const interval = setInterval(loadOrder, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      const res = await api.getOrderById(orderId);
      if (res.success) {
        setOrder(res.order);
        setItems(res.items || []);
        setError('');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans animate-pulse">
        <div className="bg-white px-4 py-3 h-14 border-b border-slate-100" />
        <div className="h-48 bg-slate-200" />
        <div className="p-4 space-y-3">
          <div className="h-20 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!orderId || (!order && !loading)) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center gap-4 font-sans px-4">
        <ShoppingBag className="w-16 h-16 text-slate-300" />
        <h2 className="text-base font-bold text-slate-800">No Order Selected</h2>
        <p className="text-xs text-slate-500 text-center">
          {error || 'Select an order from your order history to track it.'}
        </p>
        <button
          onClick={onBrowseShops}
          className="px-6 py-2.5 bg-[#1b5e39] text-white rounded-xl text-xs font-bold"
        >
          Browse Shops
        </button>
      </div>
    );
  }

  const currentStepIdx = STATUS_ORDER[order?.status] ?? 0;

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans select-none pb-12">
      
      {/* 1. Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-[#111827]">Track order</h1>
          {order?.orderNumber && (
            <p className="text-[10px] text-slate-400">#{order.orderNumber}</p>
          )}
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        
        {/* 2. Delivery Route Map Illustration */}
        <div className="relative h-48 bg-[#e2eee4] overflow-hidden flex items-center justify-between px-8">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M-20,100 L420,100" stroke="#ffffff" strokeWidth="20" />
            <path d="M100,-20 L280,220" stroke="#ffffff" strokeWidth="12" />
          </svg>
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0 border-b-2 border-dashed border-[#1b5e39] z-10" />

          <div className="relative z-20 w-12 h-12 rounded-2xl bg-[#1b5e39] text-white flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-white" />
          </div>

          <div className={`relative z-20 w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ${currentStepIdx >= 4 ? 'bg-[#f97316]' : 'bg-slate-400'}`}>
            <Truck className="w-5 h-5 text-white" />
          </div>

          <div className="relative z-20 w-12 h-12 rounded-2xl bg-white text-[#1b5e39] flex items-center justify-center shadow-md border border-slate-200">
            <Home className="w-6 h-6 text-[#1b5e39]" />
          </div>
        </div>

        <div className="px-4 space-y-3.5">
          
          {/* 3. Order Summary Card */}
          <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Order total</div>
                <div className="text-[28px] font-extrabold text-[#111827] tracking-tight leading-tight mt-0.5">
                  {order?.totalPaise ? formatPaiseToRupees(order.totalPaise) : '—'}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                order?.status === 'delivered' || order?.status === 'completed'
                  ? 'bg-[#e8f3ea] text-[#1b5e39]'
                  : 'bg-[#fff7ed] text-[#ea580c]'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  order?.status === 'delivered' ? 'bg-[#1b5e39]' : 'bg-[#f97316]'
                }`} />
                <span className="capitalize">{order?.status?.replace(/_/g, ' ')}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              {order?.fulfilmentType === 'delivery' ? '🚚 Home delivery' : '🏪 Pickup from shop'} •{' '}
              {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* 4. Timeline Milestones */}
          <div className="bg-white rounded-[22px] p-5 border border-slate-200/80 shadow-xs space-y-6">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = currentStepIdx > idx;
              const isActive = currentStepIdx === idx;
              const Icon = step.icon;
              const isLast = idx === STATUS_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3.5 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-xs ${
                    isDone
                      ? 'bg-[#e8f3ea] text-[#1b5e39]'
                      : isActive
                        ? 'bg-[#e8f3ea] text-[#1b5e39] ring-4 ring-[#e8f3ea]/50'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h4 className={`text-xs font-bold ${isDone || isActive ? 'text-[#111827]' : 'text-slate-700'}`}>
                      {step.label}
                    </h4>
                  </div>
                  {!isLast && (
                    <div className={`absolute left-4 top-8 bottom-[-24px] w-0.5 ${isDone ? 'bg-[#1b5e39]' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* 5. Items List */}
          {items.length > 0 && (
            <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-2">Order items</h3>
              <div className="space-y-1.5">
                {items.map((it: any) => (
                  <div key={it._id} className="flex items-center justify-between text-xs text-slate-700">
                    <span>
                      <strong className="text-slate-900">{it.qty}×</strong> {it.name} ({it.unit})
                    </span>
                    <span className="font-semibold">{formatPaiseToRupees(it.subtotalPaise)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Support */}
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
