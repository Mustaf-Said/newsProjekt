"use client";

import Link from "next/link";
import { createPageUrl } from "@/utils";
import { MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type ListingCardProps = {
  listing: any;
  type: string;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (listingId: string) => void;
};

export default function ListingCard({ listing, type, index, isFavorite, onToggleFavorite }: ListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-all duration-300"
    >
      <Link href={createPageUrl(`ListingDetail?type=${type}&id=${listing.id}`)}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={listing.images?.[0] || (type === "car"
              ? "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600"
              : type === "house"
                ? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"
                : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"
            )}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${listing.listing_type === "rent" ? "bg-purple-500" : "bg-emerald-500"} text-white border-0 text-[10px] font-bold uppercase`}>
              {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
            </Badge>
            {listing.is_featured && (
              <Badge className="bg-amber-500 text-white border-0 text-[10px] font-bold uppercase">Featured</Badge>
            )}
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(listing.id); }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${isFavorite ? "bg-red-500 text-white" : "bg-black/20 text-white hover:bg-red-500"
                }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
            </button>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-amber-600 transition-colors">
            {listing.title}
          </h3>
        </div>
        <p className="text-xl font-black text-amber-600 mb-2">
          {listing.currency || "$"}{listing.price?.toLocaleString()}
          {listing.listing_type === "rent" && <span className="text-sm font-normal text-[var(--text-secondary)]">/mo</span>}
        </p>

        <div className="flex flex-wrap gap-2 mb-3 text-xs text-[var(--text-secondary)]">
          {type === "car" && (
            <>
              {listing.brand && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">{listing.brand}</span>}
              {listing.year && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">{listing.year}</span>}
              {listing.condition && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded capitalize">{listing.condition}</span>}
            </>
          )}
          {type === "house" && (
            <>
              {listing.rooms && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">{listing.rooms} rooms</span>}
              {listing.area_sqm && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">{listing.area_sqm} m²</span>}
              {listing.property_type && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded capitalize">{listing.property_type}</span>}
            </>
          )}
          {type === "land" && (
            <>
              {listing.area_sqm && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded">{listing.area_sqm} m²</span>}
              {listing.land_type && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded capitalize">{listing.land_type}</span>}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          <MapPin className="w-3 h-3" />
          {listing.city}
        </div>
      </div>
    </motion.div>
  );
}
