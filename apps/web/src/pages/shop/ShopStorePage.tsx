import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Store, Clock, Phone, MapPin, Power, Save, AlertCircle } from 'lucide-react';

export const ShopStorePage: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [currentShop, setCurrentShop] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      setLoading(true);
      const res = await api.getMyShops();
      if (res.success && res.shops.length > 0) {
        setShops(res.shops);
        const s = res.shops[0];
        setCurrentShop(s);
        setIsPaused(s.isPaused);
        setOpenTime(s.hours?.open || '08:00');
        setCloseTime(s.hours?.close || '21:00');
      }
    } catch (e) {
      console.warn('Could not load shop settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    if (!currentShop) return;
    const nextPaused = !isPaused;
    try {
      const res = await api.updateShopAvailability(currentShop.id, { isPaused: nextPaused });
      if (res.success) {
        setIsPaused(res.isPaused);
        setMessage(`Shop orders are now ${res.isPaused ? 'PAUSED' : 'ACTIVE'}.`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update pause state');
    }
  };

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop) return;
    try {
      setSaving(true);
      const res = await api.updateShopAvailability(currentShop.id, {
        hours: { open: openTime, close: closeTime },
      });
      if (res.success) {
        setMessage('Shop hours updated successfully.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to save hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 animate-pulse h-40 bg-slate-200 rounded-2xl max-w-md mx-auto" />;
  }

  if (!currentShop) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs max-w-sm mx-auto">
        No shop registered under your account yet.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Store Controls</h2>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {/* Quick Pause Orders Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Accepting Orders Status</h3>
          <p className="text-[11px] text-slate-500">
            {isPaused ? 'Orders temporarily paused by shopkeeper' : 'Shop is actively receiving orders'}
          </p>
        </div>

        <button
          onClick={handleTogglePause}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            isPaused
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-600 text-white shadow-sm'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isPaused ? 'Resume Orders' : 'Pause Orders'}</span>
        </button>
      </div>

      {/* Operating Hours Form */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Operating Business Hours</span>
        </h3>

        <form onSubmit={handleSaveHours} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opens At</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closes At</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Update Hours'}</span>
          </button>
        </form>
      </div>

      {/* Shop Info Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Information</h3>
        <div>
          <span className="font-bold text-slate-900">{currentShop.name}</span>
          <p className="text-slate-500">{currentShop.description}</p>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 pt-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentShop.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>+91 {currentShop.phone}</span>
        </div>
      </div>
    </div>
  );
};
