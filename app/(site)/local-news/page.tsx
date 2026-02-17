import NewsPageLayout from "@/components/news/NewsPageLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key
);

async function getLocalNews() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, category, published_at, created_at, image_url")
    .eq("category", "local")
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map((row: any) => ({
    title: row.title,
    description: row.content
      ? row.content.replace(/<[^>]+>/g, "").slice(0, 200)
      : "",
    content: row.content,
    image: row.image_url,
    date: row.published_at || row.created_at,
    source: "Local",
    tagColor: "bg-amber-500",
    id: row.id,
  }));
}

export default async function LocalNews() {
  const articles = await getLocalNews();

  return (
    <NewsPageLayout
      title="Local News"
      tagColor="bg-amber-500"
      articles={articles}
    />
  );
}
