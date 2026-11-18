import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Bell, Plus, ShoppingBag, FileText, Wallet, ChevronRight, Store, AlertCircle, RefreshCw } from 'lucide-react';

interface ShopDashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'products' | 'orders' | 'sales') => void;
  onOpenAddProduct: () => void;
  onOpenOrder: (orderId: string) => void;
}

export const ShopDashboardPage: React.FC<ShopDashboardPageProps> = ({
  onNavigateTab,
  onOpenAddProduct,
  onOpenOrder,
}) => {
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [shopsRes, queueRes] = await Promise.all([
        api.getMyShops().catch(() => ({ success: false, shops: [] })),
        api.getShopQueue().catch(() => ({ success: false, orders: [] }))
      ]);

      if (shopsRes.success && shopsRes.shops && shopsRes.shops.length > 0) {
        setShop(shopsRes.shops[0]);
      }
      if (queueRes.success && queueRes.orders) {
        setOrders(queueRes.orders);
      }
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const newOrdersWaiting = orders.filter((o) => o.status === 'placed');
  const activeOrders = orders.filter((o) => ['placed', 'shop_accepted', 'preparing', 'ready_for_pickup'].includes(o.status));
  const completedOrders = orders.filter((o) => ['delivered', 'completed'].includes(o.status));

  // Compute total sales from completed/active orders
  const totalSalesPaise = orders.reduce((sum, o) => {
    return sum + (o.totalPaise || 0);
  }, 0);

  const avgOrderValuePaise = orders.length > 0 ? Math.round(totalSalesPaise / orders.length) : 0;
  const storeName = shop?.name || user?.name || 'My Local Shop';
  const isStoreOpen = shop ? !shop.isPaused : true;

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-2xl" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-24 font-sans select-none">
      {/* 1. Header: Greeting & Store Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SHOPKEEPER PORTAL
          </div>
          <h1 className="text-xl font-extrabold text-[#111827] tracking-tight">
            {storeName}
          </h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1b5e39] mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-[#1b5e39] animate-pulse' : 'bg-red-500'}`} />
            <span>{isStoreOpen ? 'Store is open for orders' : 'Store is paused'}</span>
          </div>
        </div>

        <button
          onClick={loadDashboardData}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Today's Sales Hero Card */}
      <div className="bg-[#155a34] rounded-[24px] p-5 text-white shadow-sm space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            TOTAL STORE VOLUME
          </div>
          <div className="text-[32px] font-extrabold tracking-tight mt-0.5">
            {formatPaiseToRupees(totalSalesPaise)}
          </div>
          <div className="text-xs font-medium text-emerald-200 mt-0.5">
            Zero commission pilot • 100% earnings go to you
          </div>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 pt-2 text-center border-t border-white/10">
          <div>
            <div className="text-base font-extrabold">{orders.length}</div>
            <div className="text-[10px] text-white/70 font-medium">Total orders</div>
          </div>
          <div>
            <div className="text-base font-extrabold">{formatPaiseToRupees(avgOrderValuePaise)}</div>
            <div className="text-[10px] text-white/70 font-medium">Avg. value</div>
          </div>
          <div>
            <div className="text-base font-extrabold">{shop?.rating || '5.0'}★</div>
            <div className="text-[10px] text-white/70 font-medium">Rating</div>
          </div>
        </div>
      </div>

      {/* 3. Action Alert Banner if new orders waiting */}
      {newOrdersWaiting.length > 0 && (
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#fef8f0] border border-[#fde8d0] rounded-[20px] p-3.5 flex items-center justify-between shadow-xs cursor-pointer hover:bg-[#fdf2e3] transition animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-[#ea580c]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">
                {newOrdersWaiting.length} new order{newOrdersWaiting.length !== 1 ? 's' : ''} waiting
              </h4>
              <p className="text-[11px] text-[#6b7280]">Accept immediately to start preparing</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#ea580c] hover:underline">View</span>
        </div>
      )}

      {/* 4. Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">Quick actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Action 1: Add product */}
          <div
            onClick={onOpenAddProduct}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Add product</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">Create a new listing</p>
          </div>

          {/* Action 2: Inventory */}
          <div
            onClick={() => onNavigateTab('products')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Products</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">Manage stock & prices</p>
          </div>

          {/* Action 3: Orders Queue */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Orders Queue</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">{activeOrders.length} active orders</p>
          </div>

          {/* Action 4: Sales report */}
          <div
            onClick={() => onNavigateTab('sales')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Sales report</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">Performance & logs</p>
          </div>
        </div>
      </div>

      {/* 5. Live Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#111827]">Live orders</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>See all ({orders.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No live customer orders at the moment.
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord._id || ord.id}
                onClick={() => onOpenOrder(ord._id || ord.id)}
                className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    #{ord.orderNumber} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs font-bold text-[#111827] mt-0.5">
                    {ord.itemCount} items • {formatPaiseToRupees(ord.totalPaise)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    ord.status === 'placed'
                      ? 'bg-[#ffedd5] text-[#ea580c]'
                      : ord.status === 'delivered'
                        ? 'bg-[#e8f3ea] text-[#1b5e39]'
                        : 'bg-blue-50 text-blue-700'
                  }`}>
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
