import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Home, Search, ShoppingBag, Clock, User, ClipboardList, Package, Settings, Truck, ShieldCheck, Store } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { activeRole } = useAuth();
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;

  const renderTabs = () => {
    switch (activeRole) {
      case 'shopkeeper':
        return [
          { id: 'shop-queue', label: 'Order Queue', icon: ClipboardList },
          { id: 'shop-products', label: 'Products', icon: Package },
          { id: 'shop-store', label: 'My Shop', icon: Store },
          { id: 'legal', label: 'Help', icon: User },
        ];
      case 'delivery_partner':
        return [
          { id: 'delivery-tasks', label: 'Deliveries', icon: Truck },
          { id: 'legal', label: 'Support', icon: User },
        ];
      case 'admin':
        return [
          { id: 'admin-overview', label: 'Overview', icon: ShieldCheck },
          { id: 'admin-shops', label: 'Shops', icon: Store },
          { id: 'admin-orders', label: 'Orders', icon: ClipboardList },
          { id: 'admin-settings', label: 'Settings', icon: Settings },
        ];
      case 'customer':
      default:
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: itemCount },
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'account', label: 'Account', icon: User },
        ];
    }
  };

  const tabs = renderTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-full sm:max-w-md z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1 px-2 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition relative ${
                isActive ? 'text-[#1b5e39] font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#f97316] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
