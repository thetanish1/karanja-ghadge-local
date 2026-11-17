import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { StatusBadge } from '../../components/StatusBadge.js';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  Store,
  Phone,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface OrderStatusPageProps {
  orderId: string;
  onBack: () => void;
  onBrowseShops: () => void;
}

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ orderId, onBack, onBrowseShops }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
    // Poll for status updates every 8 seconds
    const interval = setInterval(loadOrder, 8000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await api.getOrderById(orderId);
      if (res.success) {
        setData(res);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      const res = await api.cancelOrder(orderId, cancelReason);
      if (res.success) {
        setCancelModalOpen(false);
        await loadOrder();
      }
    } catch (e: any) {
      alert(e.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto animate-pulse">
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">Order not found.</p>
        <button onClick={onBack} className="mt-3 text-xs text-emerald-600 font-bold underline">
          Back
        </button>
      </div>
    );
  }

  const { order, items, events } = data;

  // Check if cancellation is permitted (only before preparing)
  const canCancel = ['placed', 'shop_accepted'].includes(order.status);

  // Status steps mapping
  const steps =
    order.fulfilmentType === 'pickup'
      ? ['placed', 'shop_accepted', 'preparing', 'ready_for_pickup', 'completed']
      : ['placed', 'shop_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];

  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Orders</span>
        </button>
        <div className="text-right">
          <div className="text-xs font-extrabold text-slate-900">#{order.orderNumber}</div>
          <div className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="inline-block mb-2">
          <StatusBadge status={order.status} />
        </div>

        <h2 className="text-lg font-extrabold text-slate-900 capitalize">
          {order.status.replace(/_/g, ' ')}
        </h2>

        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          {order.status === 'placed' && 'Sent to shopkeeper. Waiting for shop confirmation.'}
          {order.status === 'shop_accepted' && 'Shopkeeper accepted! Packing items shortly.'}
          {order.status === 'preparing' && 'Shop is preparing your order.'}
          {order.status === 'ready_for_pickup' &&
            (order.fulfilmentType === 'pickup'
              ? 'Your order is ready at the shop counter for pickup!'
              : 'Order packed! Waiting for delivery rider.')}
          {order.status === 'out_for_delivery' && 'Delivery partner is on the way to your address!'}
          {order.status === 'delivered' && 'Delivered successfully. Thank you for supporting local Karanja shops!'}
          {order.status === 'completed' && 'Order completed.'}
          {order.status === 'cancelled' && `Cancelled. Reason: ${order.cancellationReason || 'Cancelled by user/shop'}`}
          {order.status === 'shop_rejected' && `Shop rejected order. Reason: ${order.rejectionReason || 'Item unavailable'}`}
        </p>

        {/* Delivery OTP Card (Only visible to customer when out for delivery or ready) */}
        {order.deliveryOtp && !['delivered', 'completed', 'cancelled', 'shop_rejected'].includes(order.status) && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 inline-flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> Delivery Verification OTP
            </span>
            <span className="text-2xl font-mono font-black text-emerald-900 tracking-widest mt-1">
              {order.deliveryOtp}
            </span>
            <span className="text-[10px] text-emerald-700 mt-0.5">Share with driver upon handover</span>
          </div>
        )}

        {/* Honest Milestone Progress Line */}
        {!['cancelled', 'shop_rejected'].includes(order.status) && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
            {steps.map((s, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx;
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] transition ${
                      isPastOrCurrent
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPastOrCurrent ? '✓' : idx + 1}
                  </div>
                  <span className={`capitalize text-center leading-tight ${isPastOrCurrent ? 'text-emerald-800 font-bold' : ''}`}>
                    {s === 'shop_accepted' ? 'Accepted' : s === 'ready_for_pickup' ? 'Ready' : s === 'out_for_delivery' ? 'Out' : s}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shop Information & Contact */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shop Details</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{order.shopName}</h4>
            <p className="text-xs text-slate-500">{order.shopAddress}</p>
          </div>
          {order.shopPhone && (
            <a
              href={`tel:${order.shopPhone}`}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ordered Items</h3>
        <div className="divide-y divide-slate-100">
          {items.map((it: any) => (
            <div key={it._id} className="py-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">{it.name}</span>
                <span className="text-slate-500 ml-2">x {it.qty} {it.unit}</span>
              </div>
              <span className="font-bold text-slate-900">{formatPaiseToRupees(it.subtotalPaise)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">Total Paid ({order.paymentMethod.toUpperCase()})</span>
          <span className="text-sm font-extrabold text-emerald-700">{formatPaiseToRupees(order.totalPaise)}</span>
        </div>
      </div>

      {/* Activity Timeline (Append-Only OrderEvents) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Status Timeline</h3>
        <div className="space-y-3">
          {events.map((ev: any) => (
            <div key={ev.id} className="flex items-start gap-2.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-900 capitalize">
                  {ev.to.replace(/_/g, ' ')}
                  <span className="text-[10px] font-normal text-slate-400 ml-1.5">by {ev.actorRole}</span>
                </div>
                {ev.reason && <p className="text-[11px] text-slate-600 italic">"{ev.reason}"</p>}
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(ev.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Cancellation Request button (strictly permitted only before preparing) */}
      {canCancel && (
        <button
          onClick={() => setCancelModalOpen(true)}
          className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-4 h-4" />
          <span>Request Order Cancellation</span>
        </button>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Cancel Order?</h3>
            <p className="text-xs text-slate-500 mb-3">
              Cancellation is only allowed before the shopkeeper starts preparing your items.
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
