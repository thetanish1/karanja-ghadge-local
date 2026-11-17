import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { ArrowLeft, Store, Upload, CheckCircle2, Clock, MapPin, Mail, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ShopVerificationScreen } from './ShopVerificationScreen.js';

interface ShopkeeperApplyFlowProps {
  onBack: () => void;
  onEnterPortalDirectly: () => void;
}

export const ShopkeeperApplyFlow: React.FC<ShopkeeperApplyFlowProps> = ({
  onBack,
  onEnterPortalDirectly,
}) => {
  const { user, quickLoginAs } = useAuth();

  // Form State
  const [shopName, setShopName] = useState('Gupta Fresh Mart');
  const [ownerName, setOwnerName] = useState('Ramesh Gupta');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [email, setEmail] = useState('ramesh.gupta@karanjalocal.in');
  const [category, setCategory] = useState('Grocery & vegetables');
  const [address, setAddress] = useState('Shop No. 4, Main Bazaar Road, near Bus Stand, Karanja (Ghadge)');
  const [description, setDescription] = useState('Fresh local vegetables, daily dairy and kirana essentials delivered to your doorstep.');
  const [openTime, setOpenTime] = useState('07:30');
  const [closeTime, setCloseTime] = useState('21:30');
  const [photos, setPhotos] = useState<string[]>([
    '/images/fresh_basket.jpg',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  ]);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedShop, setSubmittedShop] = useState<any | null>(null);

  const categories = [
    'Grocery & Kirana',
    'Cloth & Fashion (Men, Women, Kids)',
    'Mobile & Accessories (Phones, Chargers)',
    'Electric (Wire, Bulb, Lighting, Switches)',
    'Electronic & Appliances (TV, AC, Fridge)',
    'Fireworks & Festive (Crackers, Sparklers)',
    'Dairy, Milk & Paneer',
    'Fresh Vegetables & Fruits',
    'Bakery & Fresh Snacks',
    'Hardware & Paints',
  ];

  const handlePhotoUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim() || !phone.trim() || !address.trim() || !email.trim()) {
      setError('Please fill in all mandatory shop information including email, phone, and address.');
      return;
    }

    try {
      setLoading(true);
      // Auto login/elevate to shopkeeper context if needed
      await quickLoginAs('shopkeeper');

      const res = await api.applyShop({
        name: shopName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
        category,
        openTime,
        closeTime,
        photos,
        fulfilmentOptions: ['delivery', 'pickup'],
        coordinates: [78.5484, 21.1714],
      });

      if (res.success && res.shop) {
        setSubmittedShop({
          ...res.shop,
          ownerName: ownerName.trim(),
          email: email.trim(),
          category,
          openTime,
          closeTime,
          photos,
        });
      } else {
        // Fallback preview
        setSubmittedShop({
          id: 'temp-shop-id',
          name: shopName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          status: 'pending',
          openTime,
          closeTime,
          category,
          photos,
        });
      }
    } catch (err: any) {
      console.warn('Submission fallback to local preview state:', err);
      setSubmittedShop({
        id: 'local-shop-preview',
        name: shopName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status: 'pending',
        openTime,
        closeTime,
        category,
        photos,
      });
    } finally {
      setLoading(false);
    }
  };

  // If application is submitted, render the dedicated "Your shop is now in verifying stage" screen
  if (submittedShop) {
    return (
      <ShopVerificationScreen
        shop={submittedShop}
        onBackToHome={onBack}
        onOpenDemoPortal={onEnterPortalDirectly}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center items-center p-0 sm:p-4 select-none font-sans">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[820px] bg-white rounded-none sm:rounded-[40px] shadow-xl flex flex-col justify-between border-0 sm:border border-slate-200/60 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Merchant Application
            </span>
            <span className="text-[10px] font-semibold text-[#1b5e39]">
              Karanja (Ghadge) Local
            </span>
          </div>

          <div className="w-10 flex justify-end">
            <div className="w-7 h-7 rounded-lg bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
              <Store className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          
          {/* Pilot Banner */}
          <div className="bg-gradient-to-r from-[#1b5e39] to-[#267c4d] text-white p-4 rounded-2xl shadow-sm space-y-1.5 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Free Pilot Program for Karanja Merchants</span>
            </div>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Register your local store with zero onboarding fees and 0% commission. Orders will reach directly from Karanja residents.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Section 1: Shop & Owner Identity */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Store & Contact Details
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gupta Fresh Mart"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-12 border border-[#e2e8f0] rounded-xl px-3.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39] bg-white shadow-xs"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Owner / Manager Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gupta"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-12 border border-[#e2e8f0] rounded-xl px-3.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39] bg-white shadow-xs"
                />
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#1b5e39]" />
                    <span>Mobile Number *</span>
                  </label>
                  <div className="flex items-center h-12 border border-[#e2e8f0] rounded-xl bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39]">
                    <span className="px-2.5 text-xs font-bold text-slate-700 border-r border-[#e2e8f0] bg-slate-50">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-2.5 text-sm text-[#111827] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#1b5e39]" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="shop@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 border border-[#e2e8f0] rounded-xl px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39] bg-white shadow-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * We will send your verification status and official confirmation to this email address.
              </p>
            </div>

            {/* Section 2: Category */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Business Category
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      category === cat
                        ? 'bg-[#1b5e39] text-white border-[#1b5e39] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Operating Timings */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1b5e39]" />
                <span>3. Daily Operating Hours</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Location in Karanja (Ghadge) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#1b5e39]" />
                <span>4. Karanja Ghadge Location</span>
              </div>
              <div>
                <textarea
                  rows={2}
                  required
                  placeholder="Street name, landmark, market area in Karanja (Ghadge)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b5e39] bg-white shadow-xs resize-none"
                />
              </div>
            </div>

            {/* Section 5: Storefront Photos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Upload className="w-3 h-3 text-[#1b5e39]" />
                <span>5. Storefront & Interior Photos</span>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                    <img src={src} alt={`Store photo ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1 rounded">
                      #{i + 1}
                    </span>
                  </div>
                ))}
                
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#1b5e39]/40 bg-[#e8f3ea]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8f3ea]/60 transition flex-shrink-0">
                  <Upload className="w-4 h-4 text-[#1b5e39] mb-1" />
                  <span className="text-[10px] font-bold text-[#1b5e39]">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUploadSimulation}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400">
                Upload clear photos of your storefront board and product shelves for fast admin approval.
              </p>
            </div>

            {/* Fulfilment Options */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#1b5e39]" />
                <span>Home Delivery + Counter Pickup</span>
              </div>
              <span className="text-[10px] font-bold text-[#1b5e39] uppercase bg-[#e8f3ea] px-2 py-0.5 rounded-full">
                Enabled
              </span>
            </div>

            {/* Big Prominent Submit Button */}
            <div className="pt-2 pb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Submitting Application...' : 'Submit Shop for Verification'}</span>
                <span className="text-lg">→</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
