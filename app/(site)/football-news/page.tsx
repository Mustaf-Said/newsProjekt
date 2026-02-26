import NewsPageLayout from "@/components/news/NewsPageLayout";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

async function getArticles() {
  try {
    const supabaseServer = getSupabaseServer();
    const { data, error } = await supabaseServer
      .from("articles")
      .select("*")
      .eq("category", "sport")
      .order("published_at", { ascending: false })
      .limit(24);

    if (error) {
      throw error;
    }

    return (data || [])
      .filter((row: ArticleRow) => Boolean(row.title_so || row.title))
      .map((row: ArticleRow) => ({
        title: row.title_so || row.title || "Untitled",
        description: row.content_so || row.content || row.title_so || row.title || "",
        image: row.image_url,
        date: row.published_at,
        source: "Football News",
        tagColor: "bg-green-600",
      }));
  } catch (e: any) {
    console.error("[football-news-page] Failed to load articles", {
      message: e?.message,
      details: e?.details,
      hint: e?.hint,
      code: e?.code,
    });
    return [{
      title: "Football news unavailable",
      description: "Unable to fetch football news at this time.",
      image: "https://via.placeholder.com/400x200?text=Football+News+Unavailable",
      date: new Date().toISOString(),
      source: "System",
      tagColor: "bg-gray-600",
    }];
  }
}

export default async function FootballNews() {
  const articles = await getArticles();

  return (
    <NewsPageLayout
      title="Football News"
      tagColor="bg-green-600"
      articles={articles}
    />
  );
}
