import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Edit2, ChevronRight, MapPin, CreditCard, Bell, Store, ArrowRight, LogOut } from 'lucide-react';

interface AccountPageProps {
  onOpenLegal: (page: string) => void;
  onApplyShop: () => void;
  onOpenAuth: () => void;
  onOpenOrder: (orderId: string) => void;
  onOpenShopkeeper: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onOpenLegal,
  onApplyShop,
  onOpenAuth,
  onOpenOrder,
  onOpenShopkeeper,
}) => {
  const { user, logout } = useAuth();
  const userName = user?.name || 'Akash Kumar';
  const userPhone = user?.phone ? `+91 ${user.phone}` : '+91 98765 43210';
  const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'AK';

  const orders = [
    {
      id: 'AC2409',
      shop: 'Gupta Fresh Mart',
      status: 'DELIVERING',
      statusColor: 'text-[#ea580c]',
      details: 'Today • 4 items • ₹291',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'AC2321',
      shop: 'The Bread House',
      status: 'DELIVERED',
      statusColor: 'text-[#1b5e39]',
      details: '12 Aug • 3 items • ₹384',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    },
  ];

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

          <button className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-5 relative z-10">
        
        {/* 2. Floating Stats Card */}
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-sm grid grid-cols-3 text-center divide-x divide-slate-100">
          <div>
            <div className="text-base font-extrabold text-[#111827]">12</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Orders</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#111827]">₹1,240</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Saved</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#111827]">4.8</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Avg. rating</div>
          </div>
        </div>

        {/* 3. Your Orders Section */}
        <div>
          <h2 className="text-sm font-bold text-[#111827] mb-2.5">Your orders</h2>
          <div className="space-y-2.5">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onOpenOrder(ord.id)}
                className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                    <img
                      src={ord.image}
                      alt={ord.shop}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold ${ord.statusColor}`}>
                      {ord.status} • #{ord.id}
                    </div>
                    <div className="text-xs font-bold text-[#111827] mt-0.5">{ord.shop}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ord.details}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Account Menu Items */}
        <div>
          <h2 className="text-sm font-bold text-[#111827] mb-2.5">Account</h2>
          <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            
            {/* Saved Addresses */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Saved addresses</div>
                  <div className="text-[10px] text-slate-400">Home, Work</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Payments & Refunds */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Payments & refunds</div>
                  <div className="text-[10px] text-slate-400">UPI and cash</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Notifications */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Notifications</div>
                  <div className="text-[10px] text-slate-400">Offers and order updates</div>
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
              <div className="text-xs font-bold text-white">Shopkeeper portal</div>
              <div className="text-[11px] text-white/80">Manage your store on AapnaCart</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 text-center">
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 py-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of AapnaCart</span>
          </button>
        </div>

      </div>

    </div>
  );
};
