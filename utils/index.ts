export function createPageUrl(pageName: string) {
  // Convert spaces to dashes first
  let url = pageName.replace(/ /g, '-');
  // Convert CamelCase to kebab-case (e.g., "LocalNews" -> "local-news")
  url = url.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return '/' + url;
}