import React from 'react';
import { Home, ShoppingBag, FileText, Wallet } from 'lucide-react';

interface ShopkeeperNavProps {
  currentTab: 'dashboard' | 'products' | 'orders' | 'sales';
  onSelectTab: (tab: 'dashboard' | 'products' | 'orders' | 'sales') => void;
}

export const ShopkeeperNav: React.FC<ShopkeeperNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: 'dashboard' | 'products' | 'orders' | 'sales'; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'sales', label: 'Sales', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-full sm:max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2 px-3 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
                isActive ? 'text-[#1b5e39] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[11px] mt-1 leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
