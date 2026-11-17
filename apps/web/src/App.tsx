import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { BottomNav } from './components/BottomNav.js';
import { InstallPwaBanner } from './components/InstallPwaBanner.js';
import { MultiShopModal } from './components/MultiShopModal.js';
import { AapnaCartAuthModal } from './components/AapnaCartAuthModal.js';
import { AapnaCartFigmaScreen } from './components/AapnaCartFigmaScreen.js';
import { SplashScreen } from './components/SplashScreen.js';
import { DeliveryLocationScreen } from './components/DeliveryLocationScreen.js';
import { FloatingCartBar } from './components/FloatingCartBar.js';

// Customer Pages
import { HomePage } from './pages/customer/HomePage.js';
import { ShopsPage } from './pages/customer/ShopsPage.js';
import { ShopDetailPage } from './pages/customer/ShopDetailPage.js';
import { SearchPage } from './pages/customer/SearchPage.js';
import { CartPage } from './pages/customer/CartPage.js';
import { CheckoutPage } from './pages/customer/CheckoutPage.js';
import { OrderStatusPage } from './pages/customer/OrderStatusPage.js';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage.js';
import { AccountPage } from './pages/customer/AccountPage.js';

// Shopkeeper Pages
import { ShopkeeperPortal } from './pages/shop/ShopkeeperPortal.js';
import { ShopApplyPage } from './pages/shop/ShopApplyPage.js';

// Delivery Pages
import { DeliveryTasksPage } from './pages/delivery/DeliveryTasksPage.js';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage.js';
import { ShopApprovalsPage } from './pages/admin/ShopApprovalsPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';

// Legal Pages
import { PolicyPages } from './pages/legal/PolicyPages.js';

const MainApp: React.FC = () => {
  const { activeRole, isAuthenticated } = useAuth();
  
  // App splash screen from Figma design
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Show the exact Figma design screen by default
  const [showFigmaLanding, setShowFigmaLanding] = useState<boolean>(true);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('Home • Sector 14');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedShopId, setSelectedShopId] = useState<string | null>('shop-gupta');
  const [activeOrderId, setActiveOrderId] = useState<string | null>('#AC2409');
  const [legalPage, setLegalPage] = useState<string>('terms');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // When unauthenticated, always show Figma Landing Screen
  useEffect(() => {
    if (!isAuthenticated) {
      setShowFigmaLanding(true);
    }
  }, [isAuthenticated]);

  // Switch initial tab when role perspective switches
  useEffect(() => {
    switch (activeRole) {
      case 'shopkeeper':
        setCurrentTab('shop-queue');
        break;
      case 'delivery_partner':
        setCurrentTab('delivery-tasks');
        break;
      case 'admin':
        setCurrentTab('admin-overview');
        break;
      case 'customer':
      default:
        setCurrentTab('home');
        break;
    }
  }, [activeRole]);

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    setCurrentTab('shop-detail');
  };

  const handleSelectOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentTab('orders');
  };

  const handleOpenLegal = (pageName: string) => {
    setLegalPage(pageName);
    setCurrentTab('legal');
  };

  // 1. FIGMA DESIGNED SPLASH SCREEN
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} durationMs={2200} />;
  }

  // 2. FIGMA DESIGNED WELCOME & ONBOARDING LANDING
  if (showFigmaLanding) {
    return (
      <AapnaCartFigmaScreen
        onEnterApp={() => setShowFigmaLanding(false)}
        onOpenShopkeeper={() => {
          setShowFigmaLanding(false);
          setCurrentTab('shop-queue');
        }}
        onOpenAdmin={() => {
          setShowFigmaLanding(false);
          setCurrentTab('admin-overview');
        }}
      />
    );
  }

  // 3. FIGMA DELIVERY LOCATION MODAL SCREEN
  if (showLocationModal) {
    return (
      <DeliveryLocationScreen
        onBack={() => setShowLocationModal(false)}
        onConfirm={(loc) => {
          setSelectedAddress(loc);
          setShowLocationModal(false);
        }}
        currentAddress={selectedAddress}
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      // Customer Views
      case 'home':
        return (
          <HomePage
            onSelectShop={handleSelectShop}
            onNavigateShops={() => setCurrentTab('shops')}
            onNavigateSearch={() => setCurrentTab('search')}
          />
        );
      case 'shops':
        return (
          <ShopsPage
            onBack={() => setCurrentTab('home')}
            onSelectShop={handleSelectShop}
            onOpenSearch={() => setCurrentTab('search')}
          />
        );
      case 'shop-detail':
        return (
          <ShopDetailPage
            shopId={selectedShopId || 'shop-gupta'}
            onBack={() => setCurrentTab('home')}
            onNavigateCart={() => setCurrentTab('cart')}
          />
        );
      case 'search':
        return <SearchPage onSelectShop={handleSelectShop} />;
      case 'cart':
        return (
          <CartPage
            onBack={() => setCurrentTab('home')}
            onProceedToCheckout={() => setCurrentTab('orders')}
            onBrowseShops={() => setCurrentTab('shops')}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            onBack={() => setCurrentTab('cart')}
            onOrderSuccess={(orderId) => {
              setActiveOrderId(orderId);
              setCurrentTab('orders');
            }}
          />
        );
      case 'orders':
        return (
          <OrderStatusPage
            orderId={activeOrderId || '#AC2409'}
            onBack={() => setCurrentTab('home')}
            onBrowseShops={() => setCurrentTab('shops')}
          />
        );
      case 'order-history':
        return (
          <OrderHistoryPage
            onSelectOrder={handleSelectOrder}
            onBrowseShops={() => setCurrentTab('home')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        );
      case 'account':
        return (
          <AccountPage
            onOpenLegal={handleOpenLegal}
            onApplyShop={() => setCurrentTab('shop-apply')}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenOrder={handleSelectOrder}
            onOpenShopkeeper={() => setCurrentTab('shop-queue')}
          />
        );

      // Shopkeeper Portal (Unified 4-tab Figma flow: Dashboard, Products, Orders, Sales)
      case 'shop-queue':
      case 'shop-products':
      case 'shop-store':
      case 'shopkeeper-portal':
        return <ShopkeeperPortal onBackToCustomer={() => setCurrentTab('home')} />;
      case 'shop-apply':
        return (
          <ShopApplyPage
            onBack={() => setCurrentTab('account')}
            onSuccess={() => setCurrentTab('shopkeeper-portal')}
          />
        );

      // Delivery Views
      case 'delivery-tasks':
        return <DeliveryTasksPage />;

      // Admin Views
      case 'admin-overview':
        return <AdminOverviewPage onNavigateTab={(tab) => setCurrentTab(tab)} />;
      case 'admin-shops':
        return <ShopApprovalsPage />;
      case 'admin-orders':
        return <AdminOrdersPage />;
      case 'admin-settings':
        return <AdminSettingsPage />;

      // Legal & Help Views
      case 'legal':
        return (
          <PolicyPages
            page={legalPage}
            onBack={() => setCurrentTab('account')}
          />
        );

      default:
        return (
          <HomePage
            onSelectShop={handleSelectShop}
            onNavigateShops={() => setCurrentTab('shops')}
            onNavigateSearch={() => setCurrentTab('search')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#eaede9] flex justify-center antialiased font-sans">
      <div className="w-full max-w-[430px] min-h-screen bg-white sm:my-4 sm:rounded-[44px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col justify-between border-0 sm:border border-slate-200/60 relative">
        
        {/* PWA Mobile Install Banner for Android & iOS */}
        <InstallPwaBanner />

        {/* Top Mobile Navbar (Hidden on store detail, cart, tracking, and shopkeeper portal) */}
        {currentTab !== 'shop-detail' && currentTab !== 'cart' && currentTab !== 'orders' && !currentTab.startsWith('shop') && (
          <Navbar
            onOpenLocation={() => setShowLocationModal(true)}
            onOpenAccount={() => setCurrentTab('account')}
            selectedAddress={selectedAddress}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 w-full overflow-y-auto">
          {renderContent()}
        </main>

        {/* Floating Cart Bar (appears when items in cart, hidden on cart, tracking, and shopkeeper) */}
        {currentTab !== 'cart' && currentTab !== 'orders' && !currentTab.startsWith('shop') && (
          <FloatingCartBar onOpenCart={() => setCurrentTab('cart')} />
        )}

        {/* Bottom Navigation (matching Figma 4 tabs, hidden in shopkeeper) */}
        {currentTab !== 'cart' && currentTab !== 'orders' && currentTab !== 'shop-detail' && !currentTab.startsWith('shop') && (
          <BottomNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
        )}

        {/* Multi-Shop Constraint Modal */}
        <MultiShopModal />

        {/* Figma Designed AapnaCart Auth Modal */}
        <AapnaCartAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
