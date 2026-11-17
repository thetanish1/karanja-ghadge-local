import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Store, Mail, Clock, MapPin, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface ShopVerificationScreenProps {
  shop: {
    id?: string;
    name: string;
    ownerName?: string;
    email?: string;
    phone: string;
    address: string;
    status: string;
    openTime?: string;
    closeTime?: string;
    category?: string;
    photos?: string[];
  };
  onBackToHome: () => void;
  onOpenDemoPortal: () => void;
}

export const ShopVerificationScreen: React.FC<ShopVerificationScreenProps> = ({
  shop,
  onBackToHome,
  onOpenDemoPortal,
}) => {
  const [checking, setChecking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(shop.status || 'pending');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    if (!shop.id || shop.id.startsWith('temp') || shop.id.startsWith('local')) {
      setChecking(true);
      setTimeout(() => {
        setChecking(false);
        setStatusMessage('Your application is currently in queue with the Karanja Ghadge admin team. Estimated review: 2-4 hours.');
      }, 700);
      return;
    }

    try {
      setChecking(true);
      const res = await api.checkShopApplicationStatus(shop.id);
      if (res.success && res.shop) {
        setCurrentStatus(res.shop.status);
        if (res.shop.status === 'approved') {
          setStatusMessage('Congratulations! Your shop has been approved by the admin. You can now access your full portal!');
        } else {
          setStatusMessage(`Current status: ${res.shop.status.toUpperCase()}. Admin verification in progress.`);
        }
      }
    } catch (e) {
      setStatusMessage('Application received and currently under review by admin.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center items-center p-0 sm:p-4 select-none font-sans">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[820px] bg-white rounded-none sm:rounded-[40px] shadow-xl flex flex-col justify-between border-0 sm:border border-slate-200/60 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
          >
            ← Back to App
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#1b5e39] flex items-center justify-center text-white text-xs font-extrabold">
              A
            </div>
            <span className="text-xs font-extrabold text-[#111827]">
              Aapna<span className="text-[#f97316]">Cart</span>
            </span>
          </div>

          <div className="w-16" />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          
          {/* Centered Glowing Status Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100/80 shadow-md">
              <Clock className="w-9 h-9 text-amber-600 animate-pulse" />
            </div>

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Shop in Verifying Stage</span>
              </div>

              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                Application Received!
              </h1>
              <p className="text-xs text-[#6b7280] mt-1 max-w-[320px] mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{shop.ownerName || 'Merchant'}</strong>. Your application for <strong className="text-slate-900">{shop.name}</strong> is under review by our Karanja (Ghadge) admin team.
              </p>
            </div>
          </div>

          {/* Email Dispatched Alert Card */}
          <div className="bg-[#e8f3ea] border border-[#c4e3c8] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#1b5e39] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#1b5e39]">
                Verification Email Dispatched
              </div>
              <p className="text-[11px] text-slate-700 leading-normal">
                An official confirmation and application summary has been sent to:
              </p>
              <div className="text-xs font-bold text-[#111827] bg-white/80 px-2.5 py-1 rounded-lg border border-[#c4e3c8] inline-block">
                {shop.email || 'merchant@gmail.com'}
              </div>
            </div>
          </div>

          {/* Live Status Notification if refreshed */}
          {statusMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Step Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Onboarding Roadmap
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#1b5e39] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">Application Submitted</div>
                  <div className="text-[10px] text-slate-500">Details, timing & photos uploaded</div>
                </div>
                <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                  Completed
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#1b5e39] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">Email Confirmation Dispatched</div>
                  <div className="text-[10px] text-slate-500">Sent to {shop.email || 'your email'}</div>
                </div>
                <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                  Dispatched
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-800">Admin Document Verification</div>
                  <div className="text-[10px] text-slate-500">Location, identity & Karanja service area</div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Progress
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-700">Catalog Live on AapnaCart</div>
                  <div className="text-[10px] text-slate-400">Accepting orders from Karanja residents</div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Next Step
                </span>
              </div>
            </div>
          </div>

          {/* Submitted Store Details Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#1b5e39]" />
              <span>Registered Shop Summary</span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Shop Name:</span>
                <span className="font-semibold text-slate-900">{shop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner:</span>
                <span className="font-semibold">{shop.ownerName || 'Ramesh Gupta'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold">+91 {shop.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Hours:</span>
                <span className="font-semibold">{shop.openTime || '07:30'} - {shop.closeTime || '21:30'}</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                <span className="font-medium text-slate-700">Location: </span>
                {shop.address}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="p-5 pt-3 pb-6 border-t border-slate-100 bg-white space-y-2.5">
          {/* Check Status Button */}
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full h-12 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-[#1b5e39] text-[#1b5e39] font-bold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check Verification Status'}</span>
          </button>

          {/* Explore Demo Portal Button */}
          <button
            onClick={onOpenDemoPortal}
            className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Demo Shopkeeper Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center pt-1">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
            >
              Return to Customer Storefront
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
