import type { UIMessage } from '../ai-lite';

// Kept in sync with `SearchIndexToolType` in ./index. Inlined here to avoid a
// circular dependency between this module and the barrel file.
const SEARCH_INDEX_TOOL_PREFIX = 'algolia_search_index';

export type DisplayResult = {
  objectID: string;
  why?: string;
};

export type DisplayResultsGroup = {
  title?: string;
  why?: string;
  results: DisplayResult[];
};

export type DisplayResultsOutput = {
  intro?: string;
  groups: DisplayResultsGroup[];
};

type HitLike = {
  objectID: string;
  [key: string]: unknown;
};

/**
 * Extracts product hits from a search tool `output`, tolerant of the two
 * shapes produced by `algolia_search_index*` tools:
 * - `{ hits: [...] }` (single-index response)
 * - `{ results: [{ hits: [...] }] }` (multi-index response)
 */
export function extractSearchHits<THit extends HitLike>(
  result: unknown
): THit[] | null {
  if (!result || typeof result !== 'object') return null;

  const maybeSingle = result as { hits?: unknown };
  if (Array.isArray(maybeSingle.hits)) {
    return maybeSingle.hits as THit[];
  }

  const maybeMulti = result as { results?: unknown };
  if (Array.isArray(maybeMulti.results) && maybeMulti.results.length > 0) {
    const first = maybeMulti.results[0] as { hits?: unknown };
    if (Array.isArray(first?.hits)) {
      return first.hits as THit[];
    }
  }

  return null;
}

/**
 * Walks the conversation's assistant tool invocations and collects every hit
 * returned by a `algolia_search_index*` tool, keyed by `objectID`. Lets a
 * downstream display tool resolve an objectID back to the full record that
 * was previously surfaced to the user.
 */
export function buildConversationHits<THit extends HitLike>(
  messages: UIMessage[] | undefined
): Map<string, THit> {
  const lookup = new Map<string, THit>();
  if (!messages) return lookup;

  for (const message of messages) {
    if (message.role !== 'assistant') continue;
    for (const part of message.parts) {
      if (typeof part.type !== 'string' || !part.type.startsWith('tool-')) {
        continue;
      }
      const toolName = part.type.replace('tool-', '');
      if (!toolName.startsWith(SEARCH_INDEX_TOOL_PREFIX)) continue;
      if ((part as { state?: string }).state !== 'output-available') continue;

      const output = (part as { output?: unknown }).output;
      const hits = extractSearchHits<THit>(output);
      if (!hits) continue;

      for (const hit of hits) {
        if (hit && hit.objectID) {
          lookup.set(String(hit.objectID), hit);
        }
      }
    }
  }

  return lookup;
}

/**
 * Coerces the display tool's output into the `DisplayResultsOutput` shape.
 * Tolerates unknown fields and silently drops malformed entries (e.g. a
 * result without an `objectID`), making it safe to call on partially-parsed
 * streaming payloads as well as fully-formed ones.
 */
export function normalizeDisplayResultsOutput(
  raw: unknown
): DisplayResultsOutput {
  if (!raw || typeof raw !== 'object') {
    return { groups: [] };
  }

  const source = raw as { intro?: unknown; groups?: unknown };
  const groups = Array.isArray(source.groups)
    ? source.groups.map(normalizeGroup).filter((g): g is DisplayResultsGroup =>
        Boolean(g)
      )
    : [];

  return {
    intro: typeof source.intro === 'string' ? source.intro : undefined,
    groups,
  };
}

function normalizeGroup(raw: unknown): DisplayResultsGroup | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as { title?: unknown; why?: unknown; results?: unknown };
  const results = Array.isArray(source.results)
    ? source.results.map(normalizeResult).filter((r): r is DisplayResult =>
        Boolean(r)
      )
    : [];

  return {
    title: typeof source.title === 'string' ? source.title : undefined,
    why: typeof source.why === 'string' ? source.why : undefined,
    results,
  };
}

function normalizeResult(raw: unknown): DisplayResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as { objectID?: unknown; why?: unknown };
  if (typeof source.objectID !== 'string' || source.objectID === '') {
    return null;
  }
  return {
    objectID: source.objectID,
    why: typeof source.why === 'string' ? source.why : undefined,
  };
}
