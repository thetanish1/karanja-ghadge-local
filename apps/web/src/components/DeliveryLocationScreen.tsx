import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Search,
  ChevronRight,
  Store,
  Navigation,
  Crosshair,
  Key,
  CheckCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getCurrentGpsPosition, reverseGeocodeCoords, GeoLocationResult } from '../services/location.js';

interface DeliveryLocationScreenProps {
  onBack: () => void;
  onConfirm: (location: string) => void;
  currentAddress?: string;
}

export const DeliveryLocationScreen: React.FC<DeliveryLocationScreenProps> = ({
  onBack,
  onConfirm,
  currentAddress = 'Main Market, Civil Lines, Karanja (Ghadge)',
}) => {
  const [selectedLocation, setSelectedLocation] = useState(currentAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [gpsData, setGpsData] = useState<GeoLocationResult | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [googleKeyInput, setGoogleKeyInput] = useState(
    () => localStorage.getItem('kgl_google_maps_api_key') || ''
  );

  const handleUseGpsLocation = async () => {
    try {
      setLocating(true);
      const coords = await getCurrentGpsPosition();
      const geo = await reverseGeocodeCoords(coords.lat, coords.lng);
      setGpsData(geo);
      setSelectedLocation(geo.formattedAddress);
      setSearchQuery(geo.formattedAddress);
    } catch (e) {
      console.warn('GPS location error:', e);
      setSelectedLocation('Main Market, Civil Lines, Karanja (Ghadge)');
    } finally {
      setLocating(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('kgl_google_maps_api_key', googleKeyInput.trim());
    setShowApiKeyModal(false);
    if (googleKeyInput.trim()) {
      handleUseGpsLocation();
    }
  };

  const karanjaLandmarks = [
    'Civil Lines • Ward 4',
    'Shivaji Chowk • Ward 3',
    'Main Bazaar Market',
    'Station Road Crossing',
    'Near Old Bus Stand',
  ];

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center items-center p-0 sm:p-4 select-none font-sans">
      <div className="w-full max-w-[400px] min-h-screen sm:min-h-[800px] bg-white rounded-none sm:rounded-[44px] shadow-xl flex flex-col justify-between relative border-0 sm:border border-slate-200/60 overflow-hidden">
        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between relative z-20 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-extrabold text-[#111827]">Delivery Location</h1>
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#1b5e39] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Maps & GPS Active</span>
            </div>
          </div>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Configure Google Location API Key"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>

        {/* 
          TOP HALF: REALTIME SATELLITE / TERRAIN VECTOR RADAR MAP
        */}
        <div className="relative flex-1 bg-[#e4f0e6] min-h-[280px] overflow-hidden flex items-center justify-center">
          {/* Vector Map Roads / Geometries */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
            <polygon points="0,0 220,0 180,180 0,120" fill="#d8ebdc" />
            <polygon points="260,0 400,0 400,240 280,180" fill="#d1e6d6" />
            <polygon points="0,220 200,200 160,400 0,400" fill="#d6ead9" />
            <polygon points="240,240 400,210 400,400 200,400" fill="#cfe5d4" />
            <path d="M-20,130 L420,220" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
            <path d="M120,-20 L280,420" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
            <path d="M220,-20 L40,420" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
            <path d="M-20,300 L420,120" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
          </svg>

          {/* Shop Pin 1 */}
          <div className="absolute top-12 left-10 bg-white rounded-xl p-2 shadow-md border border-slate-200/80 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#1b5e39]" />
          </div>

          {/* Shop Pin 2 */}
          <div className="absolute top-24 right-10 bg-white rounded-xl p-2 shadow-md border border-slate-200/80 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#1b5e39]" />
          </div>

          {/* User Location Radar Marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#1b5e39] flex items-center justify-center shadow-2xl border-4 border-white">
                <Navigation className="w-6 h-6 text-white transform -rotate-45" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-[#1b5e39]/40 animate-ping pointer-events-none" />
            </div>

            <div className="mt-2 bg-white px-3 py-1.5 rounded-full shadow-md text-xs font-black text-[#111827] border border-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{gpsData ? `GPS: ${gpsData.latitude.toFixed(4)}, ${gpsData.longitude.toFixed(4)}` : 'You are here'}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SHEET: WHERE SHOULD WE DELIVER */}
        <div className="bg-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] p-6 pt-3 relative z-20 space-y-4">
          <div className="flex justify-center pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1b5e39] mb-0.5">
              HYPERLOCAL FULFILLMENT
            </div>
            <h2 className="text-xl font-black text-[#111827] tracking-tight">
              Where should we deliver?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time GPS detects local Karanja stores available at your doorstep.
            </p>
          </div>

          {/* 1. REAL-TIME GOOGLE LOCATION & GPS BUTTON */}
          <button
            onClick={handleUseGpsLocation}
            disabled={locating}
            className="w-full p-3.5 rounded-2xl border-2 border-[#1b5e39] bg-[#e8f3ea]/60 hover:bg-[#e8f3ea] text-left flex items-center justify-between transition cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1b5e39] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                {locating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5">
                  <span>{locating ? 'Acquiring GPS via Google Location API...' : 'Use current GPS location'}</span>
                  {gpsData?.provider && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      {gpsData.provider.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 truncate max-w-[220px] font-medium mt-0.5">
                  {selectedLocation}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Quick Town Landmark Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Popular Local Areas</div>
            <div className="flex flex-wrap gap-1.5">
              {karanjaLandmarks.map((lm) => (
                <button
                  key={lm}
                  type="button"
                  onClick={() => {
                    const full = `${lm}, Karanja (Ghadge), 442203`;
                    setSelectedLocation(full);
                    setSearchQuery(full);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition"
                >
                  {lm}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Search Input */}
          <div className="flex items-center h-12 border border-[#e2e8f0] rounded-2xl px-3.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39] focus-within:border-[#1b5e39] transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search ward, street or house number"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLocation(e.target.value);
              }}
              className="flex-1 text-xs text-[#111827] placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => onConfirm(searchQuery.trim() || selectedLocation)}
            className="w-full h-12 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center cursor-pointer mt-1"
          >
            Confirm delivery address
          </button>
        </div>

        {/* GOOGLE MAPS API KEY CONFIGURATION MODAL */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] p-5 w-full max-w-sm space-y-3.5 shadow-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Location API Setup</h3>
                  <p className="text-[11px] text-slate-500">Enable live Google Geocoding & Places</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-snug">
                Enter your Google Maps JavaScript / Geocoding API Key. Browser GPS and OpenStreetMap fallbacks work automatically if left empty.
              </p>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Google API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={googleKeyInput}
                  onChange={(e) => setGoogleKeyInput(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#1b5e39] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex-1 py-2 rounded-xl bg-[#1b5e39] text-white font-bold text-xs"
                >
                  Save & Test GPS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
