"use client";

import { useEffect, useState } from "react";
import NewsPageLayout from "@/components/news/NewsPageLayout";
import { Loader2 } from "lucide-react";

export default function FootballNews() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/football-news");
        const data = await res.json();
        setArticles((data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          image: a.urlToImage || a.image,
          date: a.publishedAt,
          source: a.source,
          tagColor: "bg-green-600",
        })));
      } catch (e) {
        console.error(e);
        setArticles([{
          title: "Football news unavailable",
          description: "Unable to fetch football news at this time. Please try again later.",
          image: "https://via.placeholder.com/400x200?text=Football+News+Unavailable",
          date: new Date().toISOString(),
          source: "System",
          tagColor: "bg-gray-600",
        }]);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <NewsPageLayout
      title="Football News"
      tagColor="bg-green-600"
      articles={articles}
    />

  );
}
