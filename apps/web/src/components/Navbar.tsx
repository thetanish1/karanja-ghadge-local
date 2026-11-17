import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { MapPin, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenLocation: () => void;
  onOpenAccount: () => void;
  selectedAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLocation,
  onOpenAccount,
  selectedAddress = 'Home • Sector 14',
}) => {
  const { user } = useAuth();
  
  // Initials from user or default "AK" (Akash Kumar from Figma design)
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AK';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-slate-100 select-none font-sans">
      
      {/* Deliver To Location Selector */}
      <button
        onClick={onOpenLocation}
        className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-90 transition group"
      >
        <div className="w-9 h-9 rounded-xl bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39] flex-shrink-0">
          <MapPin className="w-4 h-4 text-[#1b5e39]" />
        </div>

        <div>
          <div className="text-[10px] text-[#6b7280] font-medium leading-none">
            Deliver to
          </div>
          <div className="text-xs font-bold text-[#111827] flex items-center gap-1 mt-0.5 leading-none">
            <span>{selectedAddress}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
          </div>
        </div>
      </button>

      {/* User Profile Avatar Circle (AK from Figma design) */}
      <button
        onClick={onOpenAccount}
        className="w-8 h-8 rounded-full bg-[#fed7aa] text-[#c2410c] text-xs font-extrabold flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer"
        title="Account"
      >
        <span>{initials}</span>
      </button>

    </header>
  );
};
