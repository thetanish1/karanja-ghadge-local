import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
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
} from 'lucide-react';

export const DeliveryTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState<{ isOpen: boolean; orderId?: string }>({ isOpen: false });
  const [otpInput, setOtpInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const res = await api.getDeliveryTasks();
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (e) {
      console.warn('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (orderId: string, targetState: string) => {
    try {
      setActionLoading(true);
      const res = await api.transitionDeliveryTask(orderId, targetState);
      if (res.success) {
        await loadTasks();
      }
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpModal.orderId || otpInput.length !== 4) {
      setError('Please enter the 4-digit OTP provided by customer.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const res = await api.verifyDeliveryOtp(otpModal.orderId, otpInput);
      if (res.success) {
        setOtpModal({ isOpen: false });
        setOtpInput('');
        await loadTasks();
      }
    } catch (e: any) {
      setError(e.message || 'Incorrect OTP code');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Deliveries</h2>
        </div>
        <button onClick={loadTasks} className="p-1 text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-36 bg-slate-200 rounded-2xl" />
          <div className="h-36 bg-slate-200 rounded-2xl" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">No active delivery assignments.</p>
          <p className="mt-1">When an admin assigns orders to you, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.orderId}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">#{task.orderNumber}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Amount: <strong className="text-slate-900">{formatPaiseToRupees(task.totalPaise)}</strong> ({task.paymentMethod.toUpperCase()})
                  </div>
                </div>

                {task.paymentMethod === 'cod' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Banknote className="w-3 h-3" /> Collect Cash
                  </span>
                )}
              </div>

              {/* Pickup from Shop Section */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">1. Pickup from Shop</span>
                  {task.shopNavUrl && (
                    <a
                      href={task.shopNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Navigation className="w-3 h-3" /> Maps
                    </a>
                  )}
                </div>
                <div className="font-bold text-slate-900">{task.shopName}</div>
                <div className="text-slate-500 text-[11px]">{task.shopAddress}</div>
                {task.shopPhone && (
                  <div className="pt-1">
                    <a href={`tel:${task.shopPhone}`} className="text-slate-600 hover:text-black font-semibold flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" /> +91 {task.shopPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Deliver to Customer Section */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">2. Deliver to Customer</span>
                  {task.destNavUrl && (
                    <a
                      href={task.destNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Navigation className="w-3 h-3" /> Maps
                    </a>
                  )}
                </div>
                <div className="font-bold text-slate-900">{task.customerName}</div>
                <div className="text-slate-600 text-[11px]">{task.customerAddress}</div>
                {task.customerLandmark && (
                  <div className="text-slate-500 text-[10px]">Landmark: {task.customerLandmark}</div>
                )}
                {task.customerPhone && (
                  <div className="pt-1">
                    <a href={`tel:${task.customerPhone}`} className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-emerald-600" /> +91 {task.customerPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Workflow Actions */}
              <div className="pt-1">
                {['ready_for_pickup', 'delivery_assigned'].includes(task.status) && (
                  <button
                    onClick={() => handleTransition(task.orderId, 'picked_up')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Confirm Order Collected from Shop</span>
                  </button>
                )}

                {task.status === 'picked_up' && (
                  <button
                    onClick={() => handleTransition(task.orderId, 'out_for_delivery')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Start Route (Out for Delivery)</span>
                  </button>
                )}

                {task.status === 'out_for_delivery' && (
                  <button
                    onClick={() => setOtpModal({ isOpen: true, orderId: task.orderId })}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter Customer OTP & Deliver</span>
                  </button>
                )}

                {task.status === 'delivered' && (
                  <div className="w-full py-2 text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl">
                    ✓ Order Delivered
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OTP Delivery Verification Modal */}
      {otpModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Verify Delivery Handover</h3>
            <p className="text-xs text-slate-500 mb-3">
              Ask customer for their 4-digit Delivery OTP shown in their app.
            </p>

            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="4-Digit OTP"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setOtpModal({ isOpen: false }); setOtpInput(''); setError(''); }}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={actionLoading || otpInput.length !== 4}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
              >
                {actionLoading ? 'Verifying...' : 'Complete Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
