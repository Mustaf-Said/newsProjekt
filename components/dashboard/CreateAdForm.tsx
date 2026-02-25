"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

type CreateAdFormProps = {
  onSuccess?: () => void;
};

const DEFAULT_LISTING_IMAGE_BY_TYPE: Record<string, string> = {
  car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
  house: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
  other: "/contactMe.jpg"
};

const getErrorMessage = (error: unknown) => {
  if (!error) {
    return "Unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const candidate = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    const parts = [candidate.message, candidate.details, candidate.hint, candidate.code]
      .filter(Boolean)
      .map((value) => String(value));

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    const ownProps = Object.getOwnPropertyNames(error);
    if (ownProps.length > 0) {
      const serialized = ownProps
        .map((key) => {
          const value = (error as Record<string, unknown>)[key];
          return `${key}: ${String(value)}`;
        })
        .join(", ");

      if (serialized) {
        return serialized;
      }
    }
  }

  return "Unknown error";
};

const ensureProfileExists = async (userId: string) => {
  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileReadError) {
    return {
      ok: false,
      message: getErrorMessage(profileReadError)
    };
  }

  if (existingProfile?.id) {
    return { ok: true };
  }

  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;

  const { error: profileInsertError } = await supabase.from("profiles").insert({
    id: userId,
    email: authUser?.email || null,
    full_name: authUser?.user_metadata?.full_name || null
  });

  if (profileInsertError) {
    return {
      ok: false,
      message: getErrorMessage(profileInsertError)
    };
  }

  return { ok: true };
};

export default function CreateAdForm({ onSuccess }: CreateAdFormProps) {
  const [type, setType] = useState("car");
  const [data, setData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const set = (key: string, val: any) => setData((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (error) {
        setUserId(null);
        return;
      }
      setUserId(data.user?.id || null);
    };
    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }
    if (!userId) {
      toast.error("Please sign in to upload images.");
      return;
    }
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: formData
        });

        const result = await response.json();

        if (!response.ok || !result?.url) {
          console.error(result);
          toast.error(`Failed to upload ${file.name}. ${result?.error || "Please try again."}`);
          continue;
        }

        uploadedUrls.push(result.url);
      }
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
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

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput("");
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please sign in to create an ad.");
      return;
    }
    const title = String(data.title || "").trim();
    const city = String(data.city || "").trim();
    const description = String(data.description || "").trim();
    const price = Number(data.price);

    if (!title || !city || !Number.isFinite(price) || price <= 0) {
      toast.error("Please add title, city, and a valid price.");
      return;
    }

    if (type === "other" && !description) {
      toast.error("Please add description for Other listings.");
      return;
    }

    const profileState = await ensureProfileExists(userId);
    if (!profileState.ok) {
      toast.error(`Your profile is not ready yet. ${profileState.message}`);
      return;
    }

    setSaving(true);
    const cleanImages = images.filter((url) => !url.startsWith("blob:"));
    const defaultImage = DEFAULT_LISTING_IMAGE_BY_TYPE[type] || DEFAULT_LISTING_IMAGE_BY_TYPE.other;
    const finalImages = cleanImages.length > 0 ? cleanImages : [defaultImage];

    const baseDetails = {
      city: data.city || null,
      price: Number(data.price) || 0,
      listing_type: data.listing_type || "sell",
      contact_name: data.contact_name || null,
      contact_phone: data.contact_phone || null,
      contact_email: data.contact_email || null,
      images: finalImages
    };

    let details: Record<string, any> = { ...baseDetails };
    if (type === "car") {
      details = {
        ...details,
        brand: data.brand || null,
        car_name: data.brand || null,
        model: data.model || null,
        year: Number(data.year) || null,
        car_year: Number(data.year) || null,
        mileage: Number(data.mileage) || null,
        mileage_km: Number(data.mileage) || null,
        condition: data.condition || "used",
        fuel_type: data.fuel_type || null,
        transmission: data.transmission || null
      };
    }
    if (type === "house") {
      details = {
        ...details,
        property_type: data.property_type || "apartment",
        rooms: Number(data.rooms) || null,
        bathrooms: Number(data.bathrooms) || null,
        area_sqm: Number(data.area_sqm) || null,
        address: data.address || null
      };
    }
    if (type === "land") {
      details = {
        ...details,
        land_type: data.land_type || "residential",
        area_sqm: Number(data.area_sqm) || null,
        location_details: data.location_details || null
      };
    }
    if (type === "other") {
      details = {
        ...details,
        condition: data.condition || "used",
        item_details: data.description || null
      };
    }

    const { error } = await supabase.from("announcements").insert({
      user_id: userId,
      title,
      content: description,
      type: "listing",
      category: type,
      listing_type: data.listing_type || "sell",
      city,
      price,
      details,
      status: "pending"
    });

    if (error) {
      const message = getErrorMessage(error);
      console.error("Failed to submit ad", error, message);
      if (message.includes("category_check") && type === "other") {
        toast.error("Database does not allow category 'other' yet. Run fix_announcements_category_check.sql in Supabase SQL Editor.");
      } else if (message.includes("announcements_user_id_fkey") || message.includes("23503")) {
        toast.error("Your account profile is missing. Please sign out and sign in again, then retry.");
      } else {
        toast.error(`Failed to submit ad. ${message}`);
      }
      setSaving(false);
      return;
    }

    toast.success("Ad submitted for approval!");
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
            <SelectItem value="other">Other</SelectItem>
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
            <div><Label>Car name</Label><Input value={data.brand || ""} onChange={(e) => set("brand", e.target.value)} /></div>
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
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
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

        {type === "other" && (
          <>
            <div>
              <Label>Condition *</Label>
              <Select value={data.condition || "used"} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div><Label>Name</Label><Input value={data.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} /></div>
        <div><Label>Mobile</Label><Input value={data.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} /></div>
        <div><Label>Contact Email</Label><Input value={data.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} /></div>
      </div>

      <div>
        <Label>{type === "other" ? "Description (Explain what item is)" : "Description"}</Label>
        <Textarea value={data.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} />
      </div>

      <div>
        <Label>Images</Label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Input
            placeholder="Paste image URL"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addImageUrl}>
            Add URL
          </Button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Uploaded files are stored in Supabase Storage. You can also paste image URLs.
        </p>
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

      <Button onClick={handleSubmit} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit Ad for Approval
      </Button>
      <p className="text-xs text-[var(--text-secondary)]">This announcement is published after admin approval.</p>
    </div>
  );
}
