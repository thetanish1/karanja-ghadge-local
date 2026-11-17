import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { ArrowLeft, Store, CheckCircle, AlertCircle } from 'lucide-react';

interface ShopApplyPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ShopApplyPage: React.FC<ShopApplyPageProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('Main Bazaar Road, Karanja (Ghadge)');
  const [description, setDescription] = useState('');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill out all required shop details.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.applyShop({
        name,
        phone,
        address,
        description,
        openTime,
        closeTime,
        fulfilmentOptions: ['delivery', 'pickup'],
        coordinates: [78.5484, 21.1714],
      });

      if (res.success) {
        alert('Shop application submitted successfully! It is now pending admin verification.');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Merchant Application
        </span>
        <div className="w-6" />
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">List Your Shop</h2>
            <p className="text-[11px] text-slate-500">Free Pilot Listing – Zero Commission</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name</label>
            <input
              type="text"
              placeholder="e.g. Balaji Provision Stores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Contact Phone</label>
            <input
              type="tel"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Shop Address</label>
            <textarea
              rows={2}
              placeholder="Shop No., Street, Landmark, Karanja (Ghadge)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description / Speciality</label>
            <input
              type="text"
              placeholder="e.g. Fresh dairy items, cold drinks, packaged spices"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opens At</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closes At</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Submitting Application...' : 'Submit Shop Application'}</span>
            <CheckCircle className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
