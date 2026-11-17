import React from 'react';
import { CheckCircle2, X, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export interface AddedProductItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp?: number;
  image: string;
  shopName?: string;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AddedProductItem | null;
  onViewCart: () => void;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  onViewCart,
}) => {
  const { cart, updateQuantity } = useCart();

  if (!isOpen || !product) return null;

  const currentCartItem = cart?.items.find((i) => i.productId === product.id);
  const qty = currentCartItem?.qty || 1;
  const itemTotal = product.price * qty;
  const cartGrandTotalPaise = cart?.totalPaise || (itemTotal * 100);
  const totalCartCount = cart?.itemCount || (cart?.items.reduce((acc, curr) => acc + curr.qty, 0) || qty);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      
      {/* Background click-to-close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Drawer */}
      <div className="relative z-10 w-full max-w-[390px] bg-white rounded-t-[32px] sm:rounded-[36px] shadow-2xl p-5 pt-4 space-y-4 border border-slate-200/60 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="flex justify-center -mt-1 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#e8f3ea] flex items-center justify-center text-[#1b5e39]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1b5e39] uppercase tracking-wider">
                Added to your cart
              </div>
              <div className="text-[10px] text-slate-400">
                {product.shopName || 'Karanja Local Store'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Card */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-semibold">{product.unit}</span>
            <h3 className="text-sm font-bold text-slate-900 truncate">{product.name}</h3>
            
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-sm font-extrabold text-[#1b5e39]">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-[11px] text-slate-400 line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stepper & Line Item Subtotal */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="text-xs text-slate-600 font-medium">
            Quantity:
          </div>

          <div className="flex items-center gap-3 bg-[#e8f3ea] border border-[#c4e3c8] rounded-xl px-3 py-1.5">
            <button
              onClick={() => {
                if (qty <= 1) {
                  updateQuantity(product.id, 0);
                  onClose();
                } else {
                  updateQuantity(product.id, qty - 1);
                }
              }}
              className="w-6 h-6 rounded-lg bg-white text-[#1b5e39] font-bold flex items-center justify-center hover:bg-slate-100 shadow-xs cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="text-sm font-extrabold text-[#111827] min-w-[18px] text-center">
              {qty}
            </span>

            <button
              onClick={() => updateQuantity(product.id, qty + 1)}
              className="w-6 h-6 rounded-lg bg-white text-[#1b5e39] font-bold flex items-center justify-center hover:bg-slate-100 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Cart Summary Banner */}
        <div className="bg-[#f0f7f2] rounded-xl p-2.5 text-xs flex items-center justify-between text-[#1b5e39] font-semibold border border-[#d2ead6]">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart Total ({totalCartCount} items)</span>
          </div>
          <span className="font-extrabold text-sm">
            ₹{(cartGrandTotalPaise / 100).toFixed(0)}
          </span>
        </div>

        {/* Dual Actions: Continue Shopping vs View Cart */}
        <div className="space-y-2 pt-1">
          {/* Primary View Cart CTA */}
          <button
            onClick={() => {
              onClose();
              onViewCart();
            }}
            className="w-full h-14 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Cart • ₹{(cartGrandTotalPaise / 100).toFixed(0)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Continue Shopping */}
          <button
            onClick={onClose}
            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
