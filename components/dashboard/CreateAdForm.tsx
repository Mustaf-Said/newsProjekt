"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

type CreateAdFormProps = {
  onSuccess?: () => void;
};

export default function CreateAdForm({ onSuccess }: CreateAdFormProps) {
  const [type, setType] = useState("car");
  const [data, setData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: any) => setData((prev) => ({ ...prev, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const fileUrl = URL.createObjectURL(file);
        setImages((prev) => [...prev, fileUrl]);
      }
    } finally {
      setUploading(false);
    }
  };

  const revokeObjectUrl = (url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const removed = prev[idx];
      if (removed) {
        revokeObjectUrl(removed);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Ad saved locally. Server sync is disabled.");
    setData({});
    setImages((prev) => {
      prev.forEach(revokeObjectUrl);
      return [];
    });
    setSaving(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Listing Type</Label>
        <Select value={type} onValueChange={(v) => { setType(v); setData({}); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="house">House / Apartment</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Title *</Label><Input value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></div>
        <div><Label>City *</Label><Input value={data.city || ""} onChange={(e) => set("city", e.target.value)} /></div>
        <div><Label>Price *</Label><Input type="number" value={data.price || ""} onChange={(e) => set("price", e.target.value)} /></div>
        <div>
          <Label>Sell / Rent</Label>
          <Select value={data.listing_type || "sell"} onValueChange={(v) => set("listing_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sell">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "car" && (
          <>
            <div><Label>Brand</Label><Input value={data.brand || ""} onChange={(e) => set("brand", e.target.value)} /></div>
            <div><Label>Model</Label><Input value={data.model || ""} onChange={(e) => set("model", e.target.value)} /></div>
            <div><Label>Year</Label><Input type="number" value={data.year || ""} onChange={(e) => set("year", e.target.value)} /></div>
            <div><Label>Mileage (km)</Label><Input type="number" value={data.mileage || ""} onChange={(e) => set("mileage", e.target.value)} /></div>
            <div>
              <Label>Condition</Label>
              <Select value={data.condition || "used"} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="used">Used</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select value={data.fuel_type || ""} onValueChange={(v) => set("fuel_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === "house" && (
          <>
            <div>
              <Label>Property Type</Label>
              <Select value={data.property_type || "apartment"} onValueChange={(v) => set("property_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem><SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem><SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Rooms</Label><Input type="number" value={data.rooms || ""} onChange={(e) => set("rooms", e.target.value)} /></div>
            <div><Label>Bathrooms</Label><Input type="number" value={data.bathrooms || ""} onChange={(e) => set("bathrooms", e.target.value)} /></div>
            <div><Label>Area (m²)</Label><Input type="number" value={data.area_sqm || ""} onChange={(e) => set("area_sqm", e.target.value)} /></div>
          </>
        )}

        {type === "land" && (
          <>
            <div><Label>Area (m²) *</Label><Input type="number" value={data.area_sqm || ""} onChange={(e) => set("area_sqm", e.target.value)} /></div>
            <div>
              <Label>Land Type</Label>
              <Select value={data.land_type || "residential"} onValueChange={(v) => set("land_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem><SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Location Details</Label><Input value={data.location_details || ""} onChange={(e) => set("location_details", e.target.value)} /></div>
          </>
        )}

        <div><Label>Contact Phone</Label><Input value={data.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} /></div>
        <div><Label>Contact Email</Label><Input value={data.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} /></div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={data.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} />
      </div>

      <div>
        <Label>Images</Label>
        <div className="flex flex-wrap gap-3 mt-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--border)]">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-[var(--text-secondary)]" />}
            <span className="text-[10px] text-[var(--text-secondary)] mt-1">Upload</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={saving || !data.title || !data.price || !data.city} className="bg-amber-500 hover:bg-amber-600 text-white">
        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit Ad for Approval
      </Button>
    </div>
  );
}
