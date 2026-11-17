import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { StatusBadge } from '../../components/StatusBadge.js';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Store,
  Package,
  Truck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const OrderQueuePage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; orderId?: string }>({ isOpen: false });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      const res = await api.getShopQueue();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.warn('Queue error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (orderId: string, targetState: string, reason?: string) => {
    try {
      setActionLoading(true);
      const res = await api.transitionShopOrder(orderId, targetState, reason);
      if (res.success) {
        setRejectModal({ isOpen: false });
        setRejectReason('');
        await loadQueue();
      }
    } catch (e: any) {
      alert(e.message || 'Transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shop Order Queue</h2>
        </div>
        <button onClick={loadQueue} className="p-1 text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Free Pilot Commission Notice */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-ping" />
        <span className="font-semibold">Free Pilot Mode: ₹0 platform commission deducted from your sales!</span>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">No incoming orders right now.</p>
          <p className="mt-1">When residents place an order, it will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">#{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {o.fulfilmentType.toUpperCase()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">{formatPaiseToRupees(o.totalPaise)}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{o.paymentMethod}</div>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{o.customerName}</div>
                  <div className="text-[11px] text-slate-500">{o.customerPhone}</div>
                </div>
                {o.customerPhone && (
                  <a
                    href={`tel:${o.customerPhone}`}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1 text-xs border-t border-slate-100 pt-2">
                {o.items?.map((it: any) => (
                  <div key={it._id} className="flex justify-between text-slate-700">
                    <span>
                      <strong className="text-slate-900">{it.qty}x</strong> {it.name} ({it.unit})
                    </span>
                    <span className="font-semibold">{formatPaiseToRupees(it.subtotalPaise)}</span>
                  </div>
                ))}
              </div>

              {o.notes && (
                <div className="text-[11px] bg-amber-50 p-2 rounded-lg text-amber-800 italic">
                  Note: "{o.notes}"
                </div>
              )}

              {/* Workflow Actions Based on State Machine */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {o.status === 'placed' && (
                  <>
                    <button
                      onClick={() => handleTransition(o.id, 'shop_accepted')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept Order
                    </button>
                    <button
                      onClick={() => setRejectModal({ isOpen: true, orderId: o.id })}
                      disabled={actionLoading}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

                {o.status === 'shop_accepted' && (
                  <button
                    onClick={() => handleTransition(o.id, 'preparing')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Package className="w-3.5 h-3.5" /> Start Preparing Items
                  </button>
                )}

                {o.status === 'preparing' && (
                  <button
                    onClick={() => handleTransition(o.id, 'ready_for_pickup')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Ready for {o.fulfilmentType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                )}

                {o.status === 'ready_for_pickup' && o.fulfilmentType === 'pickup' && (
                  <button
                    onClick={() => handleTransition(o.id, 'completed')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Handed to Customer (Complete)
                  </button>
                )}

                {o.status === 'ready_for_pickup' && o.fulfilmentType === 'delivery' && (
                  <div className="w-full py-2 text-center text-xs text-purple-700 font-bold bg-purple-50 rounded-xl">
                    Packed. Waiting for delivery partner assignment.
                  </div>
                )}

                {['out_for_delivery', 'picked_up'].includes(o.status) && (
                  <div className="w-full py-2 text-center text-xs text-indigo-700 font-bold bg-indigo-50 rounded-xl flex items-center justify-center gap-1.5">
                    <Truck className="w-4 h-4" /> Out with delivery partner
                  </div>
                )}

                {o.status === 'delivered' && (
                  <div className="w-full py-2 text-center text-xs text-emerald-800 font-bold bg-emerald-50 rounded-xl">
                    ✓ Delivered to customer
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Reject Order</h3>
            <p className="text-xs text-slate-500 mb-3">
              Please specify a reason for rejecting this order (e.g. item out of stock).
            </p>
            <input
              type="text"
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRejectModal({ isOpen: false })}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransition(rejectModal.orderId!, 'shop_rejected', rejectReason)}
                disabled={actionLoading || !rejectReason.trim()}
                className="py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
