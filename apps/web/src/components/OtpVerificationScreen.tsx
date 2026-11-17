import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';

interface OtpVerificationScreenProps {
  phone: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
  onEditPhone: () => void;
  loading?: boolean;
  error?: string;
  devOtp?: string;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  phone,
  onBack,
  onVerify,
  onEditPhone,
  loading = false,
  error = '',
  devOtp = '1234',
}) => {
  const [digits, setDigits] = useState(['1', '2', '3', '4']); // default dev OTP for smooth testing
  const [timer, setTimer] = useState(24);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length === 4) {
      onVerify(code);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center items-center p-0 sm:p-4 select-none font-sans">
      <div className="w-full max-w-[390px] min-h-screen sm:min-h-[780px] bg-white rounded-none sm:rounded-[44px] shadow-xl p-6 flex flex-col justify-between relative border-0 sm:border border-slate-200/60">
        
        {/* Top Header */}
        <div>
          {/* Back Button */}
          <div className="pt-2 pb-6">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Phone Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#e8f3ea] flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#1b5e39]" />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center px-2">
            <h1 className="text-[26px] font-bold text-[#111827] tracking-tight leading-tight">
              Verify your number
            </h1>
            <p className="text-[13px] text-[#6b7280] mt-2">
              We sent a 4-digit code to
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#111827]">
              <span>+91 {phone || '5959695592'}</span>
              <button
                type="button"
                onClick={onEditPhone}
                className="text-[#1b5e39] font-bold hover:underline cursor-pointer ml-1"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* 4 Digit Input Boxes */}
          <div className="flex justify-center gap-3.5 mt-8">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-16 rounded-2xl border border-slate-200 bg-white text-center text-2xl font-bold font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39] focus:border-[#1b5e39] shadow-xs transition"
              />
            ))}
          </div>

          {/* Resend Code Timer */}
          <div className="text-center mt-6 text-xs text-[#6b7280]">
            Didn't receive it?{' '}
            {timer > 0 ? (
              <span className="text-[#1b5e39] font-semibold">
                Resend code in 0:{timer < 10 ? `0${timer}` : timer}
              </span>
            ) : (
              <button
                onClick={() => setTimer(24)}
                className="text-[#1b5e39] font-bold hover:underline cursor-pointer"
              >
                Resend code now
              </button>
            )}
          </div>
        </div>

        {/* Bottom Verify Button */}
        <div className="pb-4 pt-6">
          <button
            onClick={handleVerify}
            disabled={loading || digits.join('').length < 4}
            className="w-full h-13 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-[16px] shadow-sm transition flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify & continue'}
          </button>
        </div>

      </div>
    </div>
  );
};
