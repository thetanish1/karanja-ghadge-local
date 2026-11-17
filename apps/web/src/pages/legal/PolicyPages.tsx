import React from 'react';
import { ArrowLeft, Shield, FileText, RefreshCw, Truck, Phone, Mail, MapPin } from 'lucide-react';

interface PolicyPagesProps {
  page: string;
  onBack: () => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({ page, onBack }) => {
  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Legal & Policies
        </span>
        <div className="w-6" />
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs leading-relaxed text-slate-700">
        {page === 'privacy' && (
          <>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Shield className="w-5 h-5" />
              <h3>Privacy Policy</h3>
            </div>
            <p>
              <strong>Karanjaghadge Local ("we", "our")</strong> is committed to protecting your personal information.
              This policy explains what data we collect and how we safeguard it during our local commerce pilot.
            </p>
            <h4 className="font-bold text-slate-900">1. Data We Collect</h4>
            <p>
              We collect your mobile phone number for OTP authentication, your name (optional), and your delivery address
              (with landmark and pincode) solely for order fulfillment.
            </p>
            <h4 className="font-bold text-slate-900">2. Customer Privacy & Shop Isolation</h4>
            <p>
              Your address is visible strictly to the single shop fulfillment handler and assigned delivery rider for that
              specific active order. We never sell, rent, or disclose personal customer data to unrelated third parties.
            </p>
            <h4 className="font-bold text-slate-900">3. Data Retention</h4>
            <p>Order records and audit events are stored securely on our managed database.</p>
          </>
        )}

        {page === 'terms' && (
          <>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <FileText className="w-5 h-5" />
              <h3>Terms of Service</h3>
            </div>
            <p>
              Welcome to Karanjaghadge Local. By accessing or using our PWA and native mobile application, you agree to these
              pilot community terms.
            </p>
            <h4 className="font-bold text-slate-900">1. Platform Nature</h4>
            <p>
              Karanjaghadge Local operates as an intermediary marketplace connecting local residents with independent local
              merchants in Karanja (Ghadge) and adjacent areas.
            </p>
            <h4 className="font-bold text-slate-900">2. Single-Shop Cart Constraint</h4>
            <p>
              In our pilot MVP, each order is placed with a single merchant. You may place separate orders with different
              merchants successively.
            </p>
            <h4 className="font-bold text-slate-900">3. Free Pilot Principle</h4>
            <p>
              All marketplace commissions and customer platform fees are ₹0 by default during the community pilot.
            </p>
          </>
        )}

        {page === 'cancellation' && (
          <>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <RefreshCw className="w-5 h-5" />
              <h3>Cancellation & Refund Policy</h3>
            </div>
            <h4 className="font-bold text-slate-900">1. Customer Order Cancellation</h4>
            <p>
              Customers may request cancellation directly in the app <strong>before</strong> the merchant begins preparing
              the order (i.e. while in `placed` or `shop_accepted` status). Once the merchant begins food preparation or packing,
              cancellation cannot be processed.
            </p>
            <h4 className="font-bold text-slate-900">2. Merchant Rejection</h4>
            <p>
              If an item is unexpectedly out of stock, the merchant may reject the order with a transparent explanation.
            </p>
            <h4 className="font-bold text-slate-900">3. Refunds</h4>
            <p>
              In the pilot MVP, payments are Cash on Delivery (COD) or Direct Pay to Shop. In case of issues, cash is
              settled directly or refunded by the merchant.
            </p>
          </>
        )}

        {page === 'delivery' && (
          <>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Truck className="w-5 h-5" />
              <h3>Delivery Terms & Pilot Coverage</h3>
            </div>
            <h4 className="font-bold text-slate-900">1. Service Area</h4>
            <p>
              Our pilot delivery zone covers Karanja (Ghadge) town and immediate surroundings within a 7 km radius.
            </p>
            <h4 className="font-bold text-slate-900">2. Delivery Timeframes</h4>
            <p>
              Deliveries are coordinated manually during the pilot. Average delivery duration is 30–60 minutes depending on
              merchant preparation and rider availability.
            </p>
            <h4 className="font-bold text-slate-900">3. Proof of Handover</h4>
            <p>
              A 4-digit Delivery Verification OTP is provided on your tracking screen. Please disclose this OTP only upon
              physically receiving the items.
            </p>
          </>
        )}

        {page === 'contact' && (
          <>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Phone className="w-5 h-5" />
              <h3>Support & Community Contact</h3>
            </div>
            <p>We are a community-first initiative run directly in Karanja (Ghadge), Maharashtra.</p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Helpline: +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email: support@karanjaghadge.local</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Main Bazaar Road, Karanja (Ghadge), Wardha District, Maharashtra - 442203</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
