import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Bell, BellOff, Zap, ChevronRight, Clock } from 'lucide-react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';

interface ShopOrdersPageProps {
  onBack: () => void;
}

type TabKey = 'new' | 'preparing' | 'ready';

// ─── countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    setRemaining(targetSeconds);
    if (targetSeconds <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(id); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [targetSeconds]);
  return remaining;
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── new-order alert banner ───────────────────────────────────────────────────
interface NewOrderBannerProps {
  order: any;
  muted: boolean;
  onMute: () => void;
  onAccept: (id: string, packingMins: number) => void;
  onDecline: (id: string) => void;
}

const ACCEPT_SECS = 35;
const AUTO_REASSIGN_SECS = 90;

const NewOrderBanner: React.FC<NewOrderBannerProps> = ({ order, muted, onMute, onAccept, onDecline }) => {
  const [packingMins, setPackingMins] = useState(5);
  const acceptRemaining = useCountdown(ACCEPT_SECS);
  const autoRemaining = useCountdown(AUTO_REASSIGN_SECS);

  const orderId = order._id || order.id;
  const orderNum = order.orderNumber ? `#AC-${order.orderNumber}` : `#${orderId.slice(-6).toUpperCase()}`;
  const customerName: string = order.customer?.name || order.customerName || 'Customer';
  const address: string = order.deliveryAddress?.line || 'Nearby';
  const distance: string = order.distanceKm ? `${order.distanceKm} km away` : '< 2 km away';
  const riderName: string = order.riderName || 'Rahul (Rider)';
  const riderEta: number = order.riderEtaMins ?? 4;
  const payoutPaise: number = order.payoutPaise || order.totalPaise || 0;
  const items: any[] = order.items || [];

  return (
    <div className="bg-white rounded-[24px] border-2 border-[#f97316] shadow-sm overflow-hidden">
      {/* Alert header */}
      <div className="bg-[#fff7ed] px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#fed7aa]">
        <div className="flex items-center gap-2">
          <span className="animate-pulse inline-flex items-center gap-1 bg-[#f97316] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
            <Bell className="w-3 h-3" /> NEW ORDER ALERT
          </span>
          <span className="text-[11px] text-[#92400e] font-medium">Ringing counter audio 🔔</span>
        </div>
        <button
          onClick={onMute}
          className="flex items-center gap-1 text-[11px] font-bold text-[#6b7280] hover:text-[#111827] cursor-pointer"
        >
          {muted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          {muted ? 'Unmute' : '🔇 Mute'}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Order ID + 15-min + timer + auto-reassign */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold bg-slate-100 text-[#111827] px-2 py-0.5 rounded-full">{orderNum}</span>
          <span className="flex items-center gap-0.5 text-[11px] font-bold bg-[#fff7ed] text-[#f97316] px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> 15-Min
          </span>
          <span className="text-[11px] font-semibold text-[#6b7280]">
            Auto-reassigns in {fmt(autoRemaining)}
          </span>
          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Auto-reassigns</span>
        </div>

        {/* Payout */}
        <div className="flex items-center justify-between bg-[#f0fdf4] rounded-[16px] px-3 py-2.5">
          <div>
            <div className="text-[10px] text-[#6b7280] font-medium">Your Store Net Payout</div>
            <div className="text-lg font-extrabold text-[#111827]">{formatPaiseToRupees(payoutPaise)}</div>
          </div>
          <span className="text-[10px] font-extrabold bg-[#e8f3ea] text-[#1b5e39] px-2 py-0.5 rounded-full">0% Commission</span>
        </div>

        {/* Customer info */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#111827]">👤 {customerName}</div>
          <div className="text-[11px] text-[#6b7280]">📍 {address} · {distance}</div>
        </div>

        {/* Rider */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-[14px] px-3 py-2 border border-slate-200/80">
          <div className="w-7 h-7 rounded-full bg-[#1b5e39] text-white flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">
            {riderName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-[#111827]">{riderName}</div>
            <div className="text-[10px] text-[#6b7280]">Assigned delivery fleet · Arrives in {riderEta} mins</div>
          </div>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#111827] uppercase tracking-wider">Items to Pack</div>
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="font-semibold text-[#111827] truncate">{item.productName || item.name}</span>
                  <span className="text-slate-400">× {item.qty}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[#6b7280]">{formatPaiseToRupees(item.pricePaise || (item.price * 100) || 0)}</span>
                  {item.rackLocation && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{item.rackLocation}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="text-[10px] font-bold text-[#1b5e39] mt-1">✅ All In Stock</div>
          </div>
        )}

        {/* Packing time pills */}
        <div>
          <div className="text-[10px] text-[#6b7280] font-medium mb-1.5">Packing time</div>
          <div className="flex gap-2">
            {([{ mins: 3, label: '3 Mins (Fast)' }, { mins: 5, label: '5 Mins' }, { mins: 8, label: '8 Mins (Busy)' }] as { mins: number; label: string }[]).map((opt) => (
              <button
                key={opt.mins}
                onClick={() => setPackingMins(opt.mins)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-full border transition cursor-pointer ${
                  packingMins === opt.mins
                    ? 'bg-[#1b5e39] text-white border-[#1b5e39]'
                    : 'bg-white text-[#6b7280] border-slate-200 hover:border-[#1b5e39]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accept button */}
        <button
          onClick={() => onAccept(orderId, packingMins)}
          className="w-full bg-[#1b5e39] hover:bg-[#155a34] text-white font-extrabold rounded-[18px] py-3.5 text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
        >
          <span>✓ Accept &amp; Start Packing</span>
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
            {fmt(acceptRemaining)}
          </span>
        </button>

        {/* Decline */}
        <button
          onClick={() => onDecline(orderId)}
          className="w-full text-center text-[11px] text-[#6b7280] hover:text-red-600 transition cursor-pointer py-1"
        >
          × Decline Order (Route to Nearby Kirana)
        </button>
      </div>
    </div>
  );
};

// ─── preparing card ───────────────────────────────────────────────────────────
interface PreparingCardProps {
  order: any;
  onMarkReady: (id: string) => void;
}

const PreparingCard: React.FC<PreparingCardProps> = ({ order, onMarkReady }) => {
  const orderId = order._id || order.id;
  const orderNum = order.orderNumber ? `#AC-${order.orderNumber}` : `#${orderId.slice(-6).toUpperCase()}`;
  const customerName: string = order.customer?.name || order.customerName || 'Customer';
  const distance: string = order.distanceKm ? `${order.distanceKm} km` : '< 2 km';
  const items: any[] = order.items || [];
  const itemsSummary = items.length > 0
    ? items.slice(0, 2).map((it: any) => it.productName || it.name).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '')
    : `${order.itemCount || '?'} items`;

  // If we know when packing started, count from that; otherwise 5-min window
  const packingStartedAt: number = order.shopAcceptedAt ? new Date(order.shopAcceptedAt).getTime() : Date.now();
  const packMins: number = order.packingMins || 5;
  const deadlineSecs = Math.max(0, Math.round((packingStartedAt + packMins * 60 * 1000 - Date.now()) / 1000));
  const remaining = useCountdown(deadlineSecs);

  return (
    <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{orderNum}</span>
          <h3 className="text-sm font-bold text-[#111827]">{customerName}</h3>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full tabular-nums ${
          remaining < 60 ? 'bg-red-100 text-red-600' : 'bg-[#fff7ed] text-[#f97316]'
        }`}>
          <Clock className="inline w-3 h-3 mr-0.5" />
          {fmt(remaining)} remaining
        </span>
      </div>

      <div className="text-[11px] text-[#6b7280]">
        📍 {distance} · {itemsSummary}
      </div>

      <button
        onClick={() => onMarkReady(orderId)}
        className="w-full bg-[#1b5e39] hover:bg-[#155a34] text-white font-bold rounded-[16px] py-2.5 text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
      >
        📅 Mark Ready for Pickup
      </button>
    </div>
  );
};

// ─── ready card ──────────────────────────────────────────────────────────────
interface ReadyCardProps {
  order: any;
}

const ReadyCard: React.FC<ReadyCardProps> = ({ order }) => {
  const orderId = order._id || order.id;
  const orderNum = order.orderNumber ? `#AC-${order.orderNumber}` : `#${orderId.slice(-6).toUpperCase()}`;
  const customerName: string = order.customer?.name || order.customerName || 'Customer';
  const items: any[] = order.items || [];
  const itemsSummary = items.length > 0
    ? items.slice(0, 2).map((it: any) => it.productName || it.name).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '')
    : `${order.itemCount || '?'} items`;

  return (
    <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{orderNum}</span>
          <h3 className="text-sm font-bold text-[#111827]">{customerName}</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8f3ea] text-[#1b5e39]">
          Ready for Pick
        </span>
      </div>
      <div className="text-[11px] text-[#6b7280]">{itemsSummary} · {formatPaiseToRupees(order.totalPaise || 0)}</div>
      <div className="text-[10px] text-slate-400">Waiting for delivery partner</div>
    </div>
  );
};

// ─── main page ────────────────────────────────────────────────────────────────
export const ShopOrdersPage: React.FC<ShopOrdersPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('new');
  const [orders, setOrders] = useState<any[]>([]);
  const [shopName, setShopName] = useState('My Store');
  const [shopId, setShopId] = useState('');
  const [todaySalesPaise, setTodaySalesPaise] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      const [queueRes, shopsRes] = await Promise.all([
        api.getShopQueue().catch(() => ({ success: false, orders: [] as any[] })),
        api.getMyShops().catch(() => ({ success: false, shops: [] as any[] })),
      ]);
      if (queueRes.success && queueRes.orders) {
        setOrders(queueRes.orders);
      }
      if (shopsRes.success && shopsRes.shops && shopsRes.shops.length > 0) {
        const s = shopsRes.shops[0];
        setShopName(s.name || 'My Store');
        setShopId(s._id || s.id || '');
        // compute today's sales from completed orders' totalPaise
        const todayCompleted = (queueRes.orders || []).filter((o: any) =>
          ['delivered', 'completed'].includes(o.status)
        );
        const salesPaise = todayCompleted.reduce((sum: number, o: any) => sum + (o.totalPaise || 0), 0);
        setTodaySalesPaise(salesPaise);
      }
    } catch (e) {
      console.warn('queue load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    intervalRef.current = setInterval(loadQueue, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadQueue]);

  const handleAccept = async (orderId: string, _packingMins: number) => {
    setActionLoading(orderId);
    try {
      await api.acceptOrder(orderId);
      await loadQueue();
      setActiveTab('preparing');
    } catch (e) {
      console.error('accept error', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.declineOrder(orderId);
      await loadQueue();
    } catch (e) {
      console.error('decline error', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.transitionOrder(orderId, 'ready_for_pickup');
      await loadQueue();
      setActiveTab('ready');
    } catch (e) {
      console.error('mark ready error', e);
    } finally {
      setActionLoading(null);
    }
  };

  const newOrders = orders.filter((o) => o.status === 'placed');
  const preparingOrders = orders.filter((o) => ['shop_accepted', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'ready_for_pickup');
  const completedOrders = orders.filter((o) => ['delivered', 'completed'].includes(o.status));

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'new', label: 'New Orders', count: newOrders.length },
    { key: 'preparing', label: 'Preparing', count: preparingOrders.length },
    { key: 'ready', label: 'Ready for Pick', count: readyOrders.length },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans select-none pb-28">
      {/* ── header strip ── */}
      <div className="bg-white border-b border-slate-200/80 px-4 pt-4 pb-3 space-y-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-[#111827] truncate">{shopName}</h1>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1b5e39]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e39] animate-pulse" />
              Store Open (Online)
              {shopId && <span className="text-slate-400 font-normal ml-1">· ID #{shopId.slice(-4).toUpperCase()}</span>}
            </div>
          </div>
        </div>

        {/* Today's stats */}
        <div className="flex items-center gap-4 pt-1">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Today's Sales</div>
            <div className="text-base font-extrabold text-[#111827]">{formatPaiseToRupees(todaySalesPaise)}</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Completed</div>
            <div className="text-base font-extrabold text-[#111827]">{completedOrders.length} Orders</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ── new order alert ── */}
        {newOrders.length > 0 && (
          <NewOrderBanner
            order={newOrders[0]}
            muted={muted}
            onMute={() => setMuted((m) => !m)}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}

        {/* ── tab navigation ── */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === tab.key
                  ? 'bg-[#1b5e39] text-white shadow-xs'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-[#f97316] text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'new' && (
              newOrders.length <= 1 && newOrders.length === 0 ? (
                <div className="bg-white rounded-[22px] p-10 text-center border border-slate-200/80">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-xs font-bold text-[#111827]">No new orders right now</div>
                  <div className="text-[11px] text-slate-400 mt-1">We'll alert you the moment one arrives</div>
                </div>
              ) : newOrders.length > 1 ? (
                // show remaining new orders below the banner (banner already shows first)
                newOrders.slice(1).map((ord) => (
                  <div
                    key={ord._id || ord.id}
                    className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#f97316] transition"
                    onClick={() => {/* could expand */}}
                  >
                    <div>
                      <div className="text-[10px] text-slate-400">#AC-{(ord.orderNumber || ord._id.slice(-4)).toString().toUpperCase()}</div>
                      <div className="text-xs font-bold text-[#111827]">{ord.customer?.name || 'Customer'}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-[#fff7ed] text-[#f97316] px-2 py-0.5 rounded-full">New</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              ) : null
            )}

            {activeTab === 'preparing' && (
              preparingOrders.length === 0 ? (
                <div className="bg-white rounded-[22px] p-10 text-center border border-slate-200/80">
                  <div className="text-xs font-bold text-[#111827]">No orders being prepared</div>
                  <div className="text-[11px] text-slate-400 mt-1">Accept a new order to start packing</div>
                </div>
              ) : (
                preparingOrders.map((ord) => (
                  <PreparingCard
                    key={ord._id || ord.id}
                    order={ord}
                    onMarkReady={handleMarkReady}
                  />
                ))
              )
            )}

            {activeTab === 'ready' && (
              readyOrders.length === 0 ? (
                <div className="bg-white rounded-[22px] p-10 text-center border border-slate-200/80">
                  <div className="text-xs font-bold text-[#111827]">No orders ready for pickup yet</div>
                </div>
              ) : (
                readyOrders.map((ord) => (
                  <ReadyCard key={ord._id || ord.id} order={ord} />
                ))
              )
            )}

            {actionLoading && (
              <div className="text-center text-xs text-[#6b7280] animate-pulse py-2">Updating order…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
