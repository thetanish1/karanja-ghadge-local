import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import {
  ArrowLeft,
  Share2,
  Search,
  Star,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  Plus,
  Minus,
  Mic,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ShopDetailPageProps {
  shopId: string;
  onBack: () => void;
  onNavigateCart: () => void;
  onOpenAccount?: () => void;
}

export const ShopDetailPage: React.FC<ShopDetailPageProps> = ({
  shopId,
  onBack,
  onNavigateCart,
  onOpenAccount,
}) => {
  const { cart, updateQuantity } = useCart();
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([
    { id: 'all', label: 'Daily Staples' },
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadShopAndProducts();
  }, [shopId]);

  const loadShopAndProducts = async () => {
    try {
      setLoading(true);
      const [shopRes, prodsRes] = await Promise.all([
        api.getShopDetail(shopId).catch(() => ({ success: false, shop: null })),
        api.getProducts({ shopId }).catch(() => ({ success: false, products: [] })),
      ]);

      if (shopRes.success && shopRes.shop) {
        setShop(shopRes.shop);
      }
      if (prodsRes.success && prodsRes.products) {
        setProducts(prodsRes.products);

        // Derive categories
        const catSet = new Set<string>();
        prodsRes.products.forEach((p: any) => {
          if (p.category) catSet.add(p.category);
        });

        if (catSet.size > 0) {
          const dynamic = Array.from(catSet).map((cat) => ({
            id: cat.toLowerCase(),
            label: cat,
          }));
          setCategories([{ id: 'all', label: 'All Items' }, ...dynamic]);
        } else {
          setCategories([
            { id: 'all', label: 'Daily Staples' },
            { id: 'flours', label: 'Flours & Grains' },
            { id: 'spices', label: 'Spices & Masalas' },
            { id: 'oils', label: 'Cooking Oils' },
          ]);
        }
      }
    } catch (e) {
      console.warn('Error loading shop details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop?.name || 'AapnaCart Store',
          text: `Check out ${shop?.name || 'this store'} on AapnaCart!`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please type in the search box.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN,en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };
    recognition.start();
  };

  const getItemQty = (id: string) => {
    const item = cart?.items.find((i) => i.productId === id);
    return item?.qty || 0;
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeTab === 'all' ||
      (p.category && p.category.toLowerCase().includes(activeTab)) ||
      (activeTab === 'flours' && p.name.toLowerCase().includes('atta')) ||
      (activeTab === 'oils' && p.name.toLowerCase().includes('oil')) ||
      (activeTab === 'spices' && (p.name.toLowerCase().includes('salt') || p.name.toLowerCase().includes('mirch') || p.name.toLowerCase().includes('haldi')));
    const matchesSearch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const shopName = shop?.name || 'Shree Ganesh Kirana Store';
  const shopAddress = shop?.address || 'Main Market, Civil Lines';
  const shopRating = shop?.rating || '4.8';
  const shopImage =
    shop?.photos?.[0] ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';

  const cartTotalQty = cart?.items.reduce((sum, item) => sum + item.qty, 0) || 0;
  const cartTotalPaise = cart?.items.reduce((sum, item) => sum + item.qty * item.pricePaise, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="h-52 bg-slate-200 rounded-[28px]" />
        <div className="h-12 bg-slate-100 rounded-2xl" />
        <div className="space-y-3 pt-2">
          <div className="h-20 bg-slate-100 rounded-2xl" />
          <div className="h-20 bg-slate-100 rounded-2xl" />
          <div className="h-20 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans select-none pb-28 relative">
      {/* 1. TOP NAV BAR (Matching Stitch screen 0f314b4418e7405eaae036d48a7061a4) */}
      <div className="px-4 py-3 bg-white sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 shadow-xs">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1b5e39] flex items-center justify-center text-white text-xs font-black shadow-xs">
            A
          </div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            Store Details
          </span>
        </div>

        {/* Right Actions: Share & Profile Photo */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer relative"
            title="Share Store"
          >
            <Share2 className="w-4 h-4" />
            {copiedShare && (
              <span className="absolute -bottom-6 right-0 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                Copied!
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div
            onClick={onOpenAccount}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#1b5e39]/30 bg-slate-100 cursor-pointer shadow-xs flex items-center justify-center"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#e8f3ea] text-[#1b5e39] font-bold text-xs flex items-center justify-center">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* 2. HERO STORE BANNER IMAGE WITH VERIFIED LOCAL MERCHANT BADGE */}
        <div className="relative h-52 rounded-[28px] overflow-hidden shadow-sm border border-slate-200/80 bg-slate-100">
          <img
            src={shopImage}
            alt={shopName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Verified Local Merchant Pill Badge (Exact Stitch Match) */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1b5e39] fill-[#e8f3ea]" />
            <span className="text-[11px] font-extrabold text-[#1b5e39] tracking-tight">
              Verified Local Merchant
            </span>
          </div>
        </div>

        {/* 3. STORE METADATA HEADER (Exact Stitch Match) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-[#111827] tracking-tight">
              {shopName}
            </h1>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecf7ee] border border-[#a7d7b2] text-[11px] font-black text-[#1b5e39]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{shopRating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{shopAddress}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-bold pt-1">
            <div className="flex items-center gap-1 text-[#1b5e39]">
              <Navigation className="w-3.5 h-3.5" />
              <span>450m away</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-[#1b5e39]">
              <Clock className="w-3.5 h-3.5" />
              <span>15-20 mins delivery</span>
            </div>
          </div>
        </div>

        {/* 4. SEARCH BAR WITH MICROPHONE (Exact Stitch Match) */}
        <div className="relative">
          <div className="flex items-center h-12 bg-white border border-slate-200 rounded-2xl px-3.5 shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39] focus-within:border-[#1b5e39] transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Search in ${shopName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5. HORIZONTAL CATEGORY PILLS (Exact Stitch Match) */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {categories.map((c) => {
            const isSelected = activeTab === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#ecf7ee] text-[#1b5e39] border border-[#a7d7b2] shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* 6. CATEGORY TITLE & COUNT */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            {categories.find((c) => c.id === activeTab)?.label || 'Products'}
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredProducts.length} items
          </span>
        </div>

        {/* 7. PRODUCT LIST ROWS (Exact Stitch Screen Layout 0f314b4418e7405eaae036d48a7061a4) */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
              No products found. Try another search or category.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const qty = getItemQty(p._id);
              const priceRs = Math.round(p.pricePaise / 100);
              const mrpRs = p.mrpPaise ? Math.round(p.mrpPaise / 100) : null;
              const hasDiscount = mrpRs && mrpRs > priceRs;
              const discountPercent = hasDiscount ? Math.round(((mrpRs - priceRs) / mrpRs) * 100) : 0;
              const imgSrc =
                p.imageKeys?.[0] ||
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-[22px] p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  {/* Left: Thumbnail with Optional Discount Pill */}
                  <div className="relative w-20 h-20 rounded-2xl bg-[#f8faf9] flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-1 left-1 bg-[#ffedd5] text-[#c2410c] text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Center: Title, Unit, Price */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {p.unit}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-black text-slate-900">
                        ₹{priceRs}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{mrpRs}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Add Button or Stepper (Exact Stitch Style) */}
                  <div className="flex-shrink-0">
                    {qty === 0 ? (
                      <button
                        onClick={() => {
                          updateQuantity(p._id, 1, {
                            name: p.name,
                            unit: p.unit,
                            pricePaise: p.pricePaise,
                            shopId,
                            shopName,
                            image: imgSrc,
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-[#1b5e39]/40 hover:bg-[#1b5e39] text-[#1b5e39] hover:text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#ecf7ee] border border-[#a7d7b2] text-[#1b5e39] rounded-xl px-2.5 py-1.5 text-xs font-black shadow-xs">
                        <button
                          onClick={() =>
                            updateQuantity(p._id, qty - 1, {
                              name: p.name,
                              unit: p.unit,
                              pricePaise: p.pricePaise,
                              shopId,
                              shopName,
                              image: imgSrc,
                            })
                          }
                          className="hover:opacity-75 cursor-pointer p-0.5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[14px] text-center font-black">{qty}</span>
                        <button
                          onClick={() =>
                            updateQuantity(p._id, qty + 1, {
                              name: p.name,
                              unit: p.unit,
                              pricePaise: p.pricePaise,
                              shopId,
                              shopName,
                              image: imgSrc,
                            })
                          }
                          className="hover:opacity-75 cursor-pointer p-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 8. FLOATING CART POPUP BAR (Exact Stitch Match from uploaded image) */}
      {cartTotalQty > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-[400px] mx-auto z-40 animate-in fade-in slide-in-from-bottom duration-200">
          <div
            onClick={onNavigateCart}
            className="bg-[#155a34] rounded-[24px] p-3 text-white flex items-center justify-between shadow-2xl hover:bg-[#124d2d] transition cursor-pointer border border-[#1b5e39]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f97316] text-white text-[9px] font-black flex items-center justify-center">
                  {cartTotalQty}
                </span>
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  {cartTotalQty} {cartTotalQty === 1 ? 'item' : 'items'} added
                </div>
                <div className="text-[11px] text-white/80">
                  ₹{Math.round(cartTotalPaise / 100)} total
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
