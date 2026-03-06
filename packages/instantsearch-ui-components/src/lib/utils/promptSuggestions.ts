export const PROMPT_SUGGESTION_FLAG = '__isPromptSuggestion' as const;
export const PROMPT_SUGGESTION_FALLBACK_FLAG =
  '__isPromptSuggestionFallback' as const;

export function getPromptSuggestionHits({
  hits,
  query,
  limit,
}: {
  hits: Array<{ objectID: string } & Record<string, unknown>>;
  query: string;
  limit: number;
}): Array<{ objectID: string } & Record<string, unknown>> {
  const promptHits = hits.slice(0, limit).map((hit) => ({
    ...hit,
    [PROMPT_SUGGESTION_FLAG]: true,
  }));

  if (promptHits.length > 0 || query.trim().length === 0) {
    return promptHits;
  }

  return [
    {
      objectID: `ask-about:${encodeURIComponent(query)}`,
      prompt: query,
      label: `Ask about "${query}"`,
      [PROMPT_SUGGESTION_FLAG]: true,
      [PROMPT_SUGGESTION_FALLBACK_FLAG]: true,
    },
  ];
}

export function isPromptSuggestion(item: unknown): item is {
  prompt: string;
  [PROMPT_SUGGESTION_FLAG]: true;
} {
  return Boolean(
    item &&
      typeof item === 'object' &&
      (item as Record<string, unknown>)[PROMPT_SUGGESTION_FLAG]
  );
}

export function isPromptSuggestionFallback(item: unknown): item is {
  prompt: string;
  label?: string;
  [PROMPT_SUGGESTION_FALLBACK_FLAG]: true;
} {
  return Boolean(
    item &&
      typeof item === 'object' &&
      (item as Record<string, unknown>)[PROMPT_SUGGESTION_FALLBACK_FLAG]
  );
}
