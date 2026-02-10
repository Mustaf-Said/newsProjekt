import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Mail, Heart, ChevronLeft, ChevronRight, Send, Loader2, Car, Building2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function ListingDetail() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const id = params.get("id");

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => { });
  }, []);

  useEffect(() => {
    async function load() {
      const entityMap = { car: "CarListing", house: "HouseListing", land: "LandListing" };
      const entityName = entityMap[type];
      if (!entityName || !id) { setLoading(false); return; }
      const items = await base44.entities[entityName].filter({ id }, null, 1);
      setListing(items[0] || null);
      setLoading(false);
    }
    load();
  }, [type, id]);

  const sendMessage = async () => {
    if (!user) return base44.auth.redirectToLogin();
    if (!msgBody.trim()) return;
    setSending(true);
    await base44.entities.Message.create({
      from_email: user.email,
      from_name: user.full_name || user.email,
      to_email: listing.created_by || listing.contact_email,
      subject: `Inquiry about: ${listing.title}`,
      body: msgBody,
      listing_type: type,
      listing_id: id,
    });
    setMsgBody("");
    setSending(false);
    toast.success("Message sent successfully!");
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  if (!listing) return <div className="text-center py-20 text-[var(--text-secondary)]">Listing not found</div>;

  const images = listing.images?.length > 0 ? listing.images : [
    type === "car" ? "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800" :
      type === "house" ? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800" :
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
  ];

  const Icon = type === "car" ? Car : type === "house" ? Building2 : Map;
  const backPage = type === "car" ? "MarketplaceCars" : type === "house" ? "MarketplaceHouses" : "MarketplaceLand";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to={createPageUrl(backPage)} className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-500 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
            <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(p => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setImgIdx(p => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />)}
                </div>
              </>
            )}
            <div className="absolute top-4 left-4">
              <Badge className={`${listing.listing_type === "rent" ? "bg-purple-500" : "bg-emerald-500"} text-white border-0 font-bold`}>
                {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">{listing.title}</h1>
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mt-1">
                  <MapPin className="w-4 h-4" /> {listing.city} {listing.address && `• ${listing.address}`}
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-amber-600">
                {listing.currency || "$"}{listing.price?.toLocaleString()}
                {listing.listing_type === "rent" && <span className="text-sm font-normal">/mo</span>}
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-y border-[var(--border)]">
              {type === "car" && (
                <>
                  {listing.brand && <div><p className="text-xs text-[var(--text-secondary)]">Brand</p><p className="font-bold">{listing.brand} {listing.model}</p></div>}
                  {listing.year && <div><p className="text-xs text-[var(--text-secondary)]">Year</p><p className="font-bold">{listing.year}</p></div>}
                  {listing.mileage && <div><p className="text-xs text-[var(--text-secondary)]">Mileage</p><p className="font-bold">{listing.mileage?.toLocaleString()} km</p></div>}
                  {listing.fuel_type && <div><p className="text-xs text-[var(--text-secondary)]">Fuel</p><p className="font-bold capitalize">{listing.fuel_type}</p></div>}
                  {listing.transmission && <div><p className="text-xs text-[var(--text-secondary)]">Transmission</p><p className="font-bold capitalize">{listing.transmission}</p></div>}
                  {listing.condition && <div><p className="text-xs text-[var(--text-secondary)]">Condition</p><p className="font-bold capitalize">{listing.condition}</p></div>}
                </>
              )}
              {type === "house" && (
                <>
                  {listing.property_type && <div><p className="text-xs text-[var(--text-secondary)]">Type</p><p className="font-bold capitalize">{listing.property_type}</p></div>}
                  {listing.rooms && <div><p className="text-xs text-[var(--text-secondary)]">Rooms</p><p className="font-bold">{listing.rooms}</p></div>}
                  {listing.bathrooms && <div><p className="text-xs text-[var(--text-secondary)]">Bathrooms</p><p className="font-bold">{listing.bathrooms}</p></div>}
                  {listing.area_sqm && <div><p className="text-xs text-[var(--text-secondary)]">Area</p><p className="font-bold">{listing.area_sqm} m²</p></div>}
                  {listing.floor && <div><p className="text-xs text-[var(--text-secondary)]">Floor</p><p className="font-bold">{listing.floor}</p></div>}
                </>
              )}
              {type === "land" && (
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
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