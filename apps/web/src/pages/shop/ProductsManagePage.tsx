import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { formatPaiseToRupees, parseRupeesToPaise } from '@karanjaghadge/shared';
import { Package, Plus, Trash2, Edit, Check, AlertCircle, ShoppingBag, X } from 'lucide-react';

export const ProductsManagePage: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [priceRupees, setPriceRupees] = useState('100');
  const [mrpRupees, setMrpRupees] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      loadProducts(selectedShopId);
    }
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const [shopsRes, catsRes] = await Promise.all([
        api.getMyShops(),
        api.getCategories(),
      ]);
      if (shopsRes.success && shopsRes.shops.length > 0) {
        setShops(shopsRes.shops);
        setSelectedShopId(shopsRes.shops[0].id);
      }
      if (catsRes.success && catsRes.categories.length > 0) {
        setCategories(catsRes.categories);
        setCategoryId(catsRes.categories[0]._id);
      }
    } catch (e) {
      console.warn('Failed to load shops:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (shopId: string) => {
    try {
      const res = await api.getProducts({ shopId });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (e) {
      console.warn('Failed to load products:', e);
    }
  };

  const handleToggleStock = async (product: any) => {
    const nextStatus = product.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
    try {
      await api.updateProduct(product.shopId, product.id, { stockStatus: nextStatus });
      await loadProducts(selectedShopId);
    } catch (e: any) {
      alert(e.message || 'Failed to update stock');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const pricePaise = parseRupeesToPaise(priceRupees);
      const mrpPaise = mrpRupees ? parseRupeesToPaise(mrpRupees) : undefined;

      const res = await api.createProduct(selectedShopId, {
        name,
        unit,
        pricePaise,
        mrpPaise,
        categoryId,
        stockStatus: 'in_stock',
      });

      if (res.success) {
        setModalOpen(false);
        setName('');
        setPriceRupees('100');
        setMrpRupees('');
        await loadProducts(selectedShopId);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`Are you sure you want to archive "${product.name}"?`)) return;
    try {
      await api.deleteProduct(product.shopId, product.id);
      await loadProducts(selectedShopId);
    } catch (e: any) {
      alert(e.message || 'Failed to archive');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Catalog</h2>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Shop Selector if multiple */}
      {shops.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shops.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedShopId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition ${
                selectedShopId === s.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Product List */}
      <div className="space-y-2.5">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  p.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                }`}>
                  {p.stockStatus === 'in_stock' ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{p.unit} • {formatPaiseToRupees(p.pricePaise)}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Stock Toggle Switch */}
              <button
                onClick={() => handleToggleStock(p)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                  p.stockStatus === 'in_stock'
                    ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                    : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {p.stockStatus === 'in_stock' ? 'Mark Out' : 'Mark In'}
              </button>

              <button
                onClick={() => handleDeleteProduct(p)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                title="Archive Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Product</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Desi Toor Dal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Pack</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg, 500 ml"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹, Optional)</label>
                  <input
                    type="number"
                    placeholder="130"
                    value={mrpRupees}
                    onChange={(e) => setMrpRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {saving ? 'Saving...' : 'Add Product to Shop'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
