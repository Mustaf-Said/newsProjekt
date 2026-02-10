import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import HeroSlider from "../components/home/HeroSlider";
import NewsGrid from "../components/home/NewsGrid";
import WeatherWidget from "../components/home/WeatherWidget";
import CurrencyWidget from "../components/home/CurrencyWidget";
import LiveScoresWidget from "../components/home/LiveScoresWidget";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [worldNews, setWorldNews] = useState([]);
  const [footballNews, setFootballNews] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  const { data: localNews = [] } = useQuery({
    queryKey: ["localNews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, content, category, published_at, created_at")
        .eq("category", "local")
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        headline: row.title,
        summary: row.content ? row.content.replace(/<[^>]+>/g, "").slice(0, 180) : "",
        content: row.content,
        image_url: null,
        publish_date: row.published_at,
        created_date: row.created_at,
      }));
    },
    initialData: [],
  });

  useEffect(() => {
    async function fetchAPINews() {
      try {
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        if (!apiKey) {
          setWorldNews([]);
          setFootballNews([]);
          return;
        }

        const worldUrl = new URL("https://newsapi.org/v2/top-headlines");
        worldUrl.searchParams.set("category", "general");
        worldUrl.searchParams.set("language", "en");
        worldUrl.searchParams.set("pageSize", "6");
        worldUrl.searchParams.set("apiKey", apiKey);

        const footballUrl = new URL("https://newsapi.org/v2/everything");
        footballUrl.searchParams.set("q", "football OR soccer");
        footballUrl.searchParams.set("language", "en");
        footballUrl.searchParams.set("sortBy", "publishedAt");
        footballUrl.searchParams.set("pageSize", "6");
        footballUrl.searchParams.set("apiKey", apiKey);

        const [worldRes, footballRes] = await Promise.all([
          fetch(worldUrl.toString()),
          fetch(footballUrl.toString()),
        ]);

        const worldJson = await worldRes.json();
        const footballJson = await footballRes.json();

        const worldArticles = (worldJson.articles || []).map((a) => ({
          title: a.title,
          description: a.description,
          source: a.source?.name,
          urlToImage: a.urlToImage,
          publishedAt: a.publishedAt,
        }));

        const footballArticles = (footballJson.articles || []).map((a) => ({
          title: a.title,
          description: a.description,
          source: a.source?.name,
          urlToImage: a.urlToImage,
          publishedAt: a.publishedAt,
        }));

        setWorldNews(worldArticles);
        setFootballNews(footballArticles);
      } catch (e) {
        console.error(e);
        setWorldNews([]);
        setFootballNews([]);
      }
      setApiLoading(false);
    }
    fetchAPINews();
  }, []);

  const formatLocal = (localNews || []).map(n => ({
    title: n.headline,
    description: n.summary,
    image: n.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600",
    tag: "Local",
    tagColor: "bg-amber-500",
    date: n.publish_date || n.created_date,
  }));

  const formatWorld = (worldNews || []).map(n => ({
    title: n.title,
    description: n.description,
    image: n.urlToImage || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600",
    tag: "World",
    tagColor: "bg-blue-600",
    date: n.publishedAt,
  }));

  const formatFootball = (footballNews || []).map(n => ({
    title: n.title,
    description: n.description,
    image: n.urlToImage || "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600",
    tag: "Football",
    tagColor: "bg-green-600",
    date: n.publishedAt,
  }));

  return (
    <div>
      <HeroSlider localNews={localNews} worldNews={worldNews} footballNews={footballNews} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-12 relative z-10 mb-10">
          <LiveScoresWidget />
          <WeatherWidget />
          <CurrencyWidget />
        </div>

        {/* News Sections */}
        <NewsGrid title="Local News" articles={formatLocal} viewAllPage="LocalNews" tagColor="bg-amber-500" />

        {apiLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : (
          <>
            <NewsGrid title="World News" articles={formatWorld} viewAllPage="WorldNews" tagColor="bg-blue-600" />
            <NewsGrid title="Football News" articles={formatFootball} viewAllPage="FootballNews" tagColor="bg-green-600" />
          </>
        )}
      </div>
    </div>
  );
}