import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees, parseRupeesToPaise } from '@karanjaghadge/shared';
import { Settings, Shield, History, Save, AlertTriangle, RefreshCw } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [deliveryFeeRupees, setDeliveryFeeRupees] = useState('0');
  const [platformFeeRupees, setPlatformFeeRupees] = useState('0');
  const [commissionPercent, setCommissionPercent] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [setsRes, logsRes] = await Promise.all([
        api.getSettings(),
        api.getAuditLogs(),
      ]);
      if (setsRes.success) {
        setSettings(setsRes.settings);
        setDeliveryFeeRupees(((setsRes.settings.DELIVERY_FEE_PAISE || 0) / 100).toString());
        setPlatformFeeRupees(((setsRes.settings.PLATFORM_FEE_PAISE || 0) / 100).toString());
        setCommissionPercent((setsRes.settings.COMMISSION_PERCENT || 0).toString());
      }
      if (logsRes.success) {
        setLogs(logsRes.logs);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const dPaise = parseRupeesToPaise(deliveryFeeRupees);
      const pPaise = parseRupeesToPaise(platformFeeRupees);
      const comm = parseFloat(commissionPercent) || 0;

      await Promise.all([
        api.updateSetting('DELIVERY_FEE_PAISE', dPaise, 'Customer delivery fee in paise'),
        api.updateSetting('PLATFORM_FEE_PAISE', pPaise, 'Platform convenience fee in paise'),
        api.updateSetting('COMMISSION_PERCENT', comm, 'Shopkeeper sales commission percentage'),
      ]);

      setMessage('Platform settings updated successfully.');
      setTimeout(() => setMessage(''), 3000);
      await loadSettings();
    } catch (e: any) {
      alert(e.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fee Controls & Audit Log</h2>
        </div>
        <button onClick={loadSettings} className="p-1 text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {/* Warning Alert about Pilot zero-fee constraint */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Pilot Phase Commitment: All Fees Default to 0</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          As agreed in the build plan, the pilot must operate with zero commission and ₹0 platform fee until 20-30 real orders are fulfilled.
        </p>
      </div>

      {/* Fee Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Monetization Settings</h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Delivery Fee (₹)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={deliveryFeeRupees}
            onChange={(e) => setDeliveryFeeRupees(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-[10px] text-slate-400">Currently ₹0 in pilot</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Platform Fee (₹)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={platformFeeRupees}
            onChange={(e) => setPlatformFeeRupees(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-[10px] text-slate-400">Currently ₹0 in pilot</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Shopkeeper Commission (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-[10px] text-slate-400">Currently 0% in pilot</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Updating...' : 'Save Settings'}</span>
        </button>
      </form>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-500" />
          <span>Recent Sensitive Audit Trail ({logs.length})</span>
        </h3>

        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {logs.map((log) => (
            <div key={log._id} className="py-2 text-[11px] space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{log.action}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-slate-500">
                Target: <strong>{log.target}</strong> ({log.targetId || 'global'}) by {log.actorRole || 'admin'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
