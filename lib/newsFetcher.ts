type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
};

export type NormalizedArticle = {
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  source: string | null;
};

const NEWS_API_BASE = "https://newsapi.org/v2";
const DEFAULT_PAGE_SIZE = "12";
const ENABLE_FULL_ARTICLE_SCRAPE = process.env.ENABLE_FULL_ARTICLE_SCRAPE === "true";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function cleanNewsApiContent(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.replace(/\s*\[\+\d+\s+chars\]$/i, "").trim();
}

function extractTextFromHtml(html: string): string {
  const sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const articleMatch = sanitized.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = sanitized.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const bodyMatch = sanitized.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);

  const target = articleMatch?.[1] || mainMatch?.[1] || bodyMatch?.[1] || sanitized;
  const paragraphMatches = [...target.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];

  if (paragraphMatches.length > 0) {
    return paragraphMatches
      .map((match) => stripHtml(match[1] || ""))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return stripHtml(target);
}

async function fetchFullArticleText(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 NewsProjektBot/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = await response.text();
    const extracted = extractTextFromHtml(html);

    if (extracted.length < 300) {
      return null;
    }

    return extracted;
  } catch {
    return null;
  }
}

async function normalizeArticle(article: NewsApiArticle): Promise<NormalizedArticle | null> {
  const title = article.title?.trim();
  if (!title) {
    return null;
  }

  const preview = cleanNewsApiContent(article.content) || article.description?.trim() || "";
  const fullText = ENABLE_FULL_ARTICLE_SCRAPE && article.url
    ? await fetchFullArticleText(article.url)
    : null;
  const content = fullText || preview;

  return {
    title,
    content,
    imageUrl: article.urlToImage || null,
    publishedAt: article.publishedAt || null,
    source: article.source?.name || null,
  };
}

async function fetchFromNewsApi(path: string, params: Record<string, string>): Promise<NormalizedArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error("[newsFetcher] Missing NEWS_API_KEY");
    return [];
  }

  const url = new URL(`${NEWS_API_BASE}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("apiKey", apiKey);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error(`[newsFetcher] NewsAPI request failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json = await res.json();
    const articles = Array.isArray(json?.articles) ? json.articles : [];

    const normalized = await Promise.all(
      articles.map((article: NewsApiArticle) => normalizeArticle(article))
    );

    return normalized.filter(
      (article: NormalizedArticle | null): article is NormalizedArticle => Boolean(article)
    );
  } catch (error) {
    console.error("[newsFetcher] NewsAPI request error", error);
    return [];
  }
}

export async function fetchWorldNews(): Promise<NormalizedArticle[]> {
  return fetchFromNewsApi("top-headlines", {
    category: "general",
    language: "en",
    pageSize: DEFAULT_PAGE_SIZE,
  });
}

export async function fetchFootballNews(): Promise<NormalizedArticle[]> {
  return fetchFromNewsApi("everything", {
    q: "football OR soccer",
    language: "en",
    sortBy: "publishedAt",
    pageSize: DEFAULT_PAGE_SIZE,
  });
}
