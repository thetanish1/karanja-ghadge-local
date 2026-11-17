import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../services/api.js';
import { useAuth } from './AuthContext.js';

export interface CartItem {
  productId: string;
  name: string;
  unit: string;
  pricePaise: number;
  qty: number;
  subtotalPaise: number;
}

export interface CartData {
  shopId?: string;
  shopName?: string;
  items: CartItem[];
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  totalPaise: number;
  itemCount: number;
}

interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  conflictModal: {
    isOpen: boolean;
    error: string;
    pendingProductId?: string;
    pendingQty?: number;
  };
  resolveConflict: (clearAndAdd: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    error: string;
    pendingProductId?: string;
    pendingQty?: number;
  }>({
    isOpen: false,
    error: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success) {
        setCart(res.cart);
      }
    } catch (e) {
      console.warn('Could not fetch cart:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, qty: number) => {
    try {
      const res = await api.updateCart(productId, qty);
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 409) {
        // Multi-shop restriction modal
        setConflictModal({
          isOpen: true,
          error: err.message,
          pendingProductId: productId,
          pendingQty: qty,
        });
        return;
      }
      alert(err.message || 'Failed to update cart');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.clearCart();
      if (res.success) {
        setCart(res.cart);
      }
    } catch (e) {
      console.warn('Could not clear cart:', e);
    }
  };

  const resolveConflict = async (clearAndAdd: boolean) => {
    if (clearAndAdd && conflictModal.pendingProductId && conflictModal.pendingQty) {
      const pId = conflictModal.pendingProductId;
      const q = conflictModal.pendingQty;
      setConflictModal({ isOpen: false, error: '' });
      await clearCart();
      await updateQuantity(pId, q);
    } else {
      setConflictModal({ isOpen: false, error: '' });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        updateQuantity,
        clearCart,
        refreshCart,
        conflictModal,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
