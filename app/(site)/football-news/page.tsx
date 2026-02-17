import NewsPageLayout from "@/components/news/NewsPageLayout";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ArticleRow = {
  id?: string;
  title?: string | null;
  content?: string | null;
  title_so?: string | null;
  content_so?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  [key: string]: any;
};

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

    return (data || []).map((row: ArticleRow) => ({
      title: row.title_so || row.title || "Untitled",
      description: row.content_so || row.content || "",
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
