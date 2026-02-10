import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "../components/marketplace/ListingCard";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import { Car, Loader2 } from "lucide-react";

export default function MarketplaceCars() {
  const [filters, setFilters] = useState({ search: "", listing_type: "all", city: "all", brand: "all", condition: "all" });
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Favorite.filter({ user_email: u.email, listing_type: "car" }).then(setFavorites);
    }).catch(() => { });
  }, []);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: () => base44.entities.CarListing.filter({ status: "approved" }, "-created_date", 50),
    initialData: [],
  });

  const cities = [...new Set(listings.map(l => l.city).filter(Boolean))];
  const brands = [...new Set(listings.map(l => l.brand).filter(Boolean))];

  const filtered = listings.filter(l => {
    if (filters.search && !l.title?.toLowerCase().includes(filters.search.toLowerCase()) && !l.brand?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.listing_type !== "all" && l.listing_type !== filters.listing_type) return false;
    if (filters.city !== "all" && l.city !== filters.city) return false;
    if (filters.brand !== "all" && l.brand !== filters.brand) return false;
    if (filters.condition !== "all" && l.condition !== filters.condition) return false;
    return true;
  });

  const toggleFavorite = async (listingId) => {
    if (!user) return base44.auth.redirectToLogin();
    const existing = favorites.find(f => f.listing_id === listingId);
    if (existing) {
      await base44.entities.Favorite.delete(existing.id);
      setFavorites(favorites.filter(f => f.id !== existing.id));
    } else {
      const fav = await base44.entities.Favorite.create({ listing_type: "car", listing_id: listingId, user_email: user.email });
      setFavorites([...favorites, fav]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Cars</h1>
          <p className="text-sm text-[var(--text-secondary)]">{filtered.length} listings available</p>
        </div>
      </div>

      <MarketplaceFilters
        filters={filters}
        setFilters={setFilters}
        filterConfig={{
          cities,
          extraFilters: [
            { key: "brand", label: "Brand", options: brands },
            { key: "condition", label: "Condition", options: ["new", "used"] },
          ]
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Car className="w-16 h-16 mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">No cars found</p>
          <p className="text-sm text-[var(--text-secondary)]">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((l, i) => (
            <ListingCard
              key={l.id}
              listing={l}
              type="car"
              index={i}
              isFavorite={favorites.some(f => f.listing_id === l.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}