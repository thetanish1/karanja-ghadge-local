import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { X, Smartphone, KeyRound, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhoneOtp, quickLoginAs } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestOtp(phone, name);
      if (res.success) {
        setStep('otp');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
          setOtp(res.devOtp); // pre-fill in development for fast testing
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    try {
      setLoading(true);
      await loginWithPhoneOtp(phone, otp, name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              K
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sign in to KGL</h3>
              <p className="text-[11px] text-slate-500">Fast, passwordless mobile access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {devOtpHint && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>Dev Mock OTP Code: <strong>{devOtpHint}</strong></span>
            <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Auto-filled</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Enter 6-Digit OTP</label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-emerald-600 font-medium hover:underline"
                >
                  Change phone
                </button>
              </div>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Fast Login Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            One-Click Pilot Testing
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { quickLoginAs('customer'); onClose(); }}
              className="p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition"
            >
              <div className="font-bold text-slate-800">Priya</div>
              <div className="text-[10px] text-slate-500">Customer</div>
            </button>
            <button
              onClick={() => { quickLoginAs('shopkeeper'); onClose(); }}
              className="p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition"
            >
              <div className="font-bold text-slate-800">Ramesh</div>
              <div className="text-[10px] text-slate-500">Shopkeeper</div>
            </button>
            <button
              onClick={() => { quickLoginAs('delivery_partner'); onClose(); }}
              className="p-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-left transition"
            >
              <div className="font-bold text-slate-800">Sunil</div>
              <div className="text-[10px] text-slate-500">Delivery Rider</div>
            </button>
            <button
              onClick={() => { quickLoginAs('admin'); onClose(); }}
              className="p-2 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-left transition"
            >
              <div className="font-bold text-slate-800">Admin</div>
              <div className="text-[10px] text-slate-500">Full Access</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
