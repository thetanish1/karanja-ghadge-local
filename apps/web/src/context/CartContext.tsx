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
  image?: string;
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

export interface ItemMetadata {
  name?: string;
  unit?: string;
  pricePaise?: number;
  shopId?: string;
  shopName?: string;
  image?: string;
}

interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  updateQuantity: (productId: string, qty: number, meta?: ItemMetadata) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  conflictModal: {
    isOpen: boolean;
    error: string;
    pendingProductId?: string;
    pendingQty?: number;
    pendingMeta?: ItemMetadata;
  };
  resolveConflict: (clearAndAdd: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aapnacart_local_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Initialize from localStorage if present
  const [cart, setCart] = useState<CartData | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore JSON parse error
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    error: string;
    pendingProductId?: string;
    pendingQty?: number;
    pendingMeta?: ItemMetadata;
  }>({
    isOpen: false,
    error: '',
  });

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    try {
      if (cart && cart.itemCount > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      // ignore storage error
    }
  }, [cart]);

  // Sync with server if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.cart && res.cart.items?.length > 0) {
        setCart(res.cart);
      }
    } catch (e) {
      console.warn('Could not fetch server cart, using local cart:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, qty: number, meta?: ItemMetadata) => {
    // 0. Check Single-Shop Cart Conflict
    if (cart && cart.shopId && meta?.shopId && cart.shopId !== meta.shopId && cart.items.length > 0 && qty > 0) {
      setConflictModal({
        isOpen: true,
        error: `Your cart currently contains items from "${cart.shopName || 'another store'}". AapnaCart fulfills orders from one store at a time for fastest doorstep delivery. Do you want to clear your current cart and start an order from "${meta.shopName || 'this store'}"?`,
        pendingProductId: productId,
        pendingQty: qty,
        pendingMeta: meta,
      });
      return;
    }

    // 1. Optimistic Local Update
    setCart((prevCart) => {
      const existingItems = prevCart?.items ? [...prevCart.items] : [];
      const itemIndex = existingItems.findIndex((i) => i.productId === productId);

      let nextItems: CartItem[] = [];

      if (qty <= 0) {
        // Remove item
        nextItems = existingItems.filter((i) => i.productId !== productId);
      } else if (itemIndex >= 0) {
        // Update existing item
        const existing = existingItems[itemIndex];
        const unitPrice = meta?.pricePaise || existing.pricePaise || 3600;
        existingItems[itemIndex] = {
          ...existing,
          qty,
          subtotalPaise: qty * unitPrice,
          name: meta?.name || existing.name,
          unit: meta?.unit || existing.unit,
          image: meta?.image || existing.image,
        };
        nextItems = existingItems;
      } else {
        // Add new item
        const unitPrice = meta?.pricePaise || 3600;
        nextItems = [
          ...existingItems,
          {
            productId,
            name: meta?.name || 'Local Store Item',
            unit: meta?.unit || '1 unit',
            pricePaise: unitPrice,
            qty,
            subtotalPaise: qty * unitPrice,
            image: meta?.image,
          },
        ];
      }

      const totalItemsCount = nextItems.reduce((acc, curr) => acc + curr.qty, 0);
      const itemsTotal = nextItems.reduce((acc, curr) => acc + curr.subtotalPaise, 0);

      if (totalItemsCount === 0) {
        return null;
      }

      return {
        shopId: meta?.shopId || prevCart?.shopId,
        shopName: meta?.shopName || prevCart?.shopName || 'Local Store',
        items: nextItems,
        itemsTotalPaise: itemsTotal,
        deliveryFeePaise: 0,
        platformFeePaise: 0,
        totalPaise: itemsTotal,
        itemCount: totalItemsCount,
      };
    });

    // 2. Background Server Sync (if authenticated)
    if (isAuthenticated) {
      try {
        const res = await api.updateCart(productId, qty);
        if (res.success && res.cart) {
          setCart(res.cart);
        }
      } catch (err: any) {
        if (err instanceof ApiError && err.statusCode === 409) {
          setConflictModal({
            isOpen: true,
            error: err.message,
            pendingProductId: productId,
            pendingQty: qty,
            pendingMeta: meta,
          });
        }
        // Do not block user with loud alerts; client state remains fluid
      }
    }
  };

  const clearCart = async () => {
    setCart(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      if (isAuthenticated) {
        await api.clearCart();
      }
    } catch (e) {
      console.warn('Could not clear server cart:', e);
    }
  };

  const resolveConflict = async (clearAndAdd: boolean) => {
    if (clearAndAdd && conflictModal.pendingProductId && conflictModal.pendingQty) {
      const pId = conflictModal.pendingProductId;
      const q = conflictModal.pendingQty;
      const m = conflictModal.pendingMeta;
      setConflictModal({ isOpen: false, error: '' });
      await clearCart();
      await updateQuantity(pId, q, m);
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
