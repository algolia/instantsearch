/**
 * Where the search response signals agentic mode. The only place that knows
 * the field path: change it here when the contract changes.
 *
 *   { "renderingContent": { "widgets": { "agenticSearch": {
 *       "enabled": true,
 *       "agentId": "…"            // stream from this Agent Studio agent
 *       "stream": "/agent/stream" // or from this endpoint (fake backend)
 *   } } } }
 *
 * It sits under `widgets` because that is where query rules may write: a
 * rule's `renderingContent` only accepts `facetOrdering`, `redirect` and
 * `widgets`. The rules are in `server/rules.mjs`.
 */
export const AGENTIC_FIELD_PATH = [
  'renderingContent',
  'widgets',
  'agenticSearch',
] as const;

export type AgenticConfig =
  | { kind: 'agent-studio'; agentId: string }
  | { kind: 'stream'; stream: string };

/** Reads the agentic trigger from a search response, or `null`. */
export function getAgenticConfig(response: unknown): AgenticConfig | null {
  const value = AGENTIC_FIELD_PATH.reduce<unknown>(
    (current, key) =>
      current && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined,
    response
  ) as { enabled?: unknown; agentId?: unknown; stream?: unknown } | undefined;

  if (!value || typeof value !== 'object' || value.enabled !== true) {
    return null;
  }
  if (typeof value.agentId === 'string' && value.agentId) {
    return { kind: 'agent-studio', agentId: value.agentId };
  }
  if (typeof value.stream === 'string' && value.stream) {
    return { kind: 'stream', stream: value.stream };
  }
  return null;
}

/** Identifies a trigger, to tell a new conversation from the same one. */
export function getAgenticKey(config: AgenticConfig): string {
  return config.kind === 'agent-studio' ? config.agentId : config.stream;
}
