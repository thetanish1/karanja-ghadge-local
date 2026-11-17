import React from 'react';
import { useCart } from '../context/CartContext.js';
import { AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

export const MultiShopModal: React.FC = () => {
  const { conflictModal, resolveConflict } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-center text-slate-900 mb-1">
          Single-Shop Order Policy
        </h3>

        <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
          {conflictModal.error}
        </p>

        <div className="space-y-2">
          <button
            onClick={() => resolveConflict(true)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Current Cart & Add New Item</span>
          </button>

          <button
            onClick={() => resolveConflict(false)}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Keep Existing Cart
          </button>
        </div>
      </div>
    </div>
  );
};
