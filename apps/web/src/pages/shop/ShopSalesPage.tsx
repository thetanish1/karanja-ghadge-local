import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, FileText, Wallet, Download } from 'lucide-react';

interface ShopSalesPageProps {
  onBack: () => void;
}

export const ShopSalesPage: React.FC<ShopSalesPageProps> = ({ onBack }) => {
  const [range, setRange] = useState<'7d' | '30d' | '3m'>('30d');

  // Heights for the 10 green bar chart bars
  const bars = [35, 48, 42, 68, 55, 72, 64, 85, 78, 92];

  const bestSellers = [
    {
      rank: 1,
      name: 'Fresh Red Tomatoes',
      sold: '84 units sold',
      revenue: '₹3,024',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
    },
    {
      rank: 2,
      name: 'Farm Fresh Milk',
      sold: '67 units sold',
      revenue: '₹4,154',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
    },
    {
      rank: 3,
      name: 'Seasonal Veggie Box',
      sold: '50 units sold',
      revenue: '₹7,450',
      image: '/images/fresh_basket.jpg',
    },
  ];

  return (
    <div className="space-y-4 px-4 pt-4 pb-28 font-sans select-none min-h-screen">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Sales & insights</h1>
        <div className="w-10" />
      </div>

      {/* 2. Range Filter Pills */}
      <div className="flex bg-slate-100/80 p-1 rounded-2xl">
        <button
          onClick={() => setRange('7d')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            range === '7d'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          7 days
        </button>
        <button
          onClick={() => setRange('30d')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            range === '30d'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          30 days
        </button>
        <button
          onClick={() => setRange('3m')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            range === '3m'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          3 months
        </button>
      </div>

      {/* 3. Total Sales & Interactive Bar Chart */}
      <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TOTAL SALES
          </div>
          <div className="text-[32px] font-extrabold text-[#111827] tracking-tight mt-0.5">
            ₹1,84,620
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#1b5e39] mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>14.2% from last month</span>
          </div>
        </div>

        {/* 10 Vertical Bars Chart */}
        <div className="pt-4 pb-2">
          <div className="h-32 flex items-end justify-between gap-2 px-1">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-[#3d9a59] group-hover:bg-[#1b5e39] rounded-t-lg transition-all"
                />
              </div>
            ))}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100 px-1">
            <span>1 Aug</span>
            <span>15 Aug</span>
            <span>30 Aug</span>
          </div>
        </div>
      </div>

      {/* 4. Two Metric Cards (486 Orders & ₹380 Avg. order) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-2.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">486</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total orders</div>
        </div>

        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-2.5">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">₹380</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Avg. order</div>
        </div>
      </div>

      {/* 5. Best Selling Products */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">Best selling products</h3>
        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {bestSellers.map((item) => (
            <div key={item.rank} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-3 text-center">
                  {item.rank}
                </span>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.sold}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#111827]">{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Download Monthly Report Button */}
      <div className="pt-2">
        <button
          onClick={() => alert('Monthly report downloaded as CSV')}
          className="w-full h-12 rounded-[18px] border border-[#1b5e39] text-[#1b5e39] hover:bg-[#e8f3ea]/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download monthly report</span>
        </button>
      </div>

    </div>
  );
};
