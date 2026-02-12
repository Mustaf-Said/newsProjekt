"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send
} from "lucide-react";

export default function ListingDetail() {
  const searchParams = useSearchParams();
  const [imgIdx, setImgIdx] = useState(0);
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);

  const id = searchParams.get("id");
  const type = searchParams.get("type") || "listing";

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, listing_type, category, details, city, price")
        .eq("id", Number(id))
        .single();

      if (error) throw error;
      const details = data?.details || {};
      const images = Array.isArray(details.images)
        ? details.images
        : details.image_url
          ? [details.image_url]
          : details.image
            ? [details.image]
            : [];

      const price = details.price ?? data.price ?? 0;
      const city = details.city ?? data.city ?? "";
      const brand = details.brand ?? details.car_name ?? null;
      const year = details.year ?? details.car_year ?? null;
      const mileage = details.mileage ?? details.mileage_km ?? null;

      return {
        id: data.id,
        title: data.title,
        listing_type: data.listing_type || details.listing_type || "sell",
        category: data.category || type,
        images,
        price,
        currency: details.currency || "$",
        city,
        address: details.address || "",
        description: details.description || details.content || "",
        contact_phone: details.contact_phone || "",
        contact_email: details.contact_email || "",
        brand,
        model: details.model,
        year,
        mileage,
        fuel_type: details.fuel_type,
        transmission: details.transmission,
        condition: details.condition,
        property_type: details.property_type,
        rooms: details.rooms,
        bathrooms: details.bathrooms,
        area_sqm: details.area_sqm,
        floor: details.floor,
        land_type: details.land_type,
        location_details: details.location_details
      };
    }
  });

  const images = useMemo(() => {
    if (!listing?.images || listing.images.length === 0) {
      return [
        listing?.category === "house"
          ? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900"
          : listing?.category === "land"
            ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900"
            : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900"
      ];
    }
    return listing.images;
  }, [listing]);

  const sendMessage = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-[var(--text-secondary)]">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Listing Details</h1>
          <p className="text-sm text-[var(--text-secondary)]">View listing information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
            <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setImgIdx((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-4 left-4">
              <Badge className={`${listing.listing_type === "rent" ? "bg-purple-500" : "bg-emerald-500"} text-white border-0 font-bold`}>
                {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
              </Badge>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">{listing.title}</h1>
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mt-1">
                  <MapPin className="w-4 h-4" /> {listing.city} {listing.address && `• ${listing.address}`}
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-amber-600">
                {listing.currency || "$"}{Number(listing.price || 0).toLocaleString()}
                {listing.listing_type === "rent" && <span className="text-sm font-normal">/mo</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-y border-[var(--border)]">
              {listing.category === "car" && (
                <>
                  {listing.brand && <div><p className="text-xs text-[var(--text-secondary)]">Brand</p><p className="font-bold">{listing.brand} {listing.model}</p></div>}
                  {listing.year && <div><p className="text-xs text-[var(--text-secondary)]">Year</p><p className="font-bold">{listing.year}</p></div>}
                  {listing.mileage && <div><p className="text-xs text-[var(--text-secondary)]">Mileage</p><p className="font-bold">{Number(listing.mileage).toLocaleString()} km</p></div>}
                  {listing.fuel_type && <div><p className="text-xs text-[var(--text-secondary)]">Fuel</p><p className="font-bold capitalize">{listing.fuel_type}</p></div>}
                  {listing.transmission && <div><p className="text-xs text-[var(--text-secondary)]">Transmission</p><p className="font-bold capitalize">{listing.transmission}</p></div>}
                  {listing.condition && <div><p className="text-xs text-[var(--text-secondary)]">Condition</p><p className="font-bold capitalize">{listing.condition}</p></div>}
                </>
              )}
              {listing.category === "house" && (
                <>
                  {listing.property_type && <div><p className="text-xs text-[var(--text-secondary)]">Type</p><p className="font-bold capitalize">{listing.property_type}</p></div>}
                  {listing.rooms && <div><p className="text-xs text-[var(--text-secondary)]">Rooms</p><p className="font-bold">{listing.rooms}</p></div>}
                  {listing.bathrooms && <div><p className="text-xs text-[var(--text-secondary)]">Bathrooms</p><p className="font-bold">{listing.bathrooms}</p></div>}
                  {listing.area_sqm && <div><p className="text-xs text-[var(--text-secondary)]">Area</p><p className="font-bold">{listing.area_sqm} m²</p></div>}
                  {listing.floor && <div><p className="text-xs text-[var(--text-secondary)]">Floor</p><p className="font-bold">{listing.floor}</p></div>}
                </>
              )}
              {listing.category === "land" && (
                <>
                  {listing.area_sqm && <div><p className="text-xs text-[var(--text-secondary)]">Area</p><p className="font-bold">{listing.area_sqm} m²</p></div>}
                  {listing.land_type && <div><p className="text-xs text-[var(--text-secondary)]">Land Type</p><p className="font-bold capitalize">{listing.land_type}</p></div>}
                  {listing.location_details && <div><p className="text-xs text-[var(--text-secondary)]">Location</p><p className="font-bold">{listing.location_details}</p></div>}
                </>
              )}
            </div>

            {listing.description && (
              <div className="mt-5">
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
            <h3 className="font-bold text-lg mb-4">Contact Seller</h3>
            {listing.contact_phone && (
              <a href={`tel:${listing.contact_phone}`} className="flex items-center gap-2 text-sm mb-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Phone className="w-4 h-4" /> {listing.contact_phone}
              </a>
            )}
            {listing.contact_email && (
              <a href={`mailto:${listing.contact_email}`} className="flex items-center gap-2 text-sm mb-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Mail className="w-4 h-4" /> {listing.contact_email}
              </a>
            )}
            <div className="space-y-3">
              <Textarea
                placeholder="Write your message..."
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                rows={4}
              />
              <Button onClick={sendMessage} disabled={sending} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
