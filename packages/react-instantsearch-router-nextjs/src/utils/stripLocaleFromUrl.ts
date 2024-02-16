export function stripLocaleFromUrl(
  url: string,
  locale: string | undefined,
  includePrefixSeparator = true
): string {
  if (!locale) {
    return url;
  }

  return url.replace(
    new RegExp(`${includePrefixSeparator ? '/' : ''}${locale}(\\/|\\?|$)`),
    '$1'
  );
}
