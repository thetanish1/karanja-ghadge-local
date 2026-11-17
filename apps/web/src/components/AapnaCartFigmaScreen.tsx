import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Store, CheckCircle2, User, Truck, Shield, ArrowRight } from 'lucide-react';

interface FigmaScreenProps {
  onEnterApp: () => void;
  onOpenShopkeeper: () => void;
  onOpenAdmin: () => void;
}

export const AapnaCartFigmaScreen: React.FC<FigmaScreenProps> = ({
  onEnterApp,
  onOpenShopkeeper,
  onOpenAdmin,
}) => {
  const { loginWithPhoneOtp, quickLoginAs } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // Default to pilot demo number if left empty
    const targetPhone = phone.trim().length === 10 ? phone.trim() : '9876543210';
    if (!phone) {
      setPhone('9876543210');
    }

    try {
      setLoading(true);
      const res = await api.requestOtp(targetPhone);
      if (res.success) {
        setStep('otp');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
          setOtp(res.devOtp); // Auto-filled for smooth pilot demo
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
      const targetPhone = phone.trim().length === 10 ? phone.trim() : '9876543210';
      await loginWithPhoneOtp(targetPhone, otp);
      onEnterApp();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleShopkeeperClick = async () => {
    await quickLoginAs('shopkeeper');
    onOpenShopkeeper();
  };

  return (
    <div className="min-h-screen bg-[#eaede9] flex flex-col items-center justify-center p-0 sm:p-6 select-none font-sans relative">
      
      {/* 
        DEVICE FRAME CONTAINER
        Exact 1:1 match of Figma Canvas screen
      */}
      <div className="w-full sm:max-w-[390px] min-h-screen sm:min-h-[820px] bg-white rounded-none sm:rounded-[44px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col justify-between relative border-0 sm:border border-slate-200/60">
        
        {/* TOP SECTION */}
        <div>
          {/* Top Sage Gradient Background with Decorative Ring and Basket Photo */}
          <div className="relative bg-gradient-to-b from-[#e8f3ea] via-[#f2f7f3] to-white pt-7 pb-8 px-6 overflow-hidden">

            {/* AapnaCart Logo */}
            <div className="flex items-center gap-2.5">
              {/* Green rounded icon with bag & orange dot */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#236842] to-[#175132] flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
                  <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" strokeLinecap="round" />
                  <circle cx="12" cy="5" r="1.5" fill="#f97316" stroke="none" />
                </svg>
              </div>
              {/* Wordmark: Aapna in Green, Cart in Orange */}
              <div className="text-xl font-extrabold tracking-tight leading-none">
                <span className="text-[#1b5e39]">Aapna</span>
                <span className="text-[#f97316]">Cart</span>
              </div>
            </div>

            {/* Figma Decorative Large Mint Ring Accent */}
            <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full border-[30px] border-[#d4ead8]/55 pointer-events-none" />

            {/* Circular Masked Basket of Fresh Local Produce */}
            <div className="absolute right-[-10px] top-14 w-48 h-48 rounded-full overflow-hidden border-[3.5px] border-white shadow-xl pointer-events-none z-10 bg-slate-100">
              <img
                src="/images/fresh_basket.jpg"
                alt="Basket of fresh local vegetables"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Height Spacer */}
            <div className="h-28" />
          </div>

          {/* FIGMA TYPOGRAPHY & FORM AREA */}
          <div className="px-6 pt-1 space-y-4">
            <div>
              {/* Green Uppercase Tag */}
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#236337] mb-1">
                WELCOME TO AAPNACART
              </div>
              
              {/* Bold 2-Line Headline */}
              <h1 className="text-[28px] font-extrabold text-[#111827] tracking-tight leading-[1.18]">
                Everything local,<br />delivered fresh.
              </h1>
              
              {/* Subtitle */}
              <p className="text-[13px] text-[#6b7280] mt-2 leading-relaxed max-w-[310px]">
                Shop from trusted stores around your town and get it at your doorstep.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {devOtpHint && step === 'otp' && (
              <div className="p-2.5 rounded-xl bg-[#ecf5ee] border border-[#bfe3c8] text-[#1b5e39] text-xs flex items-center justify-between">
                <span>Dev Mock OTP: <strong className="font-mono">{devOtpHint}</strong></span>
                <span className="text-[10px] bg-[#1b5e39] text-white px-1.5 py-0.5 rounded font-bold">Auto-filled</span>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Mobile number
                  </label>
                  {/* Figma +91 Input Box */}
                  <div className="flex items-center h-12 border border-[#e2e8f0] rounded-[14px] bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#1e5e3a] focus-within:border-[#1e5e3a] transition">
                    <div className="px-4 text-xs font-bold text-[#111827] border-r border-[#e2e8f0] bg-white select-none">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3.5 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Figma Deep Forest Green Button: Continue → */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1e5e3a] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-[14px] shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{loading ? 'Continuing...' : 'Continue'}</span>
                  <span className="text-base font-bold">→</span>
                </button>

                {/* Secondary Action: I'm a shopkeeper */}
                <div className="pt-0.5 text-center">
                  <button
                    type="button"
                    onClick={handleShopkeeperClick}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e5e3a] hover:text-[#164d2d] transition py-1 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-[#1e5e3a]" />
                    <span>I'm a shopkeeper</span>
                  </button>
                </div>

                {/* Subtle Legal Disclaimer */}
                <div className="text-center text-[10px] text-[#9ca3af] pt-0.5 leading-normal">
                  By continuing, you agree to our{' '}
                  <span className="underline cursor-pointer hover:text-slate-600">Terms</span> &{' '}
                  <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
                </div>
              </form>
            ) : (
              /* OTP Step */
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#374151]">
                      Enter 6-digit OTP for +91 {phone}
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-[11px] font-bold text-[#1e5e3a] hover:underline"
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
                    className="w-full text-center tracking-[0.4em] text-xl font-mono h-12 border border-[#e2e8f0] rounded-[14px] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5e3a] font-bold"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1e5e3a] hover:bg-[#164d2d] disabled:opacity-50 text-white font-bold text-sm rounded-[14px] shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter AapnaCart'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Clean bottom padding to match Figma device mockup frame */}
        <div className="pb-8" />

      </div>
    </div>
  );
};
