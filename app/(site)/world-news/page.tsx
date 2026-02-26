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
      .eq("category", "world")
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
        source: "World News",
        tagColor: "bg-blue-600",
      }));
  } catch (e: any) {
    console.error("[world-news-page] Failed to load articles", {
      message: e?.message,
      details: e?.details,
      hint: e?.hint,
      code: e?.code,
    });
    return [{
      title: "News unavailable",
      description: "Unable to fetch world news at this time.",
      image: "https://via.placeholder.com/400x200?text=News+Unavailable",
      date: new Date().toISOString(),
      source: "System",
      tagColor: "bg-gray-600",
    }];
  }
}

export default async function WorldNews() {
  const articles = await getArticles();

  return (
    <NewsPageLayout
      title="World News"
      tagColor="bg-blue-600"
      articles={articles}
    />
  );
}