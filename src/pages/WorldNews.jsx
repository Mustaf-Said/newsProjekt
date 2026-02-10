import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NewsPageLayout from "../components/news/NewsPageLayout";
import { Loader2 } from "lucide-react";

export default function WorldNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Give me the top 12 world news headlines from today. Include title, detailed description (3-4 sentences), source name, published date, and a relevant image URL from unsplash. Make them real current events.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    source: { type: "string" },
                    urlToImage: { type: "string" },
                    publishedAt: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setArticles((res.articles || []).map(a => ({
          title: a.title,
          description: a.description,
          image: a.urlToImage,
          date: a.publishedAt,
          source: a.source,
          tagColor: "bg-blue-600"
        })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetch();
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