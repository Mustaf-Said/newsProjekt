"use client";

import { useEffect, useState } from "react";
import NewsPageLayout from "@/components/news/NewsPageLayout";
import { Loader2 } from "lucide-react";

export default function WorldNews() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/world-news");
        const data = await res.json();
        setArticles((data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          image: a.urlToImage || a.image,
          date: a.publishedAt,
          source: a.source,
          tagColor: "bg-blue-600",
        })));
      } catch (e) {
        console.error(e);
        setArticles([{
          title: "News unavailable",
          description: "Unable to fetch world news at this time. Please try again later.",
          image: "https://via.placeholder.com/400x200?text=News+Unavailable",
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <NewsPageLayout
      title="World News"
      tagColor="bg-blue-600"
      articles={articles}
      selectedArticle={selected}
      onSelectArticle={setSelected}
    />
  );
}
