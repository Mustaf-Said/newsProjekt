import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "../components/marketplace/ListingCard";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import { Building2, Loader2 } from "lucide-react";

export default function MarketplaceHouses() {
  const [filters, setFilters] = useState({ search: "", listing_type: "all", city: "all", property_type: "all" });
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Favorite.filter({ user_email: u.email, listing_type: "house" }).then(setFavorites);
    }).catch(() => { });
  }, []);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["houses"],
    queryFn: () => base44.entities.HouseListing.filter({ status: "approved" }, "-created_date", 50),
    initialData: [],
  });

  const cities = [...new Set(listings.map(l => l.city).filter(Boolean))];

  const filtered = listings.filter(l => {
    if (filters.search && !l.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.listing_type !== "all" && l.listing_type !== filters.listing_type) return false;
    if (filters.city !== "all" && l.city !== filters.city) return false;
    if (filters.property_type !== "all" && l.property_type !== filters.property_type) return false;
    return true;
  });

  const toggleFavorite = async (listingId) => {
    if (!user) return base44.auth.redirectToLogin();
    const existing = favorites.find(f => f.listing_id === listingId);
    if (existing) {
      await base44.entities.Favorite.delete(existing.id);
      setFavorites(favorites.filter(f => f.id !== existing.id));
    } else {
      const fav = await base44.entities.Favorite.create({ listing_type: "house", listing_id: listingId, user_email: user.email });
      setFavorites([...favorites, fav]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Houses & Apartments</h1>
          <p className="text-sm text-[var(--text-secondary)]">{filtered.length} listings available</p>
        </div>
      </div>

      <MarketplaceFilters
        filters={filters}
        setFilters={setFilters}
        filterConfig={{
          cities,
          extraFilters: [
            { key: "property_type", label: "Type", options: ["villa", "apartment", "house", "studio", "penthouse"] },
          ]
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">No houses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((l, i) => (
            <ListingCard key={l.id} listing={l} type="house" index={i} isFavorite={favorites.some(f => f.listing_id === l.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}