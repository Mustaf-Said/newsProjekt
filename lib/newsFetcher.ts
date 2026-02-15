type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
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

function normalizeArticle(article: NewsApiArticle): NormalizedArticle | null {
  const title = article.title?.trim();
  if (!title) {
    return null;
  }

  return {
    title,
    content: article.description?.trim() || article.content?.trim() || "",
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

    return articles
      .map((article: NewsApiArticle) => normalizeArticle(article))
      .filter((article: NormalizedArticle | null): article is NormalizedArticle => Boolean(article));
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
