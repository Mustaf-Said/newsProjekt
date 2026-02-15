import { getSupabaseServer } from "@/lib/supabaseServer";
import HeroSlider from "@/components/home/HeroSlider";
import NewsGrid from "@/components/home/NewsGrid";
import WeatherWidget from "@/components/home/WeatherWidget";
import CurrencyWidget from "@/components/home/CurrencyWidget";
import LiveScoresWidget from "@/components/home/LiveScoresWidget";
type ArticleRow = {
  id: string;
  title: string | null;
  content: string | null;
  title_so: string | null;
  content_so: string | null;
  category: "local" | "world" | "sport";
  image_url: string | null;
  published_at: string | null;
  created_at: string | null;
};

async function getArticles(category: ArticleRow["category"], limit: number) {
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
    return [] as ArticleRow[];
  }

  return (data || []) as ArticleRow[];
}

export default async function Home() {
  const [localRows, worldRows, sportRows] = await Promise.all([
    getArticles("local", 10),
    getArticles("world", 12),
    getArticles("sport", 12),
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

  const worldNews = (worldRows || []).map((row) => ({
    title: row.title_so || row.title || "",
    description: row.content_so || row.content || "",
    urlToImage: row.image_url,
    publishedAt: row.published_at,
  }));

  const footballNews = (sportRows || []).map((row) => ({
    title: row.title_so || row.title || "",
    description: row.content_so || row.content || "",
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
      </div>
    </div>
  );
}
