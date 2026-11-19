import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { getCurrentGpsPosition, reverseGeocodeCoords } from '../services/location.js';
import {
  X,
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  Crosshair,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [address, setAddress] = useState('House No. 42, Ward No. 3, Shivaji Chowk, Karanja (Ghadge)');
  const [saving, setSaving] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseGps = async () => {
    try {
      setLocatingGps(true);
      const coords = await getCurrentGpsPosition();
      const geo = await reverseGeocodeCoords(coords.lat, coords.lng);
      setAddress(geo.formattedAddress);
    } catch (e) {
      console.warn('GPS profile address autofill error:', e);
    } finally {
      setLocatingGps(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatarUrl,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Save profile error:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AC';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e8f3ea] text-[#1b5e39] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Profile Photo Management */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-[#1b5e39] to-[#155a34] flex items-center justify-center text-white text-2xl font-black">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Camera Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1b5e39] hover:bg-[#155a34] text-white flex items-center justify-center shadow-md transition cursor-pointer border-2 border-white"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="text-[11px] font-bold text-[#1b5e39] mt-2">
              Tap camera to upload custom photo
            </div>

            {/* Quick Avatar Presets */}
            <div className="w-full pt-2">
              <div className="text-[10px] font-bold uppercase text-slate-400 text-center mb-1.5">
                Or choose from presets
              </div>
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition hover:scale-110 flex-shrink-0 ${
                      avatarUrl === preset ? 'border-[#1b5e39] scale-110 ring-2 ring-[#1b5e39]/30' : 'border-slate-200'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Full Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1b5e39]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1b5e39] bg-slate-50/50"
            />
          </div>

          {/* 3. Phone Number (Read-only verified) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1b5e39]" />
                <span>Phone Number</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            </label>
            <input
              type="text"
              disabled
              value={user?.phone ? `+91 ${user.phone}` : '+91 9876543210'}
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>

          {/* 4. Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1b5e39]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.sharma@example.com"
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1b5e39] bg-slate-50/50"
            />
          </div>

          {/* 5. Default Delivery Address */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1b5e39]" />
                <span>Default Delivery Address</span>
              </label>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={locatingGps}
                className="text-[10px] font-bold text-[#1b5e39] hover:underline flex items-center gap-0.5"
              >
                <Crosshair className="w-3 h-3" />
                <span>{locatingGps ? 'Locating...' : 'Use GPS'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/flat, street, landmark, Karanja Ghadge"
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1b5e39] bg-slate-50/50"
            />
          </div>

          {/* Save Status / Feedback */}
          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#1b5e39] hover:bg-[#155a34] text-white text-xs font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
