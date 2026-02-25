"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import ListingCard from "@/components/marketplace/ListingCard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import { Building2, Loader2 } from "lucide-react";

type Listing = {
  id: number;
  title: string;
  listing_type: string;
  price: number;
  currency?: string | null;
  city?: string | null;
  images?: string[];
  property_type?: string | null;
  rooms?: number | null;
  area_sqm?: number | null;
  is_featured?: boolean;
};

export default function MarketplaceHouses() {
  const [filters, setFilters] = useState({
    search: "",
    listing_type: "all",
    city: "all",
    property_type: "all"
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["marketplace-houses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, listing_type, details, city, price")
        .eq("status", "approved")
        .eq("category", "house")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const details = row.details || {};
        const images = Array.isArray(details.images)
          ? details.images
          : details.image_url
            ? [details.image_url]
            : details.image
              ? [details.image]
              : [];
        const price = details.price ?? row.price ?? 0;
        const city = details.city ?? row.city ?? null;

        return {
          id: row.id,
          title: row.title,
          listing_type: row.listing_type || details.listing_type || "sell",
          price: Number(price) || 0,
          currency: details.currency || "$",
          city,
          images,
          property_type: details.property_type || null,
          rooms: Number(details.rooms) || null,
          area_sqm: Number(details.area_sqm) || null,
          is_featured: details.is_featured || false
        } as Listing;
      });
    },
    initialData: []
  });

  const filterConfig = useMemo(() => {
    const cities = Array.from(new Set(listings.map((item) => item.city).filter(Boolean))) as string[];
    const propertyTypes = Array.from(new Set(listings.map((item) => item.property_type).filter(Boolean))) as string[];
    return {
      cities,
      listingTypes: ["sell", "rent"],
      extraFilters: [
        { key: "property_type", label: "Property Type", options: propertyTypes }
      ]
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const term = filters.search.toLowerCase();
    return listings.filter((item) => {
      if (filters.listing_type !== "all" && item.listing_type !== filters.listing_type) return false;
      if (filters.city !== "all" && item.city !== filters.city) return false;
      if (filters.property_type !== "all" && item.property_type !== filters.property_type) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        (item.city || "").toLowerCase().includes(term) ||
        (item.property_type || "").toLowerCase().includes(term)
      );
    });
  }, [filters, listings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Houses & Apartments</h1>
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
          <Building2 className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p>No approved house listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item, index) => (
            <ListingCard key={item.id} listing={item} type="house" index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
