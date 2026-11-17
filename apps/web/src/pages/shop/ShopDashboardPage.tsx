import React from 'react';
import { Bell, Plus, ShoppingBag, FileText, Wallet, ChevronRight } from 'lucide-react';

interface ShopDashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'products' | 'orders' | 'sales') => void;
  onOpenAddProduct: () => void;
  onOpenOrder: (orderId: string) => void;
}

export const ShopDashboardPage: React.FC<ShopDashboardPageProps> = ({
  onNavigateTab,
  onOpenAddProduct,
  onOpenOrder,
}) => {
  return (
    <div className="space-y-4 px-4 pt-4 pb-24 font-sans select-none">
      
      {/* 1. Header: Good Morning & Store Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            GOOD MORNING
          </div>
          <h1 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Gupta Fresh Mart
          </h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1b5e39] mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#1b5e39] animate-pulse" />
            <span>Store is open</span>
          </div>
        </div>

        <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer">
          <Bell className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Today's Sales Hero Card */}
      <div className="bg-[#155a34] rounded-[24px] p-5 text-white shadow-sm space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            TODAY'S SALES
          </div>
          <div className="text-[32px] font-extrabold tracking-tight mt-0.5">
            ₹8,420
          </div>
          <div className="text-xs font-medium text-emerald-200 mt-0.5">
            +18.4% vs yesterday
          </div>
        </div>

        {/* Sales target progress bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#f97316] w-3/4 rounded-full" />
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 pt-2 text-center border-t border-white/10">
          <div>
            <div className="text-base font-extrabold">23</div>
            <div className="text-[10px] text-white/70 font-medium">Orders</div>
          </div>
          <div>
            <div className="text-base font-extrabold">₹366</div>
            <div className="text-[10px] text-white/70 font-medium">Avg. value</div>
          </div>
          <div>
            <div className="text-base font-extrabold">4.8</div>
            <div className="text-[10px] text-white/70 font-medium">Rating</div>
          </div>
        </div>
      </div>

      {/* 3. Action Alert Banner: 3 new orders waiting */}
      <div
        onClick={() => onNavigateTab('orders')}
        className="bg-[#fef8f0] border border-[#fde8d0] rounded-[20px] p-3.5 flex items-center justify-between shadow-xs cursor-pointer hover:bg-[#fdf2e3] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">3 new orders waiting</h4>
            <p className="text-[11px] text-[#6b7280]">Accept within the next 4 minutes</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#ea580c] hover:underline">View</span>
      </div>

      {/* 4. Quick Actions (2x2 Grid) */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">Quick actions</h3>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Action 1: Add product */}
          <div
            onClick={onOpenAddProduct}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Add product</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">Create a new listing</p>
          </div>

          {/* Action 2: Inventory */}
          <div
            onClick={() => onNavigateTab('products')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Inventory</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">4 low stock items</p>
          </div>

          {/* Action 3: Orders */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Orders</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">3 need action</p>
          </div>

          {/* Action 4: Sales report */}
          <div
            onClick={() => onNavigateTab('sales')}
            className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Sales report</h4>
            <p className="text-[10px] text-[#6b7280] mt-0.5">View performance</p>
          </div>

        </div>
      </div>

      {/* 5. Live Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#111827]">Live orders</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#1b5e39] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          
          {/* Order 1: New */}
          <div
            onClick={() => onOpenOrder('#AC2408')}
            className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">#AC2408 • 2 min ago</div>
              <div className="text-xs font-bold text-[#111827] mt-0.5">4 items • ₹548</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#ffedd5] text-[#ea580c] px-2 py-0.5 rounded-full">
                New
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Order 2: Preparing */}
          <div
            onClick={() => onOpenOrder('#AC2407')}
            className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">#AC2407 • 8 min ago</div>
              <div className="text-xs font-bold text-[#111827] mt-0.5">4 items • ₹326</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-2 py-0.5 rounded-full">
                Preparing
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
