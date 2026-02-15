import { NextResponse } from "next/server";
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

export async function GET() {
  // Fallback world news data
  const fallbackArticles = [
    {
      title: "Global Economic Summit Concludes with New Trade Agreement",
      description: "World leaders gathered for a three-day economic summit, resulting in a comprehensive trade agreement aimed at boosting international commerce. The agreement focuses on renewable energy partnerships and technology innovation hubs across participating nations.",
      urlToImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
      publishedAt: new Date().toISOString(),
      source: "Global News Network",
    },
    {
      title: "Breakthrough in Climate Change Research",
      description: "Scientists announce a major breakthrough in carbon capture technology that could significantly reduce atmospheric carbon dioxide levels. The new method is 40% more efficient than previous solutions and could be implemented globally within 5 years.",
      urlToImage: "https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: "Science Today",
    },
    {
      title: "Major Sporting Event Draws Record Viewership",
      description: "International sporting event achieves record-breaking viewership numbers, with over 3 billion viewers tuning in across multiple platforms. The event showcased outstanding athletic performances and broke several world records.",
      urlToImage: "https://images.unsplash.com/photo-1552672260-eb7149bda42d?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: "Sports International",
    },
    {
      title: "Tech Giants Announce Joint Sustainability Initiative",
      description: "Leading technology companies have partnered to launch a comprehensive sustainability initiative focused on reducing electronic waste and promoting recycling. The five-year plan aims to process 500 million tons of electronic waste responsibly.",
      urlToImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: "Tech News Daily",
    },
    {
      title: "Healthcare Innovation Extends Life Expectancy",
      description: "New healthcare protocols and medical technologies are credited with increasing global life expectancy. The innovation includes AI-assisted diagnostics and personalized medicine approaches that improve treatment outcomes.",
      urlToImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: "Health & Science",
    },
  ];

  try {
    const supabaseServer = getSupabaseServer();
    const { data, error } = await supabaseServer
      .from("articles")
      .select("*")
      .eq("category", "world")
      .order("published_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("[world-news] Supabase query failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json({ articles: fallbackArticles });
    }

    const articles = (data || []).map((row: ArticleRow) => ({
      title: row.title_so || row.title || "Untitled",
      description: row.content_so || row.content || "",
      urlToImage: row.image_url,
      publishedAt: row.published_at,
      source: "World News",
    }));

    return NextResponse.json({ articles: articles.length > 0 ? articles : fallbackArticles });
  } catch (error) {
    console.error("[world-news] Error:", error);
    return NextResponse.json({ articles: fallbackArticles });
  }
}
