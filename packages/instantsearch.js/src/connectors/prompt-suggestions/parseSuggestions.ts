/**
 * Parses a prompt-suggestions task output into the list of suggestion strings.
 *
 * Shared by the `connectPromptSuggestions` connector and the standalone React
 * binding (`PromptSuggestionsStandalone`) so both read the agent output the
 * same way — the connector derives its input from the search state, the
 * standalone binding is handed it directly, but the output shape is identical.
 */
export function parseSuggestions(data: unknown): string[] {
  const suggestions = (data as { suggestions?: unknown[] } | null | undefined)
    ?.suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.filter((s: unknown): s is string => typeof s === 'string');
}
