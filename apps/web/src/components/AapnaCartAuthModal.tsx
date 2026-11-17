import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { AapnaCartLogo } from './AapnaCartLogo.js';
import { X, Store, ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';

interface AapnaCartAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
}

export const AapnaCartAuthModal: React.FC<AapnaCartAuthModalProps> = ({ isOpen, onClose, initialRole }) => {
  const { loginWithPhoneOtp, quickLoginAs } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestOtp(phone, name);
      if (res.success) {
        setStep('otp');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
          setOtp(res.devOtp); // Auto-fill for seamless pilot testing
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
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleShopkeeperClick = () => {
    quickLoginAs('shopkeeper');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Figma Mobile Card Container */}
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] max-w-sm w-full shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-8">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-sm"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. FIGMA TOP HERO SECTION WITH SAGE GRADIENT & CIRCULAR VEGETABLE BASKET */}
        <div className="relative bg-gradient-to-b from-[#eaf4ec] via-[#f1f8f3] to-white pt-6 pb-4 px-6 overflow-hidden">
          {/* Subtle Mobile Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-4 pr-8 opacity-80">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
              <span className="w-2.5 h-1.5 border border-slate-800 rounded-sm inline-block"></span>
            </div>
          </div>

          {/* AapnaCart Logo */}
          <div className="mb-2">
            <AapnaCartLogo size="md" />
          </div>

          {/* Decorative Mint Ring Accent from Figma */}
          <div className="absolute -top-10 -right-12 w-52 h-52 rounded-full border-[28px] border-[#d2e6d6]/50 pointer-events-none" />

          {/* Figma Circular Masked Basket of Fresh Local Produce */}
          <div className="absolute right-[-10px] top-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl pointer-events-none z-10">
            <img
              src="/images/fresh_basket.jpg"
              alt="Fresh vegetables in basket"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Spacer to give room for graphic */}
          <div className="h-20" />
        </div>

        {/* 2. FIGMA TYPOGRAPHY & COPY SECTION */}
        <div className="px-6 pt-2 pb-6 space-y-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1b5e39] mb-1">
              Welcome to AapnaCart
            </div>
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight leading-tight">
              Everything local,<br />delivered fresh.
            </h2>
            <p className="text-xs text-[#6b7280] mt-1.5 leading-relaxed pr-2">
              Shop from trusted stores around your town and get it at your doorstep.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Dev Mock OTP Notice */}
          {devOtpHint && (
            <div className="p-2.5 rounded-xl bg-[#ecf5ee] border border-[#bfe3c8] text-[#1b5e39] text-xs flex items-center justify-between">
              <span>Dev Mock OTP: <strong className="font-mono">{devOtpHint}</strong></span>
              <span className="text-[10px] bg-[#1b5e39] text-white px-1.5 py-0.5 rounded font-bold">Auto-filled</span>
            </div>
          )}

          {/* 3. FIGMA INPUT & ACTION SECTION */}
          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Mobile number
                </label>
                <div className="flex items-center border border-[#e5e7eb] rounded-2xl bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#1b5e39] focus-within:border-[#1b5e39] transition">
                  <div className="px-3.5 py-3 text-xs font-bold text-[#111827] border-r border-[#e5e7eb] bg-slate-50/60 select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3.5 py-3 text-xs sm:text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Main Figma Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1b5e39] hover:bg-[#154e2e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Sending OTP...' : 'Continue'}</span>
                <span className="text-base font-bold">→</span>
              </button>

              {/* Figma "I'm a shopkeeper" secondary action */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleShopkeeperClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b5e39] hover:text-[#154e2e] transition py-1"
                >
                  <Store className="w-4 h-4" />
                  <span>I'm a shopkeeper</span>
                </button>
              </div>

              {/* Figma Legal Disclaimer */}
              <div className="text-center text-[10px] text-[#9ca3af] pt-1 leading-normal">
                By continuing, you agree to our{' '}
                <span className="underline cursor-pointer hover:text-slate-600">Terms</span> &{' '}
                <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
              </div>
            </form>
          ) : (
            /* OTP Verification Step */
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#374151]">
                    Enter 6-digit OTP sent to +91 {phone}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[11px] font-bold text-[#1b5e39] hover:underline"
                  >
                    Change
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 border border-[#e5e7eb] rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5e39] font-bold"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1b5e39] hover:bg-[#154e2e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Enter AapnaCart'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Fast Pilot Demo Shortcuts */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span>Instant Pilot Roles</span>
              <span className="text-[#f97316]">1-Tap Demo</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { quickLoginAs('customer'); onClose(); }}
                className="p-2 rounded-xl border border-slate-200 hover:border-[#1b5e39] hover:bg-[#ecf5ee] text-left transition"
              >
                <div className="font-bold text-slate-800">Priya</div>
                <div className="text-[10px] text-slate-500">Customer Mode</div>
              </button>
              <button
                type="button"
                onClick={() => { quickLoginAs('shopkeeper'); onClose(); }}
                className="p-2 rounded-xl border border-slate-200 hover:border-[#1b5e39] hover:bg-[#ecf5ee] text-left transition"
              >
                <div className="font-bold text-slate-800">Ramesh</div>
                <div className="text-[10px] text-slate-500">Shopkeeper Mode</div>
              </button>
              <button
                type="button"
                onClick={() => { quickLoginAs('delivery_partner'); onClose(); }}
                className="p-2 rounded-xl border border-slate-200 hover:border-[#f97316] hover:bg-orange-50 text-left transition"
              >
                <div className="font-bold text-slate-800">Sunil</div>
                <div className="text-[10px] text-slate-500">Delivery Rider</div>
              </button>
              <button
                type="button"
                onClick={() => { quickLoginAs('admin'); onClose(); }}
                className="p-2 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-left transition"
              >
                <div className="font-bold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-500">Full Dashboard</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
