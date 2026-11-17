import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { User, Store, Shield, Phone, FileText, ExternalLink, LogOut, CheckCircle } from 'lucide-react';

interface AccountPageProps {
  onOpenLegal: (page: string) => void;
  onApplyShop: () => void;
  onOpenAuth: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onOpenLegal, onApplyShop, onOpenAuth }) => {
  const { user, isAuthenticated, logout, quickLoginAs, activeRole } = useAuth();

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">{user.name || 'Resident Customer'}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>+91 {user.phone}</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {user.roles.map((r: string) => (
                  <span key={r} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium capitalize">
                    {r.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Welcome to Karanjaghadge Local</h2>
            <p className="text-xs text-slate-500 mb-3">Sign in with phone number for orders & account</p>
            <button
              onClick={onOpenAuth}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Sign In with OTP
            </button>
          </div>
        )}
      </div>

      {/* Shopkeeper Onboarding Action */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="inline-block bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 uppercase">
              Free Pilot Partner
            </div>
            <h3 className="text-sm font-bold leading-tight">Do you own a shop in Karanjaghadge?</h3>
            <p className="text-xs text-blue-100 mt-1">
              List your shop and products for ₹0. Zero commission on pilot orders.
            </p>
          </div>
          <Store className="w-10 h-10 text-blue-300 flex-shrink-0" />
        </div>

        <button
          onClick={onApplyShop}
          className="mt-3.5 w-full py-2.5 bg-white text-blue-900 font-bold text-xs rounded-xl hover:bg-blue-50 transition shadow-sm"
        >
          Register My Shop for Free Pilot
        </button>
      </div>

      {/* Role Testing Shortcuts */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Switch Perspective (Pilot Testing)
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => quickLoginAs('customer')}
            className={`p-2.5 rounded-xl border text-left transition ${
              activeRole === 'customer' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Priya (Customer)
          </button>
          <button
            onClick={() => quickLoginAs('shopkeeper')}
            className={`p-2.5 rounded-xl border text-left transition ${
              activeRole === 'shopkeeper' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Ramesh (Shopkeeper)
          </button>
          <button
            onClick={() => quickLoginAs('delivery_partner')}
            className={`p-2.5 rounded-xl border text-left transition ${
              activeRole === 'delivery_partner' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sunil (Delivery Rider)
          </button>
          <button
            onClick={() => quickLoginAs('admin')}
            className={`p-2.5 rounded-xl border text-left transition ${
              activeRole === 'admin' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Platform Admin
          </button>
        </div>
      </div>

      {/* Community & Legal Policies */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 text-xs">
        <button
          onClick={() => onOpenLegal('terms')}
          className="w-full p-3.5 text-left flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span>Terms of Service</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onOpenLegal('privacy')}
          className="w-full p-3.5 text-left flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span>Privacy Policy</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onOpenLegal('cancellation')}
          className="w-full p-3.5 text-left flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span>Cancellation & Refund Policy</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onOpenLegal('delivery')}
          className="w-full p-3.5 text-left flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span>Delivery Terms & Pilot Coverage</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onOpenLegal('contact')}
          className="w-full p-3.5 text-left flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span>Support & Karanja Community Contact</span>
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      )}
    </div>
  );
};
