import React from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  statusOptions = [],
  sortOption,
  onSortChange,
  sortOptions = [],
  placeholder = "Search by ID, code or name..."
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9CA3AF]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg text-sm text-slate-900 dark:text-[#F5F6F8] placeholder-slate-400 dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#0284C7] dark:focus:border-[#06B6D4] transition-colors font-sans"
        />
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-3 flex-wrap">
        {statusOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-[#9CA3AF]" />
            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg text-xs font-mono text-slate-900 dark:text-[#F5F6F8] px-3 py-2 focus:outline-none focus:border-[#0284C7] dark:focus:border-[#06B6D4]"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {sortOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-[#9CA3AF]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg text-xs font-mono text-slate-900 dark:text-[#F5F6F8] px-3 py-2 focus:outline-none focus:border-[#0284C7] dark:focus:border-[#06B6D4]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
