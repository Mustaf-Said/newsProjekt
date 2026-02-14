"use client";

import { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import NewsPageLayout from "@/components/news/NewsPageLayout";
import { Loader2 } from "lucide-react";

export default function LocalNews() {
  const [selected, setSelected] = useState<any>(null);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["localNewsPage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, content, category, published_at, created_at, image_url")
        .eq("category", "local")
        .order("published_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        headline: row.title,
        summary: row.content ? row.content.replace(/<[^>]+>/g, "").slice(0, 200) : "",
        content: row.content,
        image_url: row.image_url,
        publish_date: row.published_at,
        created_date: row.created_at,
      }));
    },
    initialData: [],
  });

  const articles = news.map((n: any) => ({
    title: n.headline,
    description: n.summary || n.content?.replace(/<[^>]+>/g, "").slice(0, 200),
    content: n.content,
    image: n.image_url,
    date: n.publish_date || n.created_date,
    source: "Local",
    tagColor: "bg-amber-500",
    id: n.id,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <NewsPageLayout
      title="Local News"
      tagColor="bg-amber-500"
      articles={articles}
      selectedArticle={selected}
      onSelectArticle={setSelected}
    />
  );
}
