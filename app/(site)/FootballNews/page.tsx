import NewsPageLayout from "@/components/news/NewsPageLayout";

async function getArticles() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/football-news`,
      { cache: "no-store" }
    );

    const data = await res.json();

    return (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      image: a.urlToImage || a.image,
      date: a.publishedAt,
      source: a.source,
      tagColor: "bg-green-600",
    }));

  } catch (e) {
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
