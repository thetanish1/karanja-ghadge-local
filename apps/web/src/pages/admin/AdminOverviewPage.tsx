import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ShieldCheck, Store, ShoppingBag, Truck, Users, Download, ArrowRight, RefreshCw } from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.warn('Overview error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Platform Administration</h2>
        </div>
        <button onClick={loadOverview} className="p-1 text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500">Total Shops</div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalShops || 0}</div>
            {stats?.pendingShops > 0 && (
              <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1">
                {stats.pendingShops} pending approval
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500">Total Orders</div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalOrders || 0}</div>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-1">
              {stats?.activeOrders || 0} active
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500">Delivered Volume</div>
            <div className="text-lg font-black text-emerald-700 mt-1">
              {formatPaiseToRupees(stats?.totalRevenuePaise || 0)}
            </div>
            <span className="text-[10px] text-slate-400">Total merchant sales</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500">Platform Fees</div>
            <div className="text-xl font-black text-slate-900 mt-1">₹0</div>
            <span className="text-[10px] text-emerald-700 font-bold">100% Free Pilot</span>
          </div>
        </div>
      )}

      {/* Admin Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 text-xs font-semibold">
        <button
          onClick={() => onNavigateTab('admin-shops')}
          className="w-full p-3.5 flex items-center justify-between text-slate-700 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Manage & Verify Shops</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigateTab('admin-orders')}
          className="w-full p-3.5 flex items-center justify-between text-slate-700 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Manage Orders & Assign Delivery</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigateTab('admin-settings')}
          className="w-full p-3.5 flex items-center justify-between text-slate-700 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Platform Settings & Audit Trail</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Quick CSV Export Links */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
        <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Data Export</div>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="/api/v1/admin/export/orders"
            download
            className="p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Orders</span>
          </a>
          <a
            href="/api/v1/admin/export/shops"
            download
            className="p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Shops</span>
          </a>
        </div>
      </div>
    </div>
  );
};
