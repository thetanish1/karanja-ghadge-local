import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { StatusBadge } from '../../components/StatusBadge.js';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  KeyRound,
  Banknote,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Store,
  Clock,
  ShieldCheck,
  Star,
  Check,
  Delete,
  Wallet,
  History,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  MessageSquare,
  Camera,
  Shield,
  Battery,
  Leaf,
  Info,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface DeliveryTasksPageProps {
  onBackToCustomer?: () => void;
}

export const DeliveryTasksPage: React.FC<DeliveryTasksPageProps> = ({ onBackToCustomer }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'task' | 'trips' | 'earnings' | 'profile'>('task');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Interactive PIN Keypad state
  const [handoverPin, setHandoverPin] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sealIntact, setSealIntact] = useState(true);

  // Completed Celebration Screen
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Trips tab period
  const [tripPeriod, setTripPeriod] = useState<'week' | 'lastweek' | 'month'>('week');

  // SOS hold timer
  const sosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sosHeld, setSosHeld] = useState(false);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const res = await api.getDeliveryTasks();
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (e) {
      console.warn('Failed to load delivery tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentTask = tasks[selectedTaskIndex] || tasks[0] || null;

  const handleNumpadPress = (digit: string) => {
    if (handoverPin.length < 4) {
      setHandoverPin((prev) => prev + digit);
    }
  };

  const handleNumpadClear = () => {
    setHandoverPin('');
  };

  const handleNumpadBackspace = () => {
    setHandoverPin((prev) => prev.slice(0, -1));
  };

  const handleToggleItemCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTransition = async (orderId: string, targetState: string) => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.transitionDeliveryTask(orderId, targetState);
      if (res.success) {
        await loadTasks();
      }
    } catch (e: any) {
      setError(e.message || 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (orderId: string) => {
    if (handoverPin.length !== 4) {
      setError('Please enter the 4-digit PIN provided by customer.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const res = await api.verifyDeliveryOtp(orderId, handoverPin);
      if (res.success) {
        setCompletedOrder({
          orderNumber: currentTask?.orderNumber || 'AC-Order',
          customerName: currentTask?.customerName || 'Customer',
          totalPaise: currentTask?.totalPaise || 0,
          earnedPaise: 4500,
        });
        setHandoverPin('');
        await loadTasks();
      }
    } catch (e: any) {
      setError(e.message || 'Incorrect PIN code. Ask customer for 4-digit code.');
    } finally {
      setActionLoading(false);
    }
  };

  const riderName = user?.name || 'Suresh Kumar';
  const riderPhone = user?.phone ? `+91 ${user.phone}` : '+91 98765 43212';

  // Determine step number from status
  const getStepNumber = (status: string): number => {
    if (['delivery_assigned', 'ready_for_pickup'].includes(status)) return 1;
    if (status === 'picked_up') return 2;
    if (status === 'out_for_delivery') return 3;
    return 1;
  };

  // Mock items for bag check when task has no items
  const mockBagItems = [
    { _id: 'item-1', name: 'Amul Full Cream Milk 1L', unit: '1 Litre', qty: 2, pricePaise: 7000 },
    { _id: 'item-2', name: 'Britannia Bread', unit: 'Large Loaf', qty: 1, pricePaise: 4500 },
  ];

  // Completed Mock Trips for the Trips Tab
  const completedTrips = [
    {
      id: 'trip-1',
      orderNumber: 'AC-89240',
      shopName: 'Gupta Fresh Mart',
      customerName: 'Sunil Deshmukh',
      time: 'Today • 07:15 AM',
      earnedPaise: 4500,
      status: 'Delivered',
      distanceKm: '1.2 km',
      mins: 11,
    },
    {
      id: 'trip-2',
      orderNumber: 'AC-89235',
      shopName: 'Pawan Electricals',
      customerName: 'Anil Thakare',
      time: 'Yesterday • 06:40 PM',
      earnedPaise: 5000,
      status: 'Delivered',
      distanceKm: '2.1 km',
      mins: 18,
    },
    {
      id: 'trip-3',
      orderNumber: 'AC-89228',
      shopName: 'Shree Ganesh Cloth',
      customerName: 'Meena Sharma',
      time: 'Yesterday • 04:20 PM',
      earnedPaise: 4500,
      status: 'Delivered',
      distanceKm: '0.9 km',
      mins: 9,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#111827] font-sans select-none pb-28">

      {/* ====================================================== */}
      {/* TOP HEADER BAR — Rider Name + SOS + Earnings           */}
      {/* ====================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-2.5">
          {onBackToCustomer && (
            <button
              onClick={onBackToCustomer}
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#111827] tracking-tight">{riderName}</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                ⭐ 4.9
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Hero Electric Optima · Karanja Hub</div>
          </div>
        </div>

        {/* Right: Earnings + Online pill + SOS */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
            <div className="text-[11px] font-extrabold text-[#111827]">₹680</div>
            <div className="text-[9px] text-slate-400">Today</div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition shadow-xs cursor-pointer ${
              isOnline ? 'bg-[#e8f3ea] text-[#1b5e39] border border-[#cde5d2]' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#1b5e39] animate-pulse' : 'bg-slate-400'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </button>

          {/* SOS Button */}
          <button
            onMouseDown={() => {
              sosTimerRef.current = setTimeout(() => setSosHeld(true), 2000);
            }}
            onMouseUp={() => {
              if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
            }}
            onTouchStart={() => {
              sosTimerRef.current = setTimeout(() => setSosHeld(true), 2000);
            }}
            onTouchEnd={() => {
              if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
            }}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] font-black flex items-center justify-center shadow transition cursor-pointer"
            title="Hold 2s for SOS"
          >
            SOS
          </button>

          <button
            onClick={loadTasks}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* SOS activated overlay */}
      {sosHeld && (
        <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center text-white p-8 text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-black mb-2">SOS Alert Sent!</h2>
          <p className="text-sm opacity-90 mb-6">Your GPS location has been shared with Karanja Fleet Manager & Emergency contacts.</p>
          <button onClick={() => setSosHeld(false)} className="px-8 py-3 bg-white text-red-600 font-black rounded-2xl text-sm cursor-pointer">
            I'm Safe — Cancel Alert
          </button>
        </div>
      )}

      {/* ====================================================== */}
      {/* TODAY EARNINGS HERO STRIP                               */}
      {/* ====================================================== */}
      <div className="px-4 pt-3">
        <div className="bg-[#155a34] rounded-[24px] p-4 text-white shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              TODAY'S RIDER PAYOUT
            </div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              ₹680.00
            </div>
            <div className="text-[11px] text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
              <span>10 trips completed</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">+₹40 tips</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white">
              Tier 3 Gold Rider
            </span>
            <div className="text-[10px] text-emerald-200 mt-1">Direct Bank Deposit</div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* MAIN CONTENT                                            */}
      {/* ====================================================== */}
      <main className="px-4 pt-3">

        {/* ============================================================ */}
        {/* TAB 1: TASK VIEW (ACTIVE DELIVERY / STEP 1-2-3 FLOW)        */}
        {/* ============================================================ */}
        {activeTab === 'task' && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Delivery Completion Overlay */}
            {completedOrder && (
              <div className="bg-white rounded-[24px] p-5 border border-[#cde5d2] shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mx-auto text-2xl shadow-xs">
                  🎉
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-2.5 py-0.5 rounded-full uppercase">
                    Order #{completedOrder.orderNumber} Delivered
                  </span>
                  <h2 className="text-xl font-extrabold text-[#111827] mt-1.5">Delivery Completed!</h2>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Handed over to <strong>{completedOrder.customerName}</strong> safely.
                  </p>
                </div>

                <div className="bg-[#f8fdf9] border border-[#d6ecda] rounded-2xl p-3.5 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Trip Earnings</span>
                    <span className="text-xs font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                      Credited
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#1b5e39] mt-1">
                    +{formatPaiseToRupees(completedOrder.earnedPaise)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Base pay ₹35.00 + Surge Bonus ₹10.00
                  </div>
                </div>

                <button
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-3.5 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-xs rounded-2xl shadow-sm transition cursor-pointer"
                >
                  Ready for Next Order →
                </button>
              </div>
            )}

            {!completedOrder && loading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-[24px]" />
                <div className="h-32 bg-slate-200 rounded-[24px]" />
              </div>
            )}

            {!completedOrder && !loading && tasks.length === 0 && (
              <div className="bg-white rounded-[24px] p-8 text-center text-slate-400 text-xs border border-slate-200/80 shadow-xs space-y-2">
                <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No active delivery assignments</h3>
                <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                  Stay online! When shops in Karanja prepare an order, it will appear here for you to claim and deliver.
                </p>
              </div>
            )}

            {!completedOrder && currentTask && (
              <div className="space-y-3.5">
                {/* Multi-task pills */}
                {tasks.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {tasks.map((t, idx) => (
                      <button
                        key={t.orderId}
                        onClick={() => setSelectedTaskIndex(idx)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                          selectedTaskIndex === idx
                            ? 'bg-[#1b5e39] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Order #{t.orderNumber}
                      </button>
                    ))}
                  </div>
                )}

                {/* ——— ACTIVE DELIVERY HEADER CARD ——— */}
                <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1b5e39] animate-pulse" />
                      <span className="text-xs font-extrabold text-[#111827]">
                        Active Delivery #AC-{currentTask.orderNumber || '89241'} · Est. 12 mins
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                      You Earn ₹45
                    </span>
                  </div>

                  {/* Fare breakdown */}
                  <div className="text-[10px] text-slate-400 mb-3">
                    ₹35 Base + ₹10 Surge Bonus
                  </div>

                  {/* 3-Step Tracker */}
                  <div className="text-[10px] font-bold text-slate-500 mb-2">
                    Delivery Progress: Step {getStepNumber(currentTask.status)} of 3
                  </div>
                  <div className="flex items-center gap-0">
                    {[
                      { label: 'At Store', step: 1, statuses: ['delivery_assigned', 'ready_for_pickup'] },
                      { label: 'Bag Check', step: 2, statuses: ['picked_up'] },
                      { label: 'Drop & OTP', step: 3, statuses: ['out_for_delivery'] },
                    ].map((s, i) => {
                      const currentStep = getStepNumber(currentTask.status);
                      const isActive = s.step === currentStep;
                      const isDone = s.step < currentStep;
                      return (
                        <React.Fragment key={s.label}>
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition ${
                              isDone ? 'bg-[#1b5e39] text-white' : isActive ? 'bg-[#1b5e39] text-white ring-2 ring-[#1b5e39] ring-offset-1' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isDone ? '✓' : s.step}
                            </div>
                            <div className={`text-[9px] font-bold mt-1 text-center ${isActive ? 'text-[#1b5e39]' : isDone ? 'text-[#1b5e39]' : 'text-slate-400'}`}>
                              {s.label}
                            </div>
                          </div>
                          {i < 2 && (
                            <div className={`flex-1 h-0.5 mb-4 rounded ${getStepNumber(currentTask.status) > s.step ? 'bg-[#1b5e39]' : 'bg-slate-200'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* ——— STEP 1: PICKUP CARD ——— */}
                {['delivery_assigned', 'ready_for_pickup'].includes(currentTask.status) && (
                  <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#f97316] bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-100">
                        <Store className="w-3 h-3" /> PICKUP · 120m away
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Near Town Bazaar</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-[#111827]">{currentTask.shopName || 'Gupta Fresh Mart'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{currentTask.shopAddress || 'Shop No. 12, Nehru Market, Civil Lines'}</p>
                      {currentTask.shopLandmark && (
                        <p className="text-[11px] text-[#f97316] font-medium mt-1">Landmark: {currentTask.shopLandmark}</p>
                      )}
                    </div>

                    {/* Map strip */}
                    <div className="rounded-xl bg-gradient-to-r from-[#e8f3ea] to-[#f0faf1] border border-[#cde5d2] p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1b5e39] flex-shrink-0" />
                      <div className="text-[11px] text-[#1b5e39] font-semibold">
                        Fastest Route via Gandhi Chowk Rd · Total 0.5 km · ~3 mins
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {currentTask.shopNavUrl ? (
                        <a
                          href={currentTask.shopNavUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#1b5e39]" />
                          📍 Store Map
                        </a>
                      ) : (
                        <button className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                          📍 Store Map
                        </button>
                      )}
                      <a
                        href={`tel:${currentTask.shopPhone || '+919876543210'}`}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1b5e39]" />
                        📞 Call Ramesh Bhai
                      </a>
                    </div>

                    <button
                      onClick={() => handleTransition(currentTask.orderId, 'picked_up')}
                      disabled={actionLoading}
                      className="w-full py-3.5 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading ? 'Updating...' : 'Confirm Pickup & Start Navigation'}
                    </button>
                  </div>
                )}

                {/* ——— STEP 2: BAG CHECK CARD ——— */}
                {currentTask.status === 'picked_up' && (
                  <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#f97316] bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-100">
                        <MapPin className="w-3 h-3 text-[#f97316]" /> DROP LOCATION · 450m away
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-[#111827]">{currentTask.customerName || 'Rajesh Verma'}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{currentTask.customerAddress || 'Tower B, Civil Lines, Opp. Central Park'}</p>
                      {currentTask.customerLandmark && (
                        <p className="text-[11px] text-[#f97316] font-medium mt-1">Landmark: {currentTask.customerLandmark}</p>
                      )}
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                        🏢 Gate Note: Leave with building security if lift busy, or ring bell 302 directly.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`tel:${currentTask.customerPhone || '+919876500000'}`}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1b5e39]" />
                        📞 Call Rajesh (Cust.)
                      </a>
                      <button className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#1b5e39]" />
                        💬 Chat
                      </button>
                    </div>

                    {/* Item checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-800">Item Verification</h5>
                        <span className="text-[10px] font-bold text-slate-500">
                          {Object.values(checkedItems).filter(Boolean).length} of {(currentTask.items || mockBagItems).length} Verified
                        </span>
                      </div>

                      {(currentTask.items || mockBagItems).map((it: any) => (
                        <div
                          key={it._id}
                          onClick={() => handleToggleItemCheck(it._id)}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                              checkedItems[it._id] ? 'bg-[#1b5e39] border-[#1b5e39]' : 'border-slate-300'
                            }`}>
                              {checkedItems[it._id] && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {it.name} <span className="text-slate-400">({it.unit})</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">{it.qty}x</div>
                            {it.pricePaise && (
                              <div className="text-[10px] text-slate-400">{formatPaiseToRupees(it.pricePaise * it.qty)}</div>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-medium">
                        🔐 Requires 4-Digit Customer OTP · COD: ₹0 (Prepaid)
                      </div>
                    </div>

                    {/* Doorstep photo */}
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center">
                      <label className="cursor-pointer flex flex-col items-center gap-1.5">
                        <Camera className="w-6 h-6 text-slate-300" />
                        <span className="text-[11px] text-slate-400">Tap to capture bag at door or with guard</span>
                        <span className="text-[10px] text-slate-300">Optional · Used for safe delivery proof</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" />
                      </label>
                    </div>

                    <button
                      onClick={() => handleTransition(currentTask.orderId, 'out_for_delivery')}
                      disabled={actionLoading}
                      className="w-full py-3.5 bg-[#1e40af] hover:bg-[#1d3bb0] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Navigation className="w-4 h-4" />
                      {actionLoading ? 'Updating...' : 'Confirm Pickup & Start Navigation'}
                    </button>
                  </div>
                )}

                {/* ——— STEP 3: DROP & OTP PIN KEYPAD ——— */}
                {currentTask.status === 'out_for_delivery' && (
                  <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#1b5e39]" />
                        <h4 className="text-xs font-bold text-slate-800">Customer Handover PIN</h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Ask <strong>{currentTask.customerName || 'the customer'}</strong> for the 4-digit code shown in their AapnaCart order tracking screen.
                    </p>

                    {/* 4 Large PIN Digits Display */}
                    <div className="flex justify-center gap-3 py-1">
                      {[0, 1, 2, 3].map((idx) => {
                        const digit = handoverPin[idx];
                        return (
                          <div
                            key={idx}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition ${
                              digit
                                ? 'bg-[#e8f3ea] text-[#1b5e39] border-2 border-[#1b5e39]'
                                : 'bg-slate-50 border border-slate-200 text-slate-300'
                            }`}
                          >
                            {digit || '•'}
                          </div>
                        );
                      })}
                    </div>

                    {/* Doorstep photo (also shown at drop) */}
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-3 text-center">
                      <label className="cursor-pointer flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4 text-slate-300" />
                        <span className="text-[10px] text-slate-400">Tap to capture bag at door or with guard</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" />
                      </label>
                    </div>

                    {/* Interactive Custom Numpad */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleNumpadPress(num)}
                          className="h-12 bg-white rounded-2xl border border-slate-200 text-base font-bold text-slate-800 hover:bg-slate-50 active:scale-95 transition shadow-xs cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleNumpadClear}
                        className="h-12 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('0')}
                        className="h-12 bg-white rounded-2xl border border-slate-200 text-base font-bold text-slate-800 hover:bg-slate-50 active:scale-95 transition shadow-xs cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleNumpadBackspace}
                        className="h-12 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition flex items-center justify-center cursor-pointer"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleVerifyOtp(currentTask.orderId)}
                      disabled={actionLoading || handoverPin.length !== 4}
                      className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {actionLoading ? 'Verifying...' : 'Confirm Handover & Complete'}
                    </button>
                  </div>
                )}

                {/* Item verification for non-step-2 views */}
                {currentTask.items && currentTask.items.length > 0 && currentTask.status !== 'picked_up' && (
                  <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">
                        Item Verification ({currentTask.items.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">Verify before leaving shop</span>
                    </div>

                    <div className="space-y-2">
                      {currentTask.items.map((it: any) => (
                        <div
                          key={it._id}
                          onClick={() => handleToggleItemCheck(it._id)}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!checkedItems[it._id]}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-[#1b5e39] focus:ring-[#1b5e39]"
                            />
                            <span className="font-semibold text-slate-800">
                              {it.name} <span className="text-slate-400">({it.unit})</span>
                            </span>
                          </div>
                          <span className="font-bold text-slate-900">{it.qty}x</span>
                        </div>
                      ))}
                    </div>

                    <div className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                      currentTask.paymentMethod === 'cod'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        <div>
                          <div className="font-bold">
                            {currentTask.paymentMethod === 'cod' ? 'Collect Cash on Delivery' : 'Prepaid Online (UPI)'}
                          </div>
                          <div className="text-[10px] opacity-80">
                            {currentTask.paymentMethod === 'cod' ? 'Collect exact rupees from customer' : 'Zero cash to collect'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-extrabold">
                        {currentTask.paymentMethod === 'cod' ? formatPaiseToRupees(currentTask.totalPaise) : '₹0'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ——— DRIVER SAFETY SHIELD BANNER ——— */}
            <div className="bg-gradient-to-r from-amber-500 to-[#f97316] rounded-2xl p-3 flex items-center gap-3 mt-2">
              <Shield className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <div className="text-white font-bold text-xs">🛡 Driver Safety Shield Active</div>
                <div className="text-white/80 text-[10px] mt-0.5">Press &amp; hold SOS icon above for instant roadside help.</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TRIPS HISTORY                                         */}
        {/* ============================================================ */}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            {/* Period switcher */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
              {(['week', 'lastweek', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTripPeriod(p)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    tripPeriod === p ? 'bg-white text-[#1b5e39] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {p === 'week' ? 'This Week' : p === 'lastweek' ? 'Last Week' : 'Month'}
                </button>
              ))}
            </div>

            {/* Summary card */}
            <div className="bg-[#155a34] rounded-[24px] p-4 text-white shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
                {tripPeriod === 'week' ? 'This Week (14-20 Oct)' : tripPeriod === 'lastweek' ? 'Last Week (7-13 Oct)' : 'October 2024'}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-extrabold">Total Estimated Payout</div>
                  <div className="text-3xl font-black tracking-tight">₹6,420.00</div>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">+14% vs LW</span>
              </div>
            </div>

            {/* Direct deposit info */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#f97316] flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#92400e]">
                <span className="font-bold">Processing Direct Deposit:</span> Disbursed and scheduled for <strong>Tuesday, 22 Oct</strong> to HDFC Bank ending in <strong>4109</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-[#111827]">Delivery Trip Logs</h3>
              <span className="text-xs text-slate-400 font-medium">{completedTrips.length} recent trips</span>
            </div>

            <div className="space-y-2.5">
              {completedTrips.map((tr) => (
                <div
                  key={tr.id}
                  className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#111827]">#{tr.orderNumber}</h4>
                          <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-1.5 py-0.5 rounded">
                            {tr.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{tr.shopName} → {tr.customerName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{tr.time}</span>
                          <span>·</span>
                          <span>{tr.distanceKm}</span>
                          <span>·</span>
                          <span>{tr.mins} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-extrabold text-[#1b5e39]">
                        +{formatPaiseToRupees(tr.earnedPaise)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EARNINGS & SHIFT SCORECARD                            */}
        {/* ============================================================ */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            {/* Total Payout Card */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    THIS WEEK ESTIMATED PAYOUT
                  </div>
                  <div className="text-[28px] font-extrabold text-[#111827] mt-0.5">
                    ₹6,420.00
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1b5e39] bg-[#e8f3ea] px-2.5 py-1 rounded-full">
                  +14% vs LW
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-medium">Base Delivery Pay</div>
                  <div className="text-sm font-bold text-[#111827] mt-0.5">₹4,180</div>
                  <div className="text-[10px] text-slate-400">68 deliveries</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-medium">Customer Tips</div>
                  <div className="text-sm font-bold text-[#111827] mt-0.5">₹550</div>
                  <div className="text-[10px] text-emerald-600 font-medium">100% credited</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-medium">Surge & Distance</div>
                  <div className="text-sm font-bold text-[#111827] mt-0.5">₹890</div>
                  <div className="text-[10px] text-slate-400">Weather & peak</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-medium">Target Incentives</div>
                  <div className="text-sm font-bold text-[#111827] mt-0.5">₹800</div>
                  <div className="text-[10px] text-[#1b5e39] font-medium">Sprint unlocked</div>
                </div>
              </div>
            </div>

            {/* Weekly Sprint Milestone */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#111827]">🏃 Weekly Sprint Milestone</h4>
                <span className="text-[10px] text-slate-400 font-medium">Closes Sunday, 11:59 PM (Today)</span>
              </div>
              <div className="text-sm font-extrabold text-[#1b5e39]">68/75 Orders</div>

              {/* Progress bar */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1b5e39] to-[#f97316] rounded-full transition-all" style={{ width: '90.7%' }} />
              </div>

              {/* Tier badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { tier: 'Tier 1', count: '30', earn: '₹150', done: true },
                  { tier: 'Tier 2', count: '50', earn: '₹300', done: true },
                  { tier: 'Tier 3', count: '75', earn: '₹600', done: false },
                ].map((t) => (
                  <div key={t.tier} className={`p-2.5 rounded-2xl border ${t.done ? 'bg-[#e8f3ea] border-[#cde5d2]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[9px] font-bold uppercase tracking-wider ${t.done ? 'text-[#1b5e39]' : 'text-slate-400'}`}>{t.tier}</div>
                    <div className={`text-sm font-black mt-0.5 ${t.done ? 'text-[#1b5e39]' : 'text-slate-700'}`}>{t.count}</div>
                    <div className={`text-[10px] font-bold ${t.done ? 'text-[#1b5e39]' : 'text-slate-500'}`}>{t.earn}</div>
                    {t.done && <div className="text-[9px] text-[#1b5e39] font-bold mt-0.5">✓ Unlocked</div>}
                  </div>
                ))}
              </div>

              {/* Callout */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-[11px] text-[#92400e] font-medium">
                🔥 Complete <strong>7 more orders tonight</strong> to unlock <strong>₹300 extra bonus</strong> (Tier 3)
              </div>
            </div>

            {/* Performance Scorecard */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#111827]">📊 Rider Performance Scorecard</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'On-Time Handover', value: '98.4%', sub: 'Target: >95%', good: true },
                  { label: 'Customer Rating', value: '4.92★', sub: '64 reviews', good: true },
                  { label: 'Order Acceptance', value: '99.1%', sub: '0 cancellations', good: true },
                  { label: 'Total Online Time', value: '38.5 hrs', sub: '5 active shifts', good: true },
                ].map((m) => (
                  <div key={m.label} className={`p-3 rounded-2xl ${m.good ? 'bg-[#e8f3ea]' : 'bg-slate-50'}`}>
                    <div className={`text-base font-extrabold ${m.good ? 'text-[#1b5e39]' : 'text-[#111827]'}`}>{m.value}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-semibold">{m.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ops Hub Cash Float */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-[#1b5e39]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Indirapuram Ops Hub Cash Float</div>
                  <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-1.5 py-0.5 rounded">Reconciled</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Counter #3 deposit verified by Hub Supervisor <strong>Pavan S.</strong> Pending balance to deposit: <strong>₹500.00</strong>
              </p>
              <div className="bg-[#e8f3ea] rounded-xl px-3 py-2 text-[11px] text-[#1b5e39] font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Minimum Float Guarantee Met for all 6 active days · Qualified ✓
              </div>
            </div>

            {/* Shift Breakdown */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#111827]">📅 Shift Breakdown</h4>
              <div className="space-y-3">
                {[
                  {
                    day: 'Today, Sunday 20 Oct',
                    earn: '₹790',
                    status: 'Cash Reconciled',
                    statusColor: 'text-[#1b5e39] bg-[#e8f3ea]',
                    details: '10 Deliveries',
                  },
                  {
                    day: 'Saturday, 19 Oct',
                    earn: '₹1,420',
                    status: 'Settled',
                    statusColor: 'text-blue-700 bg-blue-50',
                    details: '35 Orders · Base ₹800 · Rain Surge ₹240 · Tips ₹100',
                  },
                  {
                    day: 'Friday, 18 Oct',
                    earn: '₹960',
                    status: 'Regular Shift',
                    statusColor: 'text-slate-600 bg-slate-100',
                    details: 'Standard deliveries',
                  },
                ].map((s) => (
                  <div key={s.day} className="flex items-start justify-between p-3 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="text-xs font-bold text-[#111827]">{s.day}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.details}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-extrabold text-[#111827]">{s.earn}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.statusColor}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-around pt-1 pb-2">
              <button className="text-xs text-slate-500 font-medium underline underline-offset-2 cursor-pointer">Tax &amp; TDS Summary</button>
              <span className="text-slate-300">|</span>
              <button className="text-xs text-slate-500 font-medium underline underline-offset-2 cursor-pointer">Dispute Payout</button>
            </div>

            <button className="w-full py-3.5 bg-[#1b5e39] hover:bg-[#164d2d] text-white font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
              <HelpCircle className="w-4 h-4" />
              Talk to Indirapuram Fleet Manager
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: RIDER PROFILE                                         */}
        {/* ============================================================ */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile hero */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-[#1b5e39] text-white text-lg font-extrabold flex items-center justify-center">
                  SK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#111827]">{riderName}</h3>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1b5e39] text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{riderPhone}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-md">
                    Verified Karanja Delivery Partner
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle & EV details */}
            <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-[#1b5e39]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Hero Electric Optima · KA 04 · EV S821</div>
                  <span className="text-[9px] font-bold text-white bg-[#1b5e39] px-1.5 py-0.5 rounded">EV</span>
                </div>
              </div>

              {/* EV range */}
              <div className="bg-[#e8f3ea] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-[#1b5e39]" />
                  <div>
                    <div className="text-xs font-bold text-[#1b5e39]">78% range · 46 km remaining</div>
                    <div className="text-[10px] text-[#1b5e39] font-semibold">EV Eco-Bonus +₹5 per trip</div>
                  </div>
                </div>
                <div className="w-14 h-2 bg-[#cde5d2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1b5e39] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Service Zone</span>
                <span className="font-bold text-slate-800">Karanja (Ghadge), Wardha</span>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Direct Deposit Account</span>
                <span className="font-bold text-slate-800">HDFC Bank ending in **4109</span>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Partner Since</span>
                <span className="font-bold text-slate-800">March 2024 · 68 days active</span>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Deliveries (All Time)</span>
                <span className="font-bold text-[#1b5e39]">1,284 ✓</span>
              </div>
            </div>

            {/* Rider Captain Support */}
            <button className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea6c0c] text-white font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
              <Phone className="w-4 h-4" />
              Rider Captain Support (24x7)
            </button>

            {onBackToCustomer && (
              <button
                onClick={onBackToCustomer}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                Switch to Customer Storefront
              </button>
            )}
          </div>
        )}
      </main>

      {/* ====================================================== */}
      {/* BOTTOM NAVIGATION BAR                                   */}
      {/* ====================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-2 flex items-center justify-around select-none">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'task' ? 'text-[#1b5e39]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-bold">Deliveries</span>
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'trips' ? 'text-[#1b5e39]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Trips</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'earnings' ? 'text-[#1b5e39]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold">Earnings</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTab === 'profile' ? 'text-[#1b5e39]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};
