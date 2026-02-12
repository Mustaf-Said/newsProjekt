"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import ListingCard from "@/components/marketplace/ListingCard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import { Car, Loader2 } from "lucide-react";

type Listing = {
  id: number;
  title: string;
  listing_type: string;
  price: number;
  currency?: string | null;
  city?: string | null;
  images?: string[];
  brand?: string | null;
  year?: number | null;
  condition?: string | null;
  is_featured?: boolean;
};

export default function MarketplaceCars() {
  const [filters, setFilters] = useState({ search: "", listing_type: "all", city: "all", brand: "all", condition: "all" });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["marketplace-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, listing_type, details")
        .eq("status", "approved")
        .eq("category", "car")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const details = row.details || {};
        return {
          id: row.id,
          title: row.title,
          listing_type: row.listing_type || details.listing_type || "sell",
          price: Number(details.price) || 0,
          currency: details.currency || "$",
          city: details.city || null,
          images: details.images || [],
          brand: details.brand || null,
          year: details.year || null,
          condition: details.condition || null,
          is_featured: details.is_featured || false
        } as Listing;
      });
    },
    initialData: []
  });

  const filterConfig = useMemo(() => {
    const cities = Array.from(new Set(listings.map((item) => item.city).filter(Boolean))) as string[];
    const brands = Array.from(new Set(listings.map((item) => item.brand).filter(Boolean))) as string[];
    const conditions = Array.from(new Set(listings.map((item) => item.condition).filter(Boolean))) as string[];
    return {
      cities,
      listingTypes: ["sell", "rent"],
      extraFilters: [
        { key: "brand", label: "Brand", options: brands },
        { key: "condition", label: "Condition", options: conditions }
      ]
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const term = filters.search.toLowerCase();
    return listings.filter((item) => {
      if (filters.listing_type !== "all" && item.listing_type !== filters.listing_type) return false;
      if (filters.city !== "all" && item.city !== filters.city) return false;
      if (filters.brand !== "all" && item.brand !== filters.brand) return false;
      if (filters.condition !== "all" && item.condition !== filters.condition) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        (item.city || "").toLowerCase().includes(term) ||
        (item.brand || "").toLowerCase().includes(term)
      );
    });
  }, [filters, listings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Cars</h1>
          <p className="text-sm text-[var(--text-secondary)]">Marketplace</p>
        </div>
      </div>

      <MarketplaceFilters filters={filters} setFilters={setFilters} filterConfig={filterConfig} />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <Car className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p>No approved car listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item, index) => (
            <ListingCard key={item.id} listing={item} type="car" index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
