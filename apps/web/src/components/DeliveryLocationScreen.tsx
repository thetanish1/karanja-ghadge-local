import React, { useState } from 'react';
import { ArrowLeft, MapPin, Search, ChevronRight, Store } from 'lucide-react';

interface DeliveryLocationScreenProps {
  onBack: () => void;
  onConfirm: (location: string) => void;
  currentAddress?: string;
}

export const DeliveryLocationScreen: React.FC<DeliveryLocationScreenProps> = ({
  onBack,
  onConfirm,
  currentAddress = 'Sector 14, Hiran Magri, Udaipur',
}) => {
  const [selectedLocation, setSelectedLocation] = useState(currentAddress);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (loc: string) => {
    setSelectedLocation(loc);
  };

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center items-center p-0 sm:p-4 select-none font-sans">
      <div className="w-full max-w-[390px] min-h-screen sm:min-h-[780px] bg-white rounded-none sm:rounded-[44px] shadow-xl flex flex-col justify-between relative border-0 sm:border border-slate-200/60 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between relative z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-[#111827]">Delivery location</h1>
          <div className="w-10" />
        </div>

        {/* 
          TOP HALF: STYLIZED VECTOR MAP
          Light sage terrain with white roads, store pins, and "You are here" marker
        */}
        <div className="relative flex-1 bg-[#e4f0e6] min-h-[300px] overflow-hidden flex items-center justify-center">
          
          {/* Vector Map Roads / Geometries */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
            {/* Green terrain polygons */}
            <polygon points="0,0 220,0 180,180 0,120" fill="#d8ebdc" />
            <polygon points="260,0 400,0 400,240 280,180" fill="#d1e6d6" />
            <polygon points="0,220 200,200 160,400 0,400" fill="#d6ead9" />
            <polygon points="240,240 400,210 400,400 200,400" fill="#cfe5d4" />

            {/* White roads grid */}
            <path d="M-20,130 L420,220" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
            <path d="M120,-20 L280,420" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
            <path d="M220,-20 L40,420" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
            <path d="M-20,300 L420,120" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
          </svg>

          {/* Shop Pin 1 (Top Left) */}
          <div className="absolute top-16 left-12 bg-white rounded-xl p-2 shadow-md border border-slate-200/80 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#1b5e39]" />
          </div>

          {/* Shop Pin 2 (Right) */}
          <div className="absolute top-28 right-12 bg-white rounded-xl p-2 shadow-md border border-slate-200/80 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#1b5e39]" />
          </div>

          {/* User Location Pin with "You are here" Tooltip */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Green Teardrop Pin */}
            <div className="w-12 h-12 rounded-full bg-[#1b5e39] flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            {/* White Tooltip: You are here */}
            <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-[#111827] border border-slate-100 flex items-center gap-1">
              <span>You are here</span>
            </div>
          </div>

        </div>

        {/* 
          BOTTOM SHEET: WHERE SHOULD WE DELIVER?
        */}
        <div className="bg-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] p-6 pt-3 relative z-20 space-y-4">
          
          {/* Drag Handle Bar */}
          <div className="flex justify-center pb-2">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1b5e39] mb-1">
              SET DELIVERY LOCATION
            </div>
            <h2 className="text-[22px] font-extrabold text-[#111827] tracking-tight leading-tight">
              Where should we deliver?
            </h2>
            <p className="text-xs text-[#6b7280] mt-1">
              We'll show shops and products available near you.
            </p>
          </div>

          {/* Use Current Location Card */}
          <button
            onClick={() => handleSelect(currentAddress)}
            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
              selectedLocation === currentAddress
                ? 'border-[#1b5e39] bg-[#e8f3ea]/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#1b5e39]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#111827]">Use current location</div>
                <div className="text-xs text-[#6b7280] truncate max-w-[210px] mt-0.5">
                  {currentAddress}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          {/* "- or -" divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Search Area / Landmark Input */}
          <div className="flex items-center h-14 border border-[#e2e8f0] rounded-2xl px-4 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39] focus-within:border-[#1b5e39] transition">
            <Search className="w-4 h-4 text-[#9ca3af] mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search area, street or landmark"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => onConfirm(searchQuery.trim() || selectedLocation)}
            className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center cursor-pointer mt-2"
          >
            Confirm this location
          </button>

        </div>

      </div>
    </div>
  );
};
