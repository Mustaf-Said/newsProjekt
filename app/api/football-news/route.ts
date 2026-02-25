import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { hasCompleteArticleContent } from "@/lib/articleQuality";

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

export async function GET() {
  // Fallback football news data
  const fallbackArticles = [
    {
      title: "Manchester City Extends Lead After Dominant Win",
      description: "Manchester City secured a commanding 3-0 victory over their rivals, extending their lead at the top of the Premier League. The team's attacking performance was exceptional, with multiple goals from different players showing their depth.",
      urlToImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop",
      publishedAt: new Date().toISOString(),
      source: "Sports Central",
    },
    {
      title: "Transfer Window: Major Signings Announced",
      description: "Several top European clubs have announced major transfer signings ahead of the new season. The moves include high-profile international players and promising young talents from various leagues.",
      urlToImage: "https://images.unsplash.com/photo-1522869635100-ce697e9058b3?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: "Football Transfer News",
    },
    {
      title: "Young Talent Breaks League Scoring Record",
      description: "A rising star player has broken the league's single-season scoring record, showcasing exceptional form and clinical finishing. The achievement comes at the midway point of the season, promising another successful chapter.",
      urlToImage: "https://images.unsplash.com/photo-1552315154-5a3a9e4f5e63?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: "Elite Football",
    },
    {
      title: "Champions League Quarterfinals Draw Set",
      description: "The Champions League quarterfinal draw has set up exciting matchups between Europe's elite teams. The fixtures promise thrilling football with several David vs Goliath scenarios.",
      urlToImage: "https://images.unsplash.com/photo-1543699330-ab127b08ba38?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: "European Football",
    },
    {
      title: "National Team Advances to Tournament Finals",
      description: "The national football team has qualified for the tournament finals after an impressive playoff performance. The team will face tough opposition but believes they can compete for the title.",
      urlToImage: "https://images.unsplash.com/photo-1566418699018-b5f0e2e9f6e4?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: "Sports News Daily",
    },
  ];

  try {
    const supabaseServer = getSupabaseServer();
    const { data, error } = await supabaseServer
      .from("articles")
      .select("title, title_so, content, content_so, image_url, published_at")
      .eq("category", "sport")
      .order("published_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("[football-news] Supabase query failed", error);
      return NextResponse.json({ articles: fallbackArticles });
    }

    const articles = (data || [])
      .filter((row: ArticleRow) => hasCompleteArticleContent(row.content_so || row.content))
      .map((row: ArticleRow) => ({
        title: row.title_so || row.title || "Untitled",
        description: row.content_so || row.content || "",
        urlToImage: row.image_url,
        publishedAt: row.published_at,
        source: "Football News",
      }));

    return NextResponse.json({ articles: articles.length > 0 ? articles : fallbackArticles });
  } catch (error) {
    console.error("[football-news] Error:", error);
    return NextResponse.json({ articles: fallbackArticles });
  }
}
