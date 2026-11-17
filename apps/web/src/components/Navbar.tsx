import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { MapPin, User, ChevronDown, ShoppingBag, Shield, Truck, Store } from 'lucide-react';
import { api } from '../services/api.js';
import { AapnaCartLogo } from './AapnaCartLogo.js';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, activeRole, quickLoginAs, logout, isAuthenticated } = useAuth();
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    api.getServiceability().then((res) => {
      setServiceable(res.serviceable);
    }).catch(() => setServiceable(true));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-2">
          <AapnaCartLogo size="md" />
          <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#1b5e39] flex-shrink-0" />
            <span className="truncate max-w-[120px]">Karanjaghadge</span>
            {serviceable !== null && (
              <span className={`inline-flex items-center text-[10px] px-1 rounded font-bold ${serviceable ? 'text-[#1b5e39]' : 'text-amber-700'}`}>
                • 7km
              </span>
            )}
          </div>
        </div>

        {/* Persona Switcher & Account */}
        <div className="flex items-center gap-2">
          {/* Quick Role Mode Selector for testing */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Switch user perspective for pilot testing"
            >
              <span className="capitalize text-[11px] font-bold text-[#1b5e39]">{activeRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Perspective
                </div>
                <button
                  onClick={() => { quickLoginAs('customer'); setShowRoleMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#ecf5ee] ${activeRole === 'customer' ? 'text-[#1b5e39] font-bold bg-[#ecf5ee]/60' : 'text-slate-700'}`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#1b5e39]" />
                  <div>
                    <div>Customer (Priya)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Browse, cart & order</div>
                  </div>
                </button>
                <button
                  onClick={() => { quickLoginAs('shopkeeper'); setShowRoleMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#ecf5ee] ${activeRole === 'shopkeeper' ? 'text-[#1b5e39] font-bold bg-[#ecf5ee]/60' : 'text-slate-700'}`}
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>Shopkeeper (Ramesh)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Accept orders & products</div>
                  </div>
                </button>
                <button
                  onClick={() => { quickLoginAs('delivery_partner'); setShowRoleMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#ecf5ee] ${activeRole === 'delivery_partner' ? 'text-[#1b5e39] font-bold bg-[#ecf5ee]/60' : 'text-slate-700'}`}
                >
                  <Truck className="w-4 h-4 text-[#f97316]" />
                  <div>
                    <div>Delivery Rider (Sunil)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Navigation & OTP delivery</div>
                  </div>
                </button>
                <button
                  onClick={() => { quickLoginAs('admin'); setShowRoleMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#ecf5ee] ${activeRole === 'admin' ? 'text-[#1b5e39] font-bold bg-[#ecf5ee]/60' : 'text-slate-700'}`}
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <div>
                    <div>Platform Admin</div>
                    <div className="text-[10px] text-slate-400 font-normal">Approvals, settings & logs</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Sign-in button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-600 font-semibold px-2 py-1"
              title="Sign Out"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1b5e39] hover:bg-[#154e2e] text-white shadow-sm transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
