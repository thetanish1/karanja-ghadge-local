import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Clock } from 'lucide-react';

interface ShopOrdersPageProps {
  onBack: () => void;
}

export const ShopOrdersPage: React.FC<ShopOrdersPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready'>('new');

  const [orders, setOrders] = useState([
    {
      id: '#AC2408',
      customer: 'Akash Kumar',
      status: 'New',
      badgeColor: 'bg-[#ffedd5] text-[#ea580c]',
      timeAgo: '2 minutes ago',
      deliveryTime: 'Delivery in 24 minutes',
      items: [
        { name: 'Fresh Red Tomatoes', qty: 2, price: 72 },
        { name: 'Seasonal Veggie Box', qty: 1, price: 149 },
        { name: '2 more items', qty: '', price: 327 },
      ],
      total: 548,
    },
    {
      id: '#AC2407',
      customer: 'Meera Joshi',
      status: 'Preparing',
      badgeColor: 'bg-[#e8f3ea] text-[#1b5e39]',
      timeAgo: '6 minutes ago',
      deliveryTime: 'Delivery in 24 minutes',
      items: [
        { name: 'Fresh Red Tomatoes', qty: 2, price: 72 },
        { name: 'Seasonal Veggie Box', qty: 1, price: 149 },
        { name: '2 more items', qty: '', price: 327 },
      ],
      total: 326,
    },
    {
      id: '#AC2406',
      customer: 'Rohan Verma',
      status: 'Ready',
      badgeColor: 'bg-blue-50 text-blue-700',
      timeAgo: '10 minutes ago',
      deliveryTime: 'Delivery in 24 minutes',
      items: [
        { name: 'Fresh Red Tomatoes', qty: 2, price: 72 },
        { name: 'Seasonal Veggie Box', qty: 1, price: 149 },
        { name: '2 more items', qty: '', price: 327 },
      ],
      total: 412,
    },
  ]);

  const handleAccept = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Preparing', badgeColor: 'bg-[#e8f3ea] text-[#1b5e39]' } : o))
    );
  };

  const handleMarkReady = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Ready', badgeColor: 'bg-blue-50 text-blue-700' } : o))
    );
  };

  const handleDispatch = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleReject = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'New';
    if (activeTab === 'preparing') return o.status === 'Preparing';
    if (activeTab === 'ready') return o.status === 'Ready';
    return true;
  });

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
        <h1 className="text-base font-bold text-[#111827]">Manage orders</h1>
        <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Tab Navigation Pills */}
      <div className="flex bg-slate-100/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'new'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          New 3
        </button>
        <button
          onClick={() => setActiveTab('preparing')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'preparing'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          Preparing 2
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'ready'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          Ready 1
        </button>
      </div>

      {/* 3. Order Cards */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[22px] p-8 text-center text-slate-400 text-xs font-medium border border-slate-200/80">
            No orders in this queue.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-3"
            >
              {/* Top Order Id & Customer */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">{ord.id}</span>
                  <h3 className="text-sm font-bold text-[#111827]">{ord.customer}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ord.badgeColor}`}>
                  {ord.status}
                </span>
              </div>

              {/* Time ago & delivery */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                <Clock className="w-3.5 h-3.5 text-[#1b5e39]" />
                <span className="font-semibold text-[#111827]">{ord.timeAgo}</span>
                <span>•</span>
                <span>{ord.deliveryTime}</span>
              </div>

              {/* Items Breakdown */}
              <div className="py-2.5 border-y border-slate-100 space-y-1.5 text-xs">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[#374151]">
                    <span>
                      {item.qty ? `${item.qty} × ` : ''}
                      {item.name}
                    </span>
                    <span className="font-medium text-[#111827]">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Total</div>
                  <div className="text-sm font-extrabold text-[#111827]">₹{ord.total}</div>
                </div>

                {/* Dynamic Actions per Status */}
                {ord.status === 'New' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(ord.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(ord.id)}
                      className="px-4 py-2 rounded-xl bg-[#1b5e39] hover:bg-[#164d2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Accept order
                    </button>
                  </div>
                )}

                {ord.status === 'Preparing' && (
                  <button
                    onClick={() => handleMarkReady(ord.id)}
                    className="px-4 py-2 rounded-xl bg-[#1b5e39] hover:bg-[#164d2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Mark as ready
                  </button>
                )}

                {ord.status === 'Ready' && (
                  <button
                    onClick={() => handleDispatch(ord.id)}
                    className="px-4 py-2 rounded-xl bg-[#1b5e39] hover:bg-[#164d2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Mark as dispatched
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
