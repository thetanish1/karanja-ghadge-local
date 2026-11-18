import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { Edit2, ChevronRight, MapPin, CreditCard, Bell, Store, ArrowRight, LogOut, Clock, ShoppingBag, Truck } from 'lucide-react';

interface AccountPageProps {
  onOpenLegal: (page: string) => void;
  onApplyShop: () => void;
  onOpenAuth: () => void;
  onOpenOrder: (orderId: string) => void;
  onOpenShopkeeper: () => void;
  onOpenDelivery?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onOpenLegal,
  onApplyShop,
  onOpenAuth,
  onOpenOrder,
  onOpenShopkeeper,
  onOpenDelivery,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecentOrders();
    }
  }, [isAuthenticated]);

  const loadRecentOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders.slice(0, 3));
      }
    } catch (e) {
      console.warn('Failed to load user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const userName = user?.name || (isAuthenticated ? 'AapnaCart Customer' : 'Guest User');
  const userPhone = user?.phone ? `+91 ${user.phone}` : 'Not signed in';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AC';

  return (
    <div className="font-sans select-none pb-28">
      {/* 1. Top Green Profile Header */}
      <div className="bg-[#155a34] px-5 pt-7 pb-10 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-[#fed7aa] text-[#c2410c] text-lg font-extrabold flex items-center justify-center shadow-md">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{userName}</h1>
              <p className="text-xs text-white/80 mt-0.5">{userPhone}</p>
            </div>
          </div>

          {!isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-white text-[#155a34] font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <div className="px-2 py-1 rounded-lg bg-white/20 text-[10px] font-semibold text-emerald-100">
              Active Member
            </div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-5 relative z-10">
        {/* 2. Floating Stats Card */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-sm grid grid-cols-3 text-center divide-x divide-slate-100">
          <div>
            <div className="text-base font-extrabold text-[#111827]">{orders.length}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Orders</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#111827]">₹0</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Delivery Fee</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#111827]">5.0★</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Local Rating</div>
          </div>
        </div>

        {/* 3. Your Orders Section */}
        <div>
          <h2 className="text-sm font-bold text-[#111827] mb-2.5">Your recent orders</h2>
          {loadingOrders ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-16 bg-slate-200 rounded-[20px]" />
              <div className="h-16 bg-slate-200 rounded-[20px]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[20px] p-5 text-center text-xs text-slate-400 border border-slate-200">
              No orders placed yet. Support local Karanja stores today!
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((ord) => (
                <div
                  key={ord._id || ord.id}
                  onClick={() => onOpenOrder(ord._id || ord.id)}
                  className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b5e39] flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900">#{ord.orderNumber}</span>
                        <StatusBadge status={ord.status} />
                      </div>
                      <div className="text-xs font-bold text-[#111827] mt-0.5">{ord.shopName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {ord.itemCount} items • {formatPaiseToRupees(ord.totalPaise)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Account Menu Items */}
        <div>
          <h2 className="text-sm font-bold text-[#111827] mb-2.5">Account & Support</h2>
          <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {/* Delivery Area info */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Service location</div>
                  <div className="text-[10px] text-slate-400">Karanja (Ghadge), Wardha, Maharashtra</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Terms & Privacy Policies */}
            <div
              onClick={() => onOpenLegal('terms')}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Terms & Conditions</div>
                  <div className="text-[10px] text-slate-400">Buyer and merchant policies</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Privacy Policy */}
            <div
              onClick={() => onOpenLegal('privacy')}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Privacy Policy</div>
                  <div className="text-[10px] text-slate-400">Data usage & local privacy</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 5. Shopkeeper Portal Banner */}
        <div
          onClick={onOpenShopkeeper}
          className="bg-[#155a34] rounded-[22px] p-4 text-white flex items-center justify-between shadow-xs hover:bg-[#124d2d] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Shopkeeper Portal</div>
              <div className="text-[11px] text-white/80">Manage your store, products & live orders</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>

        {/* 6. Delivery Partner Portal Banner */}
        {onOpenDelivery && (
          <div
            onClick={onOpenDelivery}
            className="bg-[#1e40af] rounded-[22px] p-4 text-white flex items-center justify-between shadow-xs hover:bg-[#1d3bb0] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Delivery Partner Portal</div>
                <div className="text-[11px] text-white/80">Pickup from shop, maps route & OTP handover</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Sign Out Button */}
        {isAuthenticated && (
          <div className="pt-2 text-center">
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 py-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out of AapnaCart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
