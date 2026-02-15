import { NextResponse } from "next/server";
import { fetchFootballNews, fetchWorldNews, NormalizedArticle } from "@/lib/newsFetcher";
import { translateToSomali } from "@/lib/translate";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ArticleInsert = {
  title: string;
  content: string;
  title_so: string;
  content_so: string;
  category: "world" | "sport";
  image_url: string | null;
  published_at: string | null;
};

async function translateArticles(
  articles: NormalizedArticle[],
  category: "world" | "sport"
): Promise<ArticleInsert[]> {
  return Promise.all(
    articles.map(async (article) => {
      const title = article.title;
      const content = article.content || "";

      const [titleSo, contentSo] = await Promise.all([
        translateToSomali(title),
        translateToSomali(content),
      ]);

      return {
        title,
        content,
        title_so: titleSo,
        content_so: contentSo,
        category,
        image_url: article.imageUrl,
        published_at: article.publishedAt,
      };
    })
  );
}

export async function GET() {
  try {
    const supabaseServer = getSupabaseServer();
    const [worldNews, footballNews] = await Promise.all([
      fetchWorldNews(),
      fetchFootballNews(),
    ]);

    const [worldRows, sportRows] = await Promise.all([
      translateArticles(worldNews, "world"),
      translateArticles(footballNews, "sport"),
    ]);

    const { error: deleteError } = await supabaseServer
      .from("articles")
      .delete()
      .in("category", ["world", "sport"]);

    if (deleteError) {
      console.error("[cron:update-news] Failed to delete old articles", deleteError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const inserts = [...worldRows, ...sportRows];

    if (inserts.length === 0) {
      console.warn("[cron:update-news] No articles to insert");
      return NextResponse.json({ success: true, inserted: 0 });
    }

    const { error: insertError } = await supabaseServer
      .from("articles")
      .insert(inserts as any);

    if (insertError) {
      console.error("[cron:update-news] Failed to insert articles", insertError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, inserted: inserts.length });
  } catch (error) {
    console.error("[cron:update-news] Unexpected error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
