import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { ArrowLeft, Truck, Store, MapPin, CheckCircle, CreditCard, Banknote, ShieldCheck, AlertCircle } from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();

  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [line, setLine] = useState('House 42, Ward 3, Shivaji Chowk');
  const [landmark, setLandmark] = useState('Near Hanuman Temple');
  const [pincode, setPincode] = useState('442203');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pay_direct_to_shop'>('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto">
        <p className="text-sm font-semibold text-slate-700">No items to checkout.</p>
        <button onClick={onBack} className="mt-3 text-xs text-emerald-600 font-bold underline">
          Return to Cart
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fulfilmentType === 'delivery' && (!line || line.trim().length < 5)) {
      setError('Please provide a complete delivery address in Karanjaghadge.');
      return;
    }

    try {
      setLoading(true);
      // Generate unique idempotency key
      const idempotencyKey = `kgl-checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await api.createOrder({
        fulfilmentType,
        paymentMethod,
        deliveryAddress:
          fulfilmentType === 'delivery'
            ? {
                line,
                landmark,
                pincode,
                coordinates: [78.5484, 21.1714], // Karanja center
              }
            : undefined,
        notes,
        idempotencyKey,
      });

      if (res.success && res.order) {
        await refreshCart();
        onOrderSuccess(res.order.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Cart</span>
        </button>
        <span className="text-xs font-bold text-slate-800">Checkout</span>
        <div className="w-6" />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fulfilment Toggle: Delivery vs Pickup */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          How would you like to receive your order?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFulfilmentType('delivery')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
              fulfilmentType === 'delivery'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Home Delivery</span>
            <span className="text-[10px] font-normal text-emerald-700">Free in Pilot</span>
          </button>

          <button
            type="button"
            onClick={() => setFulfilmentType('pickup')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
              fulfilmentType === 'pickup'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Self Pickup</span>
            <span className="text-[10px] font-normal text-slate-400">Collect at counter</span>
          </button>
        </div>
      </div>

      {/* Delivery Address Form if Delivery chosen */}
      {fulfilmentType === 'delivery' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Karanjaghadge Delivery Address
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">House / Flat / Street Line</label>
            <input
              type="text"
              placeholder="e.g. Ward No. 3, Shivaji Chowk"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Near Hanuman Temple"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Options (COD & Pay Direct) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Payment Method
        </label>
        <div className="space-y-2">
          <label
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
              paymentMethod === 'cod'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="text-[11px] text-slate-500">Pay cash directly when order reaches you</div>
              </div>
            </div>
          </label>

          <label
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
              paymentMethod === 'pay_direct_to_shop'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'pay_direct_to_shop'}
                onChange={() => setPaymentMethod('pay_direct_to_shop')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Pay Directly to Shop (Counter / Shop QR)</span>
                </div>
                <div className="text-[11px] text-slate-500">Pay directly to the shopkeeper via UPI QR or cash</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Instructions / Notes */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Special Notes for Shopkeeper (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Please bring fresh coriander or call before leaving..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        />
      </div>

      {/* Order Total & Confirm Button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Items Total ({cart.itemCount} items)</span>
          <span className="font-bold text-slate-900">{formatPaiseToRupees(cart.itemsTotalPaise)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Delivery & Platform Fee</span>
          <span className="font-bold text-emerald-700">₹0 (Free Pilot)</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-extrabold text-sm text-slate-900">
          <span>Grand Total</span>
          <span className="text-base text-emerald-700">{formatPaiseToRupees(cart.totalPaise)}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition"
        >
          <span>{loading ? 'Submitting Order...' : `Confirm & Place Order (${formatPaiseToRupees(cart.totalPaise)})`}</span>
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
