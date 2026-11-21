import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { formatPaiseToRupees } from '@karanjaghadge/shared';
import { getCurrentGpsPosition, reverseGeocodeCoords } from '../../services/location.js';
import {
  ArrowLeft,
  Truck,
  Store,
  MapPin,
  CheckCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Smartphone,
  Navigation,
  Lock,
} from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string, orderData?: { orderNumber?: string; totalPaise?: number; shopName?: string }) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();

  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [line, setLine] = useState((user as any)?.address || 'Flat 302, Green Enclave, Civil Lines');
  const [landmark, setLandmark] = useState('Near Town Hall & Hanuman Temple');
  const [pincode, setPincode] = useState('442203');
  const [locating, setLocating] = useState(false);

  // Payment method: upi | cod | pay_direct_to_shop
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'pay_direct_to_shop'>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 text-center font-sans select-none">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Store className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-800">Your cart is empty.</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">Please add items to cart before proceeding to payment.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-[#1b5e39] text-white rounded-full text-xs font-bold shadow-sm"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  const handleGpsAutofill = async () => {
    try {
      setLocating(true);
      setError('');
      const coords = await getCurrentGpsPosition();
      const addr = await reverseGeocodeCoords(coords.lat, coords.lng);
      if (addr.formattedAddress) {
        setLine(addr.formattedAddress);
      }
      if (addr.area) {
        setLandmark(addr.area);
      }
      if (addr.pincode) {
        setPincode(addr.pincode);
      }
    } catch (e: any) {
      setError(e.message || 'Could not fetch GPS location. Please type your address.');
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fulfilmentType === 'delivery' && (!line || line.trim().length < 5)) {
      setError('Please provide a complete delivery address in Karanja (Ghadge).');
      return;
    }

    try {
      setLoading(true);
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
                coordinates: [78.5484, 21.1714],
              }
            : undefined,
        notes: notes ? `${notes} (Paid via ${paymentMethod.toUpperCase()})` : `Paid via ${paymentMethod.toUpperCase()}`,
        idempotencyKey,
      });

      if (res.success && res.order) {
        const orderData = {
          orderNumber: res.order.orderNumber || res.order.id?.slice(-5) || '89241',
          totalPaise: cart.totalPaise,
          shopName: cart.shopName || 'Shree Ganesh Kirana',
        };
        await refreshCart();
        onOrderSuccess(res.order.id, orderData);
      }
    } catch (err: any) {
      setError(err.message || 'Payment or order placement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans select-none pb-28">
      {/* ── TOP HEADER ── */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-extrabold text-[#111827]">Payment &amp; Checkout</h1>
          <p className="text-[10px] text-slate-400 font-medium">AapnaCart Zero-Fee Payment</p>
        </div>
        <div className="w-10 flex items-center justify-center text-[#1b5e39]">
          <Lock className="w-4 h-4 text-[#1b5e39]" />
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="p-4 space-y-4 max-w-md mx-auto">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Fulfilment: Delivery vs Pickup */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <label className="block text-xs font-extrabold text-[#111827] uppercase tracking-wider">
            Fulfilment Type
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFulfilmentType('delivery')}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
                fulfilmentType === 'delivery'
                  ? 'border-[#1b5e39] bg-[#e8f3ea] text-[#1b5e39] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-5 h-5 text-[#1b5e39]" />
              <span>Doorstep Delivery</span>
              <span className="text-[10px] font-bold text-[#1b5e39]">FREE Pilot</span>
            </button>

            <button
              type="button"
              onClick={() => setFulfilmentType('pickup')}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
                fulfilmentType === 'pickup'
                  ? 'border-[#1b5e39] bg-[#e8f3ea] text-[#1b5e39] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Store className="w-5 h-5 text-[#1b5e39]" />
              <span>Self Pickup</span>
              <span className="text-[10px] font-normal text-slate-400">Collect at store</span>
            </button>
          </div>
        </div>

        {/* 2. Delivery Address (if Delivery selected) */}
        {fulfilmentType === 'delivery' && (
          <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1b5e39]" />
                <h4 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                  Karanja Delivery Address
                </h4>
              </div>
              <button
                type="button"
                onClick={handleGpsAutofill}
                disabled={locating}
                className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#d6ecda] transition cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>{locating ? 'Locating...' : 'Use GPS'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">House / Flat / Street Line</label>
              <input
                type="text"
                placeholder="e.g. Flat 302, Green Enclave, Civil Lines"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b5e39] focus:bg-white transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Town Hall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b5e39] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b5e39] focus:bg-white transition"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PAYMENT OPTIONS (UPI / COD / Counter) */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-[#111827] uppercase tracking-wider">
              Choose Payment Method
            </label>
            <span className="text-[10px] font-bold text-[#1b5e39] bg-[#e8f3ea] px-2 py-0.5 rounded-full">
              100% Secure
            </span>
          </div>

          <div className="space-y-2.5">
            {/* OPTION 1: UPI (Recommended) */}
            <div
              onClick={() => setPaymentMethod('upi')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'upi'
                  ? 'border-[#1b5e39] bg-[#f0fdf4]'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center font-black">
                    <Smartphone className="w-5 h-5 text-[#1b5e39]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#111827]">UPI Instant Payment</span>
                      <span className="text-[9px] font-extrabold bg-[#f97316] text-white px-1.5 py-0.2 rounded-full">
                        FASTEST
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Google Pay • PhonePe • Paytm • Any UPI</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'upi' ? 'border-[#1b5e39] bg-[#1b5e39]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* UPI Sub-options when selected */}
              {paymentMethod === 'upi' && (
                <div className="mt-3 pt-3 border-t border-[#cde5d2] space-y-2.5">
                  <div className="flex gap-2">
                    {[
                      { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                      { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', label: 'Paytm', icon: '🔵' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp(app.id as any);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                          selectedUpiApp === app.id
                            ? 'bg-[#1b5e39] text-white border-[#1b5e39]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{app.icon}</span>
                        <span>{app.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. mobile@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: Cash on Delivery (COD) */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'cod'
                  ? 'border-[#1b5e39] bg-[#f0fdf4]'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#111827]">Cash on Delivery (COD)</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash to the rider at your door</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'cod' ? 'border-[#1b5e39] bg-[#1b5e39]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* OPTION 3: Pay Directly to Shop */}
            <div
              onClick={() => setPaymentMethod('pay_direct_to_shop')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'pay_direct_to_shop'
                  ? 'border-[#1b5e39] bg-[#f0fdf4]'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#111827]">Pay Directly to Shop</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay at store counter via Shop UPI QR or cash</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'pay_direct_to_shop' ? 'border-[#1b5e39] bg-[#1b5e39]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'pay_direct_to_shop' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Special Notes */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-extrabold text-[#111827] uppercase tracking-wider mb-1.5">
            Delivery Instructions (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Ring bell 302, leave at door if guard not present..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b5e39] focus:bg-white transition"
          />
        </div>

        {/* 5. Order Total & Pay Button */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Items Total ({cart.itemCount} items)</span>
            <span className="font-bold text-[#111827]">{formatPaiseToRupees(cart.itemsTotalPaise)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Delivery &amp; Packaging Fee</span>
            <span className="font-extrabold text-[#1b5e39]">FREE (Pilot)</span>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Grand Total</div>
              <div className="text-xl font-black text-[#111827]">{formatPaiseToRupees(cart.totalPaise)}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#1b5e39] font-bold bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                Zero Convenience Fee
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1b5e39] hover:bg-[#155a34] active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Processing Payment &amp; Placing Order...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>
                  {paymentMethod === 'upi' ? 'Pay & Place Order' : 'Confirm Order'} ({formatPaiseToRupees(cart.totalPaise)})
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
