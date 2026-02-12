import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

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
    if (!apiKey) {
      console.log("[world-news] No NEXT_PUBLIC_NEWS_API_KEY found, using fallback data");
      return NextResponse.json({ articles: fallbackArticles });
    }

    // Try to fetch from news API
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=general&apiKey=${apiKey}`,
      { headers: { "User-Agent": "NewsProject/1.0" } }
    );

    if (!newsRes.ok) {
      console.log("[world-news] News API failed, using fallback data");
      return NextResponse.json({ articles: fallbackArticles });
    }

    const newsData = await newsRes.json();
    const articles = (newsData.articles || []).slice(0, 12).map((article: any) => ({
      title: article.title,
      description: article.description || article.content?.substring(0, 200),
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || "Unknown",
    }));

    return NextResponse.json({ articles: articles.length > 0 ? articles : fallbackArticles });
  } catch (error) {
    console.error("[world-news] Error:", error);
    return NextResponse.json({ articles: fallbackArticles });
  }
}
