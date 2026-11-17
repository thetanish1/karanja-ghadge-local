import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface AddProductPageProps {
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({
  onBack,
  onSaveSuccess,
}) => {
  const [name, setName] = useState('Fresh Green Capsicum');
  const [category, setCategory] = useState('Vegetables');
  const [packSize, setPackSize] = useState('500 g');
  const [sellingPrice, setSellingPrice] = useState('48');
  const [mrp, setMrp] = useState('60');
  const [stockQuantity, setStockQuantity] = useState('24');
  const [description, setDescription] = useState('Fresh, crisp green capsicum sourced from local farms.');
  const [availableForSale, setAvailableForSale] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      onSaveSuccess();
    }, 600);
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
        
        {/* 2. Dashed Photo Upload Container */}
        <div className="border-2 border-dashed border-[#cde5d2] bg-[#f8fdf9] rounded-[24px] p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-[#eef8f1] transition">
          <div className="w-12 h-12 rounded-full bg-white text-[#1b5e39] border border-slate-200/80 flex items-center justify-center shadow-xs mb-2.5">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-bold text-[#111827]">Add product photos</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">Upload up to 4 clear images</p>
        </div>

        {/* 3. Product Name */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Product name
          </label>
          <input
            type="text"
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
          >
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Grocery">Grocery</option>
            <option value="Bakery">Bakery</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>

        {/* 5. Pack size & Selling price (2 Columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Pack size
            </label>
            <input
              type="text"
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
              className="w-full h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1b5e39]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Selling price
            </label>
            <div className="flex items-center h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white focus-within:ring-2 focus-within:ring-[#1b5e39]">
              <span className="text-xs text-slate-400 mr-1.5">₹</span>
              <input
                type="number"
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
              MRP
            </label>
            <div className="flex items-center h-12 px-4 rounded-[16px] border border-[#e2e8f0] bg-white focus-within:ring-2 focus-within:ring-[#1b5e39]">
              <span className="text-xs text-slate-400 mr-1.5">₹</span>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full text-xs font-medium text-[#111827] focus:outline-none"
                required
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
              required
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
              Customers can see and order this item
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
            className="w-full h-13 bg-[#1b5e39] hover:bg-[#164d2d] active:scale-[0.99] text-white font-bold text-sm rounded-[16px] shadow-sm transition flex items-center justify-center cursor-pointer"
          >
            {saved ? 'Saved!' : 'Save product'}
          </button>
        </div>

      </form>

    </div>
  );
};
