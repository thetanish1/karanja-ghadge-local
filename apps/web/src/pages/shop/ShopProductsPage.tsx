import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Edit2 } from 'lucide-react';

interface ShopProductsPageProps {
  onBack: () => void;
  onOpenAddProduct: () => void;
}

export const ShopProductsPage: React.FC<ShopProductsPageProps> = ({
  onBack,
  onOpenAddProduct,
}) => {
  const [filter, setFilter] = useState<'all' | 'out_of_stock' | 'low_stock'>('all');
  const [search, setSearch] = useState('');

  const [products, setProducts] = useState([
    {
      id: 'p1',
      name: 'Fresh Red Tomatoes',
      unit: '500 g',
      price: 36,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'p2',
      name: 'Farm Fresh Milk',
      unit: '1 L',
      price: 62,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'p3',
      name: 'Seasonal Veggie Box',
      unit: '1 pack',
      price: 149,
      inStock: false,
      image: '/images/fresh_basket.jpg',
    },
    {
      id: 'p4',
      name: 'Artisan Bread',
      unit: '400 g',
      price: 75,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    },
  ]);

  const toggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'out_of_stock' && p.inStock) return false;
    if (filter === 'low_stock' && (!p.inStock || p.price > 100)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 px-4 pt-4 pb-28 font-sans select-none relative min-h-screen">
      
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

      {/* 3. Stats Card (3 Columns) */}
      <div className="bg-white rounded-[22px] p-4 border border-slate-200/80 shadow-xs grid grid-cols-3 text-center divide-x divide-slate-100">
        <div>
          <div className="text-base font-extrabold text-[#111827]">124</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">All products</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-[#111827]">118</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Available</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-[#ea580c]">6</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Needs attention</div>
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
        <button
          onClick={() => setFilter('low_stock')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            filter === 'low_stock'
              ? 'bg-[#1b5e39] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          Low stock
        </button>
      </div>

      {/* 5. Product Rows */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredProducts.map((p) => (
          <div key={p.id} className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">{p.name}</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {p.unit} • ₹{p.price}
                </div>
                <div
                  className={`text-[10px] font-bold mt-1 ${
                    p.inStock ? 'text-[#1b5e39]' : 'text-slate-400'
                  }`}
                >
                  {p.inStock ? 'In stock' : 'Out of stock'}
                </div>
              </div>
            </div>

            {/* Toggle switch & Edit pencil */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleStock(p.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  p.inStock ? 'bg-[#1b5e39]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    p.inStock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              <button
                onClick={onOpenAddProduct}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
