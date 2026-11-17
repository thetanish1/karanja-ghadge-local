import React, { useState } from 'react';
import { ArrowLeft, Search, Star, Clock, MapPin, ChevronRight } from 'lucide-react';

interface ShopsPageProps {
  onBack: () => void;
  onSelectShop: (shopId: string) => void;
  onOpenSearch: () => void;
}

export const ShopsPage: React.FC<ShopsPageProps> = ({
  onBack,
  onSelectShop,
  onOpenSearch,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'under20' | 'topRated'>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'cloth', label: 'Cloth & Wear' },
    { id: 'mobile', label: 'Mobile & Acc.' },
    { id: 'electric', label: 'Electric & Wire' },
    { id: 'electronic', label: 'TV, AC, Fridge' },
    { id: 'fireworks', label: 'Fireworks' },
    { id: 'grocery', label: 'Grocery' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'bakery', label: 'Bakery' },
  ];

  const shops = [
    {
      id: 'shop-gupta',
      categoryId: 'grocery',
      name: 'Gupta Fresh Mart',
      category: 'Grocery & vegetables',
      rating: '4.8',
      time: '18–24 min',
      distance: '0.8 km',
      offer: '₹100 off on orders above ₹499',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-morning',
      categoryId: 'dairy',
      name: 'Morning Dairy',
      category: 'Milk, paneer & daily needs',
      rating: '4.7',
      time: '12–18 min',
      distance: '1.1 km',
      offer: 'Free morning delivery',
      image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-ganesh-cloth',
      categoryId: 'cloth',
      name: 'Shree Ganesh Cloth Center',
      category: 'Men, women & kids fashion, cotton shirts & sarees',
      rating: '4.9',
      time: '20–30 min',
      distance: '0.6 km',
      offer: 'Festive discounts available',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-sai-mobile',
      categoryId: 'mobile',
      name: 'Sai Mobile Care & Gadgets',
      category: 'Smartphones, covers, fast chargers & accessories',
      rating: '4.8',
      time: '15–25 min',
      distance: '0.9 km',
      offer: 'Screen guard offer with every cover',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-pawan-electric',
      categoryId: 'electric',
      name: 'Pawan Electricals',
      category: 'Polycab wires, LED bulbs, switches & decorative lighting',
      rating: '4.8',
      time: '20–25 min',
      distance: '1.2 km',
      offer: '10% off on lighting rolls',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-mahalaxmi-el',
      categoryId: 'electronic',
      name: 'Mahalaxmi Electronics',
      category: 'Smart LED TV, Inverter AC, Refrigerators & Coolers',
      rating: '4.9',
      time: '30–45 min',
      distance: '1.5 km',
      offer: 'Free installation in Karanja',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-utsav-fireworks',
      categoryId: 'fireworks',
      name: 'Utsav Fireworks & Crackers',
      category: 'Electric sparklers, ground chakri & sky shots',
      rating: '4.8',
      time: '15–20 min',
      distance: '1.0 km',
      offer: 'Standard certified green crackers',
      image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'shop-bread',
      categoryId: 'bakery',
      name: 'The Bread House',
      category: 'Bakery & confectionery',
      rating: '4.6',
      time: '25–30 min',
      distance: '1.4 km',
      offer: 'Freshly baked daily at 7 AM',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const filteredShops = shops.filter((s) => {
    if (categoryFilter !== 'all' && s.categoryId !== categoryFilter) return false;
    if (filter === 'under20' && !s.time.includes('12') && !s.time.includes('15') && !s.time.includes('18')) return false;
    if (filter === 'topRated' && parseFloat(s.rating) < 4.8) return false;
    return true;
  });

  return (
    <div className="space-y-4 px-4 pt-3 pb-24 font-sans select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[#111827]">Shops near you</h1>
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-[#1b5e39] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Filter Pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('under20')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            filter === 'under20'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ⚡ Under 20 min
        </button>
        <button
          onClick={() => setFilter('topRated')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            filter === 'topRated'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ★ Top rated
        </button>
      </div>

      {/* Local Stores Delivery Banner */}
      <div className="bg-[#e8f3ea]/50 border border-[#cde5d2] rounded-[18px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1b5e39] text-white flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#111827]">
            {filteredShops.length} stores deliver to your location
          </div>
          <div className="text-[11px] text-[#6b7280]">Karanja (Ghadge) • within 2 km</div>
        </div>
      </div>

      {/* Store Cards */}
      <div className="space-y-3">
        {filteredShops.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No shops found under this category filter.
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-xs hover:border-[#1b5e39] transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{shop.name}</h3>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#e8f3ea] text-[#1b5e39] px-1.5 py-0.5 rounded-md">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {shop.rating}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b7280] mt-0.5">{shop.category}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{shop.time}</span>
                      <span>•</span>
                      <span>{shop.distance}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>

              {shop.offer && (
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 text-[11px] font-bold text-[#1b5e39]">
                  {shop.offer}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* AapnaCart Community Mission Card */}
      <div className="bg-[#f0f7f2] border border-[#d6ecda] rounded-[24px] p-5 text-center space-y-2 mt-4">
        <div className="flex justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1b5e39] flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" />
              <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" />
            </svg>
          </div>
          <div className="text-lg font-extrabold tracking-tight leading-none">
            <span className="text-[#1b5e39]">Aapna</span>
            <span className="text-[#f97316]">Cart</span>
          </div>
        </div>
        <p className="text-xs text-[#6b7280]">
          Every order supports a business in your neighbourhood.
        </p>
      </div>

    </div>
  );
};
