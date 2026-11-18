import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ArrowLeft, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface AddProductPageProps {
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({
  onBack,
  onSaveSuccess,
}) => {
  const [shopId, setShopId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [packSize, setPackSize] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [description, setDescription] = useState('');
  const [availableForSale, setAvailableForSale] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load shop and categories
    Promise.all([
      api.getMyShops().catch(() => ({ success: false, shops: [] })),
      api.getCategories().catch(() => ({ success: false, categories: [] })),
    ]).then(([shopsRes, catsRes]) => {
      if (shopsRes.success && shopsRes.shops?.length > 0) {
        setShopId(shopsRes.shops[0]._id);
      }
      if (catsRes.success && catsRes.categories?.length > 0) {
        setCategories(catsRes.categories);
        setCategoryId(catsRes.categories[0]._id);
      }
    });
  }, []);

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim() && imageUrls.length < 4) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a product name.');
      return;
    }
    const priceNum = parseFloat(sellingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid selling price greater than 0.');
      return;
    }
    const mrpNum = mrp ? parseFloat(mrp) : priceNum;
    if (mrpNum < priceNum) {
      setError('MRP cannot be lower than the selling price.');
      return;
    }
    if (!packSize.trim()) {
      setError('Please specify the unit or pack size (e.g. 500 g, 1 L, 1 pc).');
      return;
    }

    try {
      setLoading(true);
      const targetShopId = shopId || 'shop-default';
      const res = await api.createProduct(targetShopId, {
        name: name.trim(),
        unit: packSize.trim(),
        pricePaise: Math.round(priceNum * 100),
        mrpPaise: Math.round(mrpNum * 100),
        categoryId: categoryId || undefined,
        description: description.trim() || undefined,
        stockQuantity: parseInt(stockQuantity) || 25,
        stockStatus: availableForSale ? 'in_stock' : 'out_of_stock',
        imageKeys: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'],
      });

      if (res.success) {
        setSaved(true);
        setTimeout(() => {
          onSaveSuccess();
        }, 500);
      } else {
        setError('Could not save product. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between font-sans select-none pb-12">
      {/* 1. Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Add product</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Photo Upload / URL container */}
        <div className="border-2 border-dashed border-[#cde5d2] bg-[#f8fdf9] rounded-[24px] p-4 text-center">
          <h3 className="text-sm font-bold text-[#111827]">Product Images</h3>
          <p className="text-xs text-[#6b7280] mt-0.5 mb-3">Add image URLs for this product (up to 4)</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b5e39]"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-[#1b5e39] text-white rounded-xl text-xs font-bold hover:bg-[#155a34] transition"
            >
              Add
            </button>
          </div>

          {imageUrls.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 text-[10px] flex items-center justify-center rounded-bl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Product Name */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Product name *
          </label>
          <input
            type="text"
            placeholder="e.g. Fresh Red Tomatoes, Havells LED Bulb"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
            required
          />
        </div>

        {/* 4. Category */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Pack size & Selling price (2 Columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Pack size / Unit *
            </label>
            <input
              type="text"
              placeholder="e.g. 500 g, 1 L, 1 pc"
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
              className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Selling price (₹) *
            </label>
            <div className="flex items-center h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white focus-within:ring-2 focus-within:ring-[#1b5e39]">
              <span className="text-xs text-slate-400 mr-1.5">₹</span>
              <input
                type="number"
                placeholder="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full text-xs font-medium text-[#111827] focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* 6. MRP & Stock quantity (2 Columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              MRP (₹)
            </label>
            <div className="flex items-center h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white focus-within:ring-2 focus-within:ring-[#1b5e39]">
              <span className="text-xs text-slate-400 mr-1.5">₹</span>
              <input
                type="number"
                placeholder="Optional"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full text-xs font-medium text-[#111827] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Stock quantity
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
            />
          </div>
        </div>

        {/* 7. Description */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Details, specifications or source of this item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39] resize-none"
          />
        </div>

        {/* 8. Available for sale Switch */}
        <div className="bg-white rounded-[20px] p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#111827]">Available for sale</div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">
              Customers in Karanja can immediately discover and order this item
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAvailableForSale(!availableForSale)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              availableForSale ? 'bg-[#1b5e39]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                availableForSale ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 9. Save Product Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-[16px] shadow-sm transition flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Saving to Catalog...' : saved ? 'Saved Successfully!' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
