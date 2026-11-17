import React, { useState } from 'react';
import { ShopDashboardPage } from './ShopDashboardPage.js';
import { ShopProductsPage } from './ShopProductsPage.js';
import { ShopOrdersPage } from './ShopOrdersPage.js';
import { ShopSalesPage } from './ShopSalesPage.js';
import { AddProductPage } from './AddProductPage.js';
import { ShopkeeperNav } from './ShopkeeperNav.js';

interface ShopkeeperPortalProps {
  onBackToCustomer?: () => void;
}

export const ShopkeeperPortal: React.FC<ShopkeeperPortalProps> = ({ onBackToCustomer }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'sales'>('dashboard');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // If in Add Product screen
  if (isAddingProduct) {
    return (
      <AddProductPage
        onBack={() => setIsAddingProduct(false)}
        onSaveSuccess={() => {
          setIsAddingProduct(false);
          setActiveTab('products');
        }}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ShopDashboardPage
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAddProduct={() => setIsAddingProduct(true)}
            onOpenOrder={() => setActiveTab('orders')}
          />
        );
      case 'products':
        return (
          <ShopProductsPage
            onBack={() => setActiveTab('dashboard')}
            onOpenAddProduct={() => setIsAddingProduct(true)}
          />
        );
      case 'orders':
        return (
          <ShopOrdersPage
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'sales':
        return (
          <ShopSalesPage
            onBack={() => setActiveTab('dashboard')}
          />
        );
      default:
        return (
          <ShopDashboardPage
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAddProduct={() => setIsAddingProduct(true)}
            onOpenOrder={() => setActiveTab('orders')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between relative font-sans">
      
      {/* Main Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>

      {/* 4-Tab Bottom Navigation Bar (Matching Figma) */}
      <ShopkeeperNav
        currentTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

    </div>
  );
};
