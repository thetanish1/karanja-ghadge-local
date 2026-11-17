import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { StatusBadge } from '../../components/StatusBadge.js';
import { ShoppingBag, Truck, UserPlus, Download, RefreshCw, X, Check } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; orderId?: string }>({ isOpen: false });
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, partnersRes] = await Promise.all([
        api.getAdminOrders(),
        api.getDeliveryPartners(),
      ]);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (partnersRes.success && partnersRes.partners.length > 0) {
        setPartners(partnersRes.partners);
        setSelectedPartnerId(partnersRes.partners[0]._id);
      }
    } catch (e) {
      console.warn('Orders load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!assignModal.orderId || !selectedPartnerId) return;
    const partner = partners.find((p) => p._id === selectedPartnerId);

    try {
      setActionLoading(true);
      const res = await api.assignDeliveryPartner(assignModal.orderId, {
        partnerId: selectedPartnerId,
        handlerName: partner?.name || 'Assigned Rider',
        handlerPhone: partner?.phone,
      });

      if (res.success) {
        setAssignModal({ isOpen: false });
        await loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to assign delivery');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">All Platform Orders</h2>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/v1/admin/export/orders"
            download
            className="p-1.5 text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </a>
          <button onClick={loadData} className="p-1 text-slate-400 hover:text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          No orders placed yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">#{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Shop: <strong className="text-slate-800">{o.shopId?.name}</strong> • {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">{formatPaiseToRupees(o.totalPaise)}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{o.fulfilmentType}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div>Customer: <strong>{o.customerId?.name || 'Customer'}</strong> ({o.customerId?.phone})</div>
                  {o.deliveryPartnerName && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      Rider: {o.deliveryPartnerName}
                    </div>
                  )}
                </div>

                {/* Manual Delivery Assignment button for delivery orders */}
                {o.fulfilmentType === 'delivery' && !['delivered', 'completed', 'cancelled', 'shop_rejected'].includes(o.status) && (
                  <button
                    onClick={() => setAssignModal({ isOpen: true, orderId: o._id })}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{o.deliveryPartnerName ? 'Reassign' : 'Assign Rider'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Delivery Partner Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Assign Delivery Partner</h3>
              <button onClick={() => setAssignModal({ isOpen: false })} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select an approved local delivery partner to fulfill this order in Karanja:
            </p>

            <div className="space-y-2 mb-4">
              {partners.map((p) => (
                <label
                  key={p._id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition ${
                    selectedPartnerId === p._id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="partner"
                      checked={selectedPartnerId === p._id}
                      onChange={() => setSelectedPartnerId(p._id)}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">+91 {p.phone}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleAssignDelivery}
              disabled={actionLoading || !selectedPartnerId}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Delivery Assignment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
