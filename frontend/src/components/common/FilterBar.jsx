import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCrop,
  onCropChange,
  selectedState,
  onStateChange,
  onLocationClick
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search market, district, commodity..."
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Crops</option>
            <option value="Onion">Onion</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Paddy">Paddy</option>
            <option value="Cotton">Cotton</option>
            <option value="Chilli">Chilli</option>
          </select>
        </div>

        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="All">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Punjab">Punjab</option>
        </select>

        {onLocationClick && (
          <button
            onClick={onLocationClick}
            className="inline-flex items-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition-all ml-auto md:ml-0"
          >
            <MapPin className="w-4 h-4" />
            <span>Use My Location</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
