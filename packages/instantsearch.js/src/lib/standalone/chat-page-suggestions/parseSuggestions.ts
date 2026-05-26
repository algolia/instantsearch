export function parseSuggestions(data: unknown, maxSuggestions: number): string[] {
  try {
    const parts = (data as { parts?: Array<{ text?: string }> })?.parts;
    if (!parts || !parts[1]?.text) {
      return [];
    }
    const parsed = JSON.parse(parts[1].text);
    return (Array.isArray(parsed) ? parsed : [])
      .filter(
        (s: unknown): s is string =>
          typeof s === 'string' && s.trim().length > 0
      )
      .slice(0, maxSuggestions);
  } catch (e) {
    return [];
  }
}
