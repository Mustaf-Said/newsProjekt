import NewsPageLayout from "@/components/news/NewsPageLayout";

async function getArticles() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/world-news`,
      { cache: "no-store" }
    );

    const data = await res.json();

    return (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      image: a.urlToImage || a.image,
      date: a.publishedAt,
      source: a.source,
      tagColor: "bg-blue-600",
    }));
  } catch (e) {
    return [{
      title: "News unavailable",
      description: "Unable to fetch world news at this time.",
      image: "https://via.placeholder.com/400x200?text=News+Unavailable",
      date: new Date().toISOString(),
      source: "System",
      tagColor: "bg-gray-600",
    }];
  }
}

export default async function WorldNews() {
  const articles = await getArticles();

  return (
    <NewsPageLayout
      title="World News"
      tagColor="bg-blue-600"
      articles={articles}
    />
  );
}