import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ArrowLeft, Plus, Search, Edit2, AlertCircle } from 'lucide-react';

interface ShopProductsPageProps {
  onBack: () => void;
  onOpenAddProduct: () => void;
}

export const ShopProductsPage: React.FC<ShopProductsPageProps> = ({
  onBack,
  onOpenAddProduct,
}) => {
  const [shopId, setShopId] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'out_of_stock' | 'low_stock'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopProducts();
  }, []);

  const loadShopProducts = async () => {
    try {
      setLoading(true);
      const shopsRes = await api.getMyShops();
      if (shopsRes.success && shopsRes.shops?.length > 0) {
        const myShop = shopsRes.shops[0];
        setShopId(myShop._id);
        const prodsRes = await api.getProducts({ shopId: myShop._id });
        if (prodsRes.success && prodsRes.products) {
          setProducts(prodsRes.products);
        }
      } else {
        // Fallback: load general products if shopkeeper has not bound shopId
        const prodsRes = await api.getProducts();
        if (prodsRes.success && prodsRes.products) {
          setProducts(prodsRes.products);
        }
      }
    } catch (e) {
      console.warn('Failed to load shop products:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (product: any) => {
    const newStatus = product.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
    // Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, stockStatus: newStatus } : p))
    );

    if (shopId) {
      try {
        await api.updateProduct(shopId, product._id, { stockStatus: newStatus });
      } catch (e) {
        console.warn('Failed to update product stock:', e);
        // revert on error
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, stockStatus: product.stockStatus } : p))
        );
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'out_of_stock' && p.stockStatus !== 'out_of_stock') return false;
    if (filter === 'low_stock' && p.stockStatus !== 'low_stock') return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inStockCount = products.filter((p) => p.stockStatus === 'in_stock' || !p.stockStatus).length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'out_of_stock').length;

  return (
    <div className="space-y-4 px-4 pt-4 pb-28 font-sans select-none relative min-h-screen bg-[#f8faf9]">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Products</h1>
        <button
          onClick={onOpenAddProduct}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Search bar */}
      <div className="flex items-center h-12 border border-[#e2e8f0] rounded-[18px] px-3.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#1b5e39]">
        <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search your products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-[#111827] placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* 3. Stats Card */}
      <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs grid grid-cols-3 text-center divide-x divide-slate-100">
        <div>
          <div className="text-base font-extrabold text-[#111827]">{products.length}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">All products</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-[#111827]">{inStockCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">In stock</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-[#ea580c]">{outOfStockCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Out of stock</div>
        </div>
      </div>

      {/* 4. Filter Pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('out_of_stock')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            filter === 'out_of_stock'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          Out of stock
        </button>
      </div>

      {/* 5. Product Rows */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-slate-200 rounded-[24px]" />
          <div className="h-20 bg-slate-200 rounded-[24px]" />
          <div className="h-20 bg-slate-200 rounded-[24px]" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[24px] p-8 text-center text-xs text-slate-400 border border-slate-200">
          No products found. Add your first item using the button below.
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredProducts.map((p) => {
            const inStock = p.stockStatus !== 'out_of_stock';
            const priceRs = Math.round(p.pricePaise / 100);
            const imgSrc = p.imageKeys?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';

            return (
              <div key={p._id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">{p.name}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {p.unit} • ₹{priceRs}
                    </div>
                    <div
                      className={`text-[10px] font-bold mt-1 ${
                        inStock ? 'text-[#1b5e39]' : 'text-red-500'
                      }`}
                    >
                      {inStock ? 'In stock' : 'Out of stock'}
                    </div>
                  </div>
                </div>

                {/* Toggle switch */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleStock(p)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      inStock ? 'bg-[#1b5e39]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        inStock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Product Button */}
      <div className="fixed bottom-20 right-4 sm:right-auto sm:left-auto z-30">
        <button
          onClick={onOpenAddProduct}
          className="h-12 px-5 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-95 text-white font-bold text-xs rounded-full shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add product</span>
        </button>
      </div>
    </div>
  );
};
