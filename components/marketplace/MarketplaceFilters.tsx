"use client";

import type { Dispatch, SetStateAction } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type FilterOption = {
  key: string;
  label: string;
  options: string[];
};

type FilterConfig = {
  cities?: string[];
  listingTypes?: string[];
  extraFilters?: FilterOption[];
};

type MarketplaceFiltersProps = {
  filters: Record<string, string>;
  setFilters: Dispatch<SetStateAction<Record<string, string>>>;
  filterConfig?: FilterConfig;
};

const DEFAULT_LISTING_TYPES = ["sell", "rent"];

export default function MarketplaceFilters({ filters, setFilters, filterConfig }: MarketplaceFiltersProps) {
  const cities = filterConfig?.cities || [];
  const listingTypes = filterConfig?.listingTypes || DEFAULT_LISTING_TYPES;
  const extraFilters = filterConfig?.extraFilters || [];

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const reset: Record<string, string> = {};
    Object.keys(filters).forEach((key) => {
      reset[key] = key === "search" ? "" : "all";
    });
    setFilters(reset);
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          Filters
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-[var(--text-secondary)]">Search</label>
          <div className="mt-1 flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] px-3 py-2">
            <Search className="w-4 h-4 text-[var(--text-secondary)]" />
            <input
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search listings"
              className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)]">City</label>
          <select
            value={filters.city || "all"}
            onChange={(e) => updateFilter("city", e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {filters.listing_type !== undefined && (
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Listing Type</label>
            <select
              value={filters.listing_type || "all"}
              onChange={(e) => updateFilter("listing_type", e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="all">All</option>
              {listingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {extraFilters.map((filter) => (
          <div key={filter.key}>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">{filter.label}</label>
            <select
              value={filters[filter.key] || "all"}
              onChange={(e) => updateFilter(filter.key, e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="all">All</option>
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
