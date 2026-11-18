import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowLeft, ArrowUpRight, FileText, Wallet, Download, ShoppingBag } from 'lucide-react';

interface ShopSalesPageProps {
  onBack: () => void;
}

export const ShopSalesPage: React.FC<ShopSalesPageProps> = ({ onBack }) => {
  const [range, setRange] = useState<'7d' | '30d' | '3m'>('30d');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const [queueRes, prodsRes] = await Promise.all([
        api.getShopQueue().catch(() => ({ success: false, orders: [] })),
        api.getProducts().catch(() => ({ success: false, products: [] })),
      ]);

      if (queueRes.success && queueRes.orders) {
        setOrders(queueRes.orders);
      }
      if (prodsRes.success && prodsRes.products) {
        setProducts(prodsRes.products);
      }
    } catch (e) {
      console.warn('Sales data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenuePaise = orders.reduce((sum, o) => sum + (o.totalPaise || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderPaise = totalOrdersCount > 0 ? Math.round(totalRevenuePaise / totalOrdersCount) : 0;

  // Compute item sales if order items are available
  const itemMap = new Map<string, { name: string; count: number; revenuePaise: number }>();
  orders.forEach((o) => {
    if (o.items) {
      o.items.forEach((it: any) => {
        const existing = itemMap.get(it.name) || { name: it.name, count: 0, revenuePaise: 0 };
        existing.count += it.qty || 1;
        existing.revenuePaise += it.subtotalPaise || 0;
        itemMap.set(it.name, existing);
      });
    }
  });

  const bestSellers = Array.from(itemMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleDownloadReport = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Customer', 'Items', 'Total (₹)', 'Status'],
      ...orders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        o.customerName || 'Customer',
        o.itemCount,
        Math.round((o.totalPaise || 0) / 100),
        o.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `karanja_sales_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 px-4 pt-4 pb-28 font-sans select-none min-h-screen bg-[#f8faf9]">
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

      {/* 3. Total Sales Card */}
      <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            RECORDED SALES VOLUME
          </div>
          <div className="text-[32px] font-extrabold text-[#111827] tracking-tight mt-0.5">
            {formatPaiseToRupees(totalRevenuePaise)}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#1b5e39] mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Karanja local merchant network</span>
          </div>
        </div>

        {/* Visual summary info */}
        <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-medium">
          Zero commissions deducted. Full payments collected via COD or direct customer transfer.
        </div>
      </div>

      {/* 4. Two Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-2.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">{totalOrdersCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total orders</div>
        </div>

        <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center mb-2.5">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">{formatPaiseToRupees(avgOrderPaise)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Avg. order value</div>
        </div>
      </div>

      {/* 5. Best Selling Products */}
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-2.5">Store Product Insights</h3>
        {bestSellers.length === 0 ? (
          <div className="bg-white rounded-[24px] p-6 text-center text-xs text-slate-400 border border-slate-200">
            {products.length > 0 ? (
              <div>
                <p className="font-bold text-slate-700 mb-1">{products.length} Products Listed</p>
                <p>Top seller analytics will populate once customer orders are completed.</p>
              </div>
            ) : (
              'No items sold yet.'
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {bestSellers.map((item, index) => (
              <div key={item.name} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4 text-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.count} units sold</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#111827]">
                  {formatPaiseToRupees(item.revenuePaise)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Download Monthly Report Button */}
      <div className="pt-2">
        <button
          onClick={handleDownloadReport}
          className="w-full h-12 rounded-[18px] border border-[#1b5e39] text-[#1b5e39] hover:bg-[#e8f3ea]/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download Sales CSV Report</span>
        </button>
      </div>
    </div>
  );
};
