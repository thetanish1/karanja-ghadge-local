import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Clock, Store, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';

interface OrderHistoryPageProps {
  onSelectOrder: (orderId: string) => void;
  onBrowseShops: () => void;
  onOpenAuth: () => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onSelectOrder, onBrowseShops, onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.warn('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto space-y-4 pt-16">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Sign in to View Order History</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sign in to track active orders and review past purchases from Karanja shops.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3 max-w-md mx-auto animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto space-y-4 pt-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">No Past Orders</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You haven't placed any orders yet. Browse local Karanjaghadge stores to place your first order.
        </p>
        <button
          onClick={onBrowseShops}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Order History</h2>
        <span className="text-xs text-slate-500 font-medium">{orders.length} orders</span>
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => onSelectOrder(o.id)}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">#{o.orderNumber}</h3>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(o.createdAt).toLocaleDateString()} at{' '}
                  {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-900">{formatPaiseToRupees(o.totalPaise)}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{o.fulfilmentType}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{o.shopName}</span>
                <span className="text-slate-400">• {o.itemCount} items</span>
              </div>

              <span className="text-emerald-700 font-bold flex items-center gap-0.5 flex-shrink-0">
                Track <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
