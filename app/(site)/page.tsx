import { getSupabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import NewsGrid from "@/components/home/NewsGrid";
import WeatherWidget from "@/components/home/WeatherWidget";
import CurrencyWidget from "@/components/home/CurrencyWidget";
import LiveScoresWidget from "@/components/home/LiveScoresWidget";
import ListingCard from "@/components/marketplace/ListingCard";
import type { Database } from "@/lib/database.types";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type AnnouncementCategory = "car" | "house" | "land" | "other";

type ListingItem = {
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
  rooms?: number | null;
  area_sqm?: number | null;
  property_type?: string | null;
  land_type?: string | null;
  is_featured?: boolean;
};

async function getArticles(category: ArticleRow["category"], limit: number): Promise<ArticleRow[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[home] Failed to load ${category} articles`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return data || [];
}

async function getApprovedListings(category: AnnouncementCategory, limit = 6): Promise<ListingItem[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("announcements")
    .select("id, title, listing_type, details, city, price")
    .eq("status", "approved")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[home] Failed to load ${category} listings`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return (data || []).map((row: any) => {
    const detailsRaw = row?.details;
    const details = (detailsRaw && typeof detailsRaw === "object" && !Array.isArray(detailsRaw))
      ? (detailsRaw as Record<string, any>)
      : {};

    const images = Array.isArray(details.images)
      ? details.images
      : details.image_url
        ? [details.image_url]
        : details.image
          ? [details.image]
          : [];

    return {
      id: row.id,
      title: row.title,
      listing_type: row.listing_type || details.listing_type || "sell",
      price: Number(details.price ?? row.price ?? 0) || 0,
      currency: details.currency || "$",
      city: details.city ?? row.city ?? null,
      images,
      brand: details.brand ?? details.car_name ?? null,
      year: Number(details.year ?? details.car_year) || null,
      condition: details.condition || null,
      rooms: Number(details.rooms) || null,
      area_sqm: Number(details.area_sqm) || null,
      property_type: details.property_type || null,
      land_type: details.land_type || null,
      is_featured: details.is_featured || false,
    } as ListingItem;
  });
}

export default async function Home() {
  const [localRows, worldRows, sportRows, carListings, houseListings, landListings, otherListings] = await Promise.all([
    getArticles("local", 20),
    getArticles("world", 20),
    getArticles("sport", 20),
    getApprovedListings("car"),
    getApprovedListings("house"),
    getApprovedListings("land"),
    getApprovedListings("other"),
  ]);

  const localNews = (localRows || []).map((row) => ({
    id: row.id,
    headline: row.title || "",
    summary: row.content ? row.content.replace(/<[^>]+>/g, "").slice(0, 180) : "",
    content: row.content,
    image_url: row.image_url,
    publish_date: row.published_at,
    created_date: row.created_at,
  }));

  const worldNews = (worldRows || [])
    .filter((row) => Boolean(row.title_so || row.title))
    .map((row) => ({
      title: row.title_so || row.title || "",
      description: row.content_so || row.content || row.title_so || row.title || "",
      urlToImage: row.image_url,
      publishedAt: row.published_at,
    }));

  const footballNews = (sportRows || [])
    .filter((row) => Boolean(row.title_so || row.title))
    .map((row) => ({
      title: row.title_so || row.title || "",
      description: row.content_so || row.content || row.title_so || row.title || "",
      urlToImage: row.image_url,
      publishedAt: row.published_at,
    }));

  const formatLocal = (localNews || []).map((n) => ({
    title: n.headline,
    description: n.summary,
    image: n.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600",
    tag: "Local",
    tagColor: "bg-amber-500",
    date: n.publish_date || n.created_date,
  }));

  const formatWorld = (worldNews || []).map((n) => ({
    title: n.title,
    description: n.description,
    image: n.urlToImage || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600",
    tag: "World",
    tagColor: "bg-blue-600",
    date: n.publishedAt,
  }));

  const formatFootball = (footballNews || []).map((n) => ({
    title: n.title,
    description: n.description,
    image: n.urlToImage || "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600",
    tag: "Football",
    tagColor: "bg-green-600",
    date: n.publishedAt,
  }));

  return (
    <div>
      <HeroSlider localNews={localNews} worldNews={worldNews} footballNews={footballNews} />

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-12 relative z-10 mb-10">
          <LiveScoresWidget />
          <WeatherWidget />
          <CurrencyWidget />
        </div>

        <NewsGrid title="Local News" articles={formatLocal} viewAllPage="LocalNews" tagColor="bg-amber-500" />
        <NewsGrid title="World News" articles={formatWorld} viewAllPage="WorldNews" tagColor="bg-blue-600" />
        <NewsGrid title="Football News" articles={formatFootball} viewAllPage="FootballNews" tagColor="bg-green-600" />

        {[
          { title: "Cars", href: "/marketplace-cars", type: "car", listings: carListings },
          { title: "Houses", href: "/marketplace-houses", type: "house", listings: houseListings },
          { title: "Land", href: "/marketplace-land", type: "land", listings: landListings },
          { title: "Other", href: "/marketplace-other", type: "other", listings: otherListings },
        ].map((section) => (
          <section key={section.type} className="py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-orange-500" />
                <h2 className="text-2xl font-black text-[var(--text-primary)]">{section.title} Listings</h2>
              </div>
              <Link
                href={section.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {section.listings.length === 0 ? (
              <div className="text-sm text-[var(--text-secondary)]">No approved {section.type} listings yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.listings.map((item, index) => (
                  <ListingCard key={item.id} listing={item} type={section.type} index={index} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
