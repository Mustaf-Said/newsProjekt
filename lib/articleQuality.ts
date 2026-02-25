function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

function normalizeArticleText(value: string): string {
  return stripHtml(value)
    .replace(/\s+/g, " ")
    .trim();
}

export function hasCompleteArticleContent(content: string | null | undefined): boolean {
  if (!content) {
    return false;
  }

  const normalized = normalizeArticleText(content);
  if (!normalized) {
    return false;
  }

  if (/\[\+\d+\s+chars\]$/i.test(normalized)) {
    return false;
  }

  if (/\.\.\.$|…$/u.test(normalized)) {
    return false;
  }

  const wordCount = normalized.split(" ").filter(Boolean).length;
  return normalized.length >= 180 && wordCount >= 30;
}