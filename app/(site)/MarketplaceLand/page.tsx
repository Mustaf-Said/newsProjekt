"use client";

import { useState } from "react";
import { Map } from "lucide-react";

export default function MarketplaceLand() {
  const [filters, setFilters] = useState({ search: "", listing_type: "all", city: "all", land_type: "all" });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <Map className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Land</h1>
          <p className="text-sm text-[var(--text-secondary)]">Marketplace</p>
        </div>
      </div>

      <div className="text-center py-20">
        <Map className="w-16 h-16 mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
        <p className="text-lg font-semibold text-[var(--text-secondary)]">Marketplace temporarily unavailable</p>
        <p className="text-sm text-[var(--text-secondary)]">This feature is currently being updated</p>
      </div>
    </div>
  );
}
