export const PROMPT_SUGGESTION_FLAG = '__isPromptSuggestion' as const;

export function getPromptSuggestionHits({
  hits,
  limit,
}: {
  hits: Array<{ objectID: string } & Record<string, unknown>>;
  limit: number;
}): Array<{ objectID: string } & Record<string, unknown>> {
  return hits.slice(0, limit).map((hit) => ({
    ...hit,
    [PROMPT_SUGGESTION_FLAG]: true,
  }));
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
