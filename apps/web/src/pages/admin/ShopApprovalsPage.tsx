import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Store, CheckCircle, XCircle, Phone, MapPin, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ShopApprovalsPageProps {
  onBack?: () => void;
}

export const ShopApprovalsPage: React.FC<ShopApprovalsPageProps> = ({ onBack }) => {
  const [shops, setShops] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadShops();
  }, [filter]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminShops(filter || undefined);
      if (res.success) {
        setShops(res.shops);
      }
    } catch (e) {
      console.warn('Could not load shops:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shopId: string, status: string) => {
    try {
      setActionLoading(true);
      const res = await api.updateShopStatus(shopId, status);
      if (res.success) {
        await loadShops();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update shop status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Store className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shop Verifications</h2>
        </div>
        <button onClick={loadShops} className="p-1 text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'suspended'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f || 'All Shops'}
          </button>
        ))}
      </div>

      {/* Shop List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      ) : shops.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          No shops found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.ownerName && (
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      Owner: {s.ownerName}
                    </p>
                  )}
                  {s.email && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✉ {s.email}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">{s.description || 'Local business in Karanja (Ghadge)'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">📍 {s.address}</p>
                  {s.hours && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      🕒 Hours: {s.hours.open || '08:00'} - {s.hours.close || '21:00'}
                    </p>
                  )}
                </div>
              </div>

              {/* Photos preview if present */}
              {s.photos && s.photos.length > 0 && (
                <div className="pt-1 flex gap-2 overflow-x-auto pb-1">
                  {s.photos.map((photo: string, pIdx: number) => (
                    <img
                      key={pIdx}
                      src={photo}
                      alt={`Store photo ${pIdx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-600 pt-1 flex items-center justify-between border-t border-slate-100">
                <span>Phone: +91 {s.phone}</span>
                <span className="font-semibold text-emerald-700">
                  {s.fulfilmentOptions?.join(', ')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {s.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(s._id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve Shop
                  </button>
                )}

                {s.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(s._id, 'suspended')}
                    disabled={actionLoading}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Suspend Shop
                  </button>
                )}

                {s.status === 'suspended' && (
                  <button
                    onClick={() => handleUpdateStatus(s._id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Re-activate Shop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
