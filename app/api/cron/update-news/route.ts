import { NextResponse } from "next/server";
import { fetchFootballNews, fetchWorldNews, NormalizedArticle } from "@/lib/newsFetcher";
import { translateToSomali } from "@/lib/translate";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ArticleInsert = {
  title: string;
  content: string;
  title_so: string;
  content_so: string;
  category: "world" | "sport";
  image_url: string | null;
  published_at: string | null;
};

type CronLogStatus = "success" | "skipped" | "error";

type CronLogPayload = {
  status: CronLogStatus;
  insertedCount: number;
  worldFetched: number;
  sportFetched: number;
  errorMessage?: string;
};

async function writeCronRunLog(
  supabaseServer: ReturnType<typeof getSupabaseServer>,
  payload: CronLogPayload
) {
  try {
    const { error } = await supabaseServer
      .from("news_update_logs" as any)
      .insert({
        job_name: "update-news",
        status: payload.status,
        inserted_count: payload.insertedCount,
        world_fetched: payload.worldFetched,
        sport_fetched: payload.sportFetched,
        error_message: payload.errorMessage || null,
      } as any);

    if (error) {
      console.warn("[cron:update-news] Failed to write cron log", error);
    }
  } catch (error) {
    console.warn("[cron:update-news] Unexpected logging error", error);
  }
}

async function translateArticles(
  articles: NormalizedArticle[],
  category: "world" | "sport",
  runTimestampIso: string
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
        published_at: runTimestampIso,
      };
    })
  );
}

function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization") || "";
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseServer = getSupabaseServer();
    const runTimestampIso = new Date().toISOString();
    const [worldNews, footballNews] = await Promise.all([
      fetchWorldNews(),
      fetchFootballNews(),
    ]);

    const [worldRows, sportRows] = await Promise.all([
      translateArticles(worldNews, "world", runTimestampIso),
      translateArticles(footballNews, "sport", runTimestampIso),
    ]);

    const inserts = [...worldRows, ...sportRows];

    if (inserts.length === 0) {
      console.warn("[cron:update-news] No articles fetched; keeping existing records");
      await writeCronRunLog(supabaseServer, {
        status: "skipped",
        insertedCount: 0,
        worldFetched: worldNews.length,
        sportFetched: footballNews.length,
      });
      return NextResponse.json({ success: true, inserted: 0, skippedDelete: true });
    }

    const { error: deleteError } = await supabaseServer
      .from("articles")
      .delete()
      .in("category", ["world", "sport"]);

    if (deleteError) {
      console.error("[cron:update-news] Failed to delete old articles", deleteError);
      await writeCronRunLog(supabaseServer, {
        status: "error",
        insertedCount: 0,
        worldFetched: worldNews.length,
        sportFetched: footballNews.length,
        errorMessage: deleteError.message,
      });
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const { error: insertError } = await supabaseServer
      .from("articles")
      .insert(inserts as any);

    if (insertError) {
      console.error("[cron:update-news] Failed to insert articles", insertError);
      await writeCronRunLog(supabaseServer, {
        status: "error",
        insertedCount: 0,
        worldFetched: worldNews.length,
        sportFetched: footballNews.length,
        errorMessage: insertError.message,
      });
      return NextResponse.json({ success: false }, { status: 500 });
    }

    await writeCronRunLog(supabaseServer, {
      status: "success",
      insertedCount: inserts.length,
      worldFetched: worldNews.length,
      sportFetched: footballNews.length,
    });

    return NextResponse.json({
      success: true,
      inserted: inserts.length,
      worldFetched: worldNews.length,
      sportFetched: footballNews.length,
    });
  } catch (error) {
    console.error("[cron:update-news] Unexpected error", error);

    const message = error instanceof Error ? error.message : String(error);

    try {
      const supabaseServer = getSupabaseServer();
      await writeCronRunLog(supabaseServer, {
        status: "error",
        insertedCount: 0,
        worldFetched: 0,
        sportFetched: 0,
        errorMessage: message,
      });
    } catch {
      // Ignore any secondary failure while reporting the main error
    }

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
