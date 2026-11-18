import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import {
  ShieldCheck,
  Store,
  ShoppingBag,
  Truck,
  Users,
  Download,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  AlertTriangle,
  Send,
  MapPin,
  ExternalLink,
  ChevronDown,
  Radio,
  Sparkles,
  PhoneCall,
  BellRing
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
  onBackToCustomer?: () => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewProps> = ({ onNavigateTab, onBackToCustomer }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [nudgedOrder, setNudgedOrder] = useState<string | null>(null);

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

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 2500);
  };

  const handleNudge = (orderId: string) => {
    setNudgedOrder(orderId);
    setTimeout(() => setNudgedOrder(null), 2500);
  };

  const totalShops = stats?.totalShops || 6;
  const pendingShops = stats?.pendingShops || 2;
  const totalOrders = stats?.totalOrders || 24;
  const activeOrders = stats?.activeOrders || 8;
  const totalRev = stats?.totalRevenuePaise || 8465000;

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-sans pb-28 select-none">
      {/* 1. TOP SUPER ADMIN CLUSTER BAR */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBackToCustomer && (
              <button
                onClick={onBackToCustomer}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
                title="Return to Customer Store"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-[#1b5e39] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs font-black text-slate-900 leading-tight">
                <span>Karanja Cluster Hub</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">Super Admin Console</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>14 Active Ops</span>
            </span>
            <button
              onClick={() => onNavigateTab('admin-settings')}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* 2. CLUSTER OPERATIONS HEALTH CARD */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Store className="w-4 h-4 text-[#1b5e39]" />
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cluster Operations</div>
            </div>
            <button
              onClick={loadOverview}
              className="p-1 text-slate-400 hover:text-slate-600 transition"
              title="Refresh Live Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">Civil Lines & Central Ward</div>

          <div className="flex items-center gap-2 mt-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Operations Healthy</span>
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
              99.4% Fulfillment
            </div>
          </div>
        </div>

        {/* 3. 2x2 METRIC GRID (Figma Image 7 exact) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Orders */}
          <div
            onClick={() => onNavigateTab('admin-orders')}
            className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs cursor-pointer hover:border-[#1b5e39] transition"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Active Orders</span>
              <ShoppingBag className="w-3.5 h-3.5 text-[#1b5e39]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-900">{activeOrders}</span>
              <span className="text-[11px] font-bold text-emerald-700">Live</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">• 18 on-time</span>
              <span>• 6 on-route</span>
            </div>
          </div>

          {/* Town Stores */}
          <div
            onClick={() => onNavigateTab('admin-shops')}
            className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs cursor-pointer hover:border-[#1b5e39] transition"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Town Stores</span>
              <Store className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-900">{totalShops}</span>
              <span className="text-[11px] font-bold text-slate-500">/ 8 open</span>
            </div>
            <div className="text-[10px] text-amber-600 mt-1 font-semibold">
              {pendingShops > 0 ? `${pendingShops} pending approval` : 'All stores verified'}
            </div>
          </div>

          {/* Fleet on Duty */}
          <div
            onClick={() => onNavigateTab('admin-orders')}
            className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs cursor-pointer hover:border-[#1b5e39] transition"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Fleet on Duty</span>
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-900">12</span>
              <span className="text-[11px] font-bold text-slate-500">riders</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium">
              <span className="text-blue-600 font-bold">8 Busy</span> • 4 Available
            </div>
          </div>

          {/* Town GMV */}
          <div className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Town GMV (Today)</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-slate-900 mt-1.5">
              {formatPaiseToRupees(totalRev)}
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-bold">
              ₹0 Fee (100% Free Pilot)
            </div>
          </div>
        </div>

        {/* 4. REAL-TIME INTERVENTIONS (Figma Image 7 exact) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time Interventions</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
              2 Actions Required
            </span>
          </div>

          {/* Intervention 1: Packing Delay */}
          <div className="bg-white rounded-[20px] p-3.5 border-l-4 border-l-amber-500 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-black uppercase text-amber-700">PACKING DELAY</span>
                <span className="text-[10px] text-slate-400 font-semibold">• 12m elapsed</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                Order #AC-89235
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-snug">
              <span className="font-bold text-slate-800">Bikaner Sweet & Bakery</span> hasn't completed dispatch box. Rider Suresh is waiting at shop.
            </p>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => handleNudge('#AC-89235')}
                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{nudgedOrder === '#AC-89235' ? 'Nudge Sent!' : 'Nudge Store'}</span>
              </button>
              <a
                href="tel:9876543210"
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Merchant</span>
              </a>
            </div>
          </div>

          {/* Intervention 2: Demand Surge */}
          <div className="bg-white rounded-[20px] p-3.5 border-l-4 border-l-[#1b5e39] border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#1b5e39]" />
                <span className="text-[10px] font-black uppercase text-[#1b5e39]">DEMAND SURGE</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  +4 orders / 5m
                </span>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800">Station Road Crossing</div>
            <p className="text-xs text-slate-600 leading-snug">
              Fleet concentration is thin near Railway Bazaar gate. 4 orders queuing for pickup.
            </p>

            <button
              onClick={() => handleNudge('surge-station')}
              className="w-full py-1.5 px-3 rounded-xl bg-[#1b5e39] hover:bg-[#164d2d] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{nudgedOrder === 'surge-station' ? 'Alert Broadcasted to 4 Riders' : 'Dispatch Fleet Alert (4 idle riders notified)'}</span>
            </button>
          </div>
        </div>

        {/* 5. KARANJA FLEET RADAR & MAP LINK */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Civil Lines Fleet Radar</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">Avg Delivery: 18m</span>
          </div>

          {/* Mini Mock Map */}
          <div className="w-full h-24 rounded-2xl bg-[#e3eedf] relative overflow-hidden flex items-center justify-center border border-emerald-200/60">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1b5e39_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <div className="flex items-center gap-1 text-xs font-black text-[#1b5e39]">
                <MapPin className="w-4 h-4 text-[#1b5e39]" />
                <span>Live Ward Heatmap & Rider Density</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">View 12 GPS telemetry streams & bottleneck nodes</div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('admin-orders')}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Open Fleet Live Tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. MERCHANT ONBOARDING (Pending approvals) */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Merchant Onboarding</span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {pendingShops} Applications Pending
            </span>
          </div>

          {/* Pending Merchant List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] font-black text-xs flex items-center justify-center">
                  VD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Verma Dairy & Sweets</div>
                  <div className="text-[10px] text-slate-400">Civil Lines • FSSAI verified</div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('admin-shops')}
                className="py-1 px-2.5 rounded-lg bg-[#1b5e39] text-white text-[10px] font-bold hover:bg-[#154d2e] transition"
              >
                Review App
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center">
                  GG
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Gupta General Store</div>
                  <div className="text-[10px] text-slate-400">Main Rd • Bank docs submitted</div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('admin-shops')}
                className="py-1 px-2.5 rounded-lg bg-[#1b5e39] text-white text-[10px] font-bold hover:bg-[#154d2e] transition"
              >
                Review App
              </button>
            </div>
          </div>
        </div>

        {/* 7. INSTANT TOWN SHOPKEEPER BROADCAST (Figma Image 7 exact) */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Instant Town Shopkeeper Broadcast</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Pushes priority alert to all 20 vendor POS consoles & rider apps
          </div>

          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            rows={2}
            placeholder="e.g. Ward road construction notice, severe rain alert, evening surge incentive..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1b5e39] bg-slate-50 text-slate-800"
          />

          <div className="flex flex-wrap gap-1.5">
            {['#Monsoon Packing', '#Festival Surge', '#Settlement Complete'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setBroadcastText((prev) => (prev ? `${prev} ${tag}` : tag))}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 transition"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              {broadcastSent ? '✓ Broadcasted to 20 devices' : 'Ready to transmit'}
            </span>
            <button
              onClick={handleBroadcast}
              disabled={!broadcastText.trim()}
              className="py-1.5 px-4 rounded-xl bg-[#1b5e39] hover:bg-[#164d2d] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </div>

        {/* 8. QUICK CSV EXPORT SHORTCUTS */}
        <div className="bg-white rounded-[22px] p-3.5 border border-slate-200 shadow-xs space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data & Compliance Exports</div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/api/v1/admin/export/orders"
              download
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Orders</span>
            </a>
            <a
              href="/api/v1/admin/export/shops"
              download
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Shops</span>
            </a>
          </div>
        </div>
      </div>

      {/* 9. BOTTOM ADMIN NAVIGATION BAR (Image 7 exact 4-tab bar) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-slate-200 px-4 py-2 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigateTab('admin-overview')}
          className="flex flex-col items-center gap-1 text-[#1b5e39] cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#1b5e39] rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-[#1b5e39]" />
              <div className="bg-[#1b5e39]" />
              <div className="bg-[#1b5e39]" />
              <div className="bg-[#1b5e39]" />
            </div>
          </div>
          <span className="text-[10px] font-bold">Overview</span>
        </button>

        <button
          onClick={() => onNavigateTab('admin-shops')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Merchants</span>
        </button>

        <button
          onClick={() => onNavigateTab('admin-orders')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Fleet</span>
        </button>

        <button
          onClick={() => onNavigateTab('admin-settings')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Settings</span>
        </button>
      </div>
    </div>
  );
};
