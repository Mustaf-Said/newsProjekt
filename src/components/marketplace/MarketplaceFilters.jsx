import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function MarketplaceFilters({ filters, setFilters, filterConfig }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-sm text-[var(--text-primary)]">Filters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <Input
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select value={filters.listing_type || "all"} onValueChange={(v) => setFilters({ ...filters, listing_type: v })}>
          <SelectTrigger><SelectValue placeholder="Buy/Rent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sell">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.city || "all"} onValueChange={(v) => setFilters({ ...filters, city: v })}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {(filterConfig?.cities || []).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filterConfig?.extraFilters?.map((ef) => (
          <Select key={ef.key} value={filters[ef.key] || "all"} onValueChange={(v) => setFilters({ ...filters, [ef.key]: v })}>
            <SelectTrigger><SelectValue placeholder={ef.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {ef.label}</SelectItem>
              {ef.options.map(o => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <Button variant="outline" size="sm" onClick={() => setFilters({ search: "", listing_type: "all", city: "all" })} className="flex items-center gap-1">
          <X className="w-3 h-3" /> Clear
        </Button>
      </div>
    </div>
  );
}