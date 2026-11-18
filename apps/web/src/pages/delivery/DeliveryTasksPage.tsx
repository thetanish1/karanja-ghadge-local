import React, { useState, useEffect } from 'react';
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
          earnedPaise: 4500, // ₹45 delivery fee payout for rider
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

  const riderName = user?.name || 'Ravi Singh';
  const riderPhone = user?.phone ? `+91 ${user.phone}` : '+91 98765 43212';

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
    },
    {
      id: 'trip-2',
      orderNumber: 'AC-89235',
      shopName: 'Pawan Electricals',
      customerName: 'Anil Thakare',
      time: 'Yesterday • 06:40 PM',
      earnedPaise: 5000,
      status: 'Delivered',
    },
    {
      id: 'trip-3',
      orderNumber: 'AC-89228',
      shopName: 'Shree Ganesh Cloth',
      customerName: 'Meena Sharma',
      time: 'Yesterday • 04:20 PM',
      earnedPaise: 4500,
      status: 'Delivered',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#111827] font-sans select-none pb-28">
      {/* 1. Top Rider Status Header Bar */}
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
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                4.9★
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Hero Electric Optima • Karanja Hub</div>
          </div>
        </div>

        {/* Online/Offline status switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
              isOnline ? 'bg-[#e8f3ea] text-[#1b5e39] border border-[#cde5d2]' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#1b5e39] animate-pulse' : 'bg-slate-400'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          <button
            onClick={loadTasks}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Top Summary Earnings & Stats Strip */}
      <div className="px-4 pt-3">
        <div className="bg-[#155a34] rounded-[24px] p-4 text-white shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              TODAY'S RIDER PAYOUT
            </div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              ₹585.00
            </div>
            <div className="text-[11px] text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
              <span>9 trips completed</span>
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

      {/* 3. Main Content Views based on activeTab */}
      <main className="px-4 pt-3">
        {/* ======================================================== */}
        {/* TAB 1: TASK VIEW (ACTIVE DELIVERY / STEP 1-2-3 FLOW) */}
        {/* ======================================================== */}
        {activeTab === 'task' && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Delivery Completion Overlay Screen (Image 2 style) */}
            {completedOrder && (
              <div className="bg-white rounded-[24px] p-5 border border-[#cde5d2] shadow-sm text-center space-y-4 animate-in fade-in">
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

                {/* Earnings card */}
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
                    Base pay ₹35.00 + Zero commission bonus ₹10.00
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
                {/* Multi-task carousel pills if multiple deliveries waiting */}
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

                {/* 3-Step Progress Indicator (Image 8 style) */}
                <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-extrabold text-[#111827]">Order #{currentTask.orderNumber}</span>
                    <span className="font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full text-[10px]">
                      Est. 15 min
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <div className={`p-2 rounded-xl transition ${
                      ['ready_for_pickup', 'delivery_assigned'].includes(currentTask.status)
                        ? 'bg-[#e8f3ea] text-[#1b5e39] border border-[#cde5d2]'
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      1. At Store
                    </div>
                    <div className={`p-2 rounded-xl transition ${
                      currentTask.status === 'picked_up'
                        ? 'bg-[#e8f3ea] text-[#1b5e39] border border-[#cde5d2]'
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      2. Bag Check
                    </div>
                    <div className={`p-2 rounded-xl transition ${
                      currentTask.status === 'out_for_delivery'
                        ? 'bg-[#fff7ed] text-[#ea580c] border border-orange-200'
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      3. Drop & PIN
                    </div>
                  </div>
                </div>

                {/* Store Pickup Card (Image 8) */}
                <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Store className="w-3 h-3" /> Step 1 • Pick Up from Store
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Near Town Bazaar</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-[#111827]">{currentTask.shopName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{currentTask.shopAddress}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {currentTask.shopNavUrl && (
                      <a
                        href={currentTask.shopNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#1b5e39]" />
                        <span>Store Map</span>
                      </a>
                    )}
                    {currentTask.shopPhone && (
                      <a
                        href={`tel:${currentTask.shopPhone}`}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1b5e39]" />
                        <span>Call Store</span>
                      </a>
                    )}
                  </div>

                  {/* Pickup Confirmation Action */}
                  {['ready_for_pickup', 'delivery_assigned'].includes(currentTask.status) && (
                    <button
                      onClick={() => handleTransition(currentTask.orderId, 'picked_up')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading ? 'Updating...' : 'Confirm Items Picked Up from Store'}</span>
                    </button>
                  )}
                </div>

                {/* Customer Drop Location Card */}
                <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#ea580c]" /> Step 2 • Drop Location
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Customer Address</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-[#111827]">{currentTask.customerName}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{currentTask.customerAddress}</p>
                    {currentTask.customerLandmark && (
                      <p className="text-[11px] text-[#ea580c] font-medium mt-1">
                        Landmark: {currentTask.customerLandmark}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    {currentTask.destNavUrl && (
                      <a
                        href={currentTask.destNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#ea580c]" />
                        <span>Navigate</span>
                      </a>
                    )}
                    {currentTask.customerPhone && (
                      <a
                        href={`tel:${currentTask.customerPhone}`}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1b5e39]" />
                        <span>Call Customer</span>
                      </a>
                    )}
                  </div>

                  {currentTask.status === 'picked_up' && (
                    <button
                      onClick={() => handleTransition(currentTask.orderId, 'out_for_delivery')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-[#1e40af] hover:bg-[#1d3bb0] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{actionLoading ? 'Updating...' : 'Start Route (Out for Delivery)'}</span>
                    </button>
                  )}
                </div>

                {/* Merchant Bag Items Verification Checklist */}
                {currentTask.items && currentTask.items.length > 0 && (
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

                    {/* Cash collection badge */}
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

                {/* Step 3: Interactive Doorstep PIN Keypad (Image 1 style) */}
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
                      Ask <strong>{currentTask.customerName}</strong> for the 4-digit code shown in their AapnaCart order tracking screen.
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

                    {/* Confirm Handover Button */}
                    <button
                      onClick={() => handleVerifyOtp(currentTask.orderId)}
                      disabled={actionLoading || handoverPin.length !== 4}
                      className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{actionLoading ? 'Verifying...' : 'Confirm Handover & Complete'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TRIPS HISTORY (Image 3 style) */}
        {/* ======================================================== */}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-[#111827]">Delivery Trip Logs</h3>
              <span className="text-xs text-slate-400 font-medium">{completedTrips.length} recent trips</span>
            </div>

            <div className="space-y-2.5">
              {completedTrips.map((tr) => (
                <div
                  key={tr.id}
                  className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#111827]">#{tr.orderNumber}</h4>
                        <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-1.5 py-0.2 rounded">
                          {tr.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{tr.shopName} → {tr.customerName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tr.time}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#1b5e39]">
                      +{formatPaiseToRupees(tr.earnedPaise)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EARNINGS & SHIFT SCORECARD (Image 3 style) */}
        {/* ======================================================== */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            {/* Total Estimated Payout Card */}
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

              {/* 4 Breakdown mini boxes */}
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

            {/* Performance Scorecard */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#111827]">Rider Performance Scorecard</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50">
                  <div className="text-base font-extrabold text-[#111827]">98.4%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">On-Time Handover</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <div className="text-base font-extrabold text-[#111827]">4.92★</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: RIDER PROFILE */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-[#1b5e39] text-white text-lg font-extrabold flex items-center justify-center">
                  RS
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">{riderName}</h3>
                  <p className="text-xs text-slate-400">{riderPhone}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-md">
                    Verified Karanja Delivery Partner
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Vehicle Model</span>
                <span className="font-bold text-slate-800">Hero Electric Optima (EV)</span>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Service Zone</span>
                <span className="font-bold text-slate-800">Karanja (Ghadge), Wardha</span>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Direct Deposit Account</span>
                <span className="font-bold text-slate-800">HDFC Bank ending in **4109</span>
              </div>
            </div>

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

      {/* 4. Bottom Navigation Bar for Delivery Partner (matching AapnaCart style) */}
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
