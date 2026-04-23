/**
 * Tries to `JSON.parse` a value, returning `undefined` if parsing fails rather
 * than throwing. Useful as a predicate-style check before falling back to
 * partial-JSON repair.
 */
export function tryParseJson(value: string): unknown | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/**
 * Rewrites a possibly-truncated JSON string so that it can be parsed. Closes
 * unterminated strings, drops dangling tokens (`,` / `:`), and balances any
 * open objects/arrays with their matching closers. The output is not
 * guaranteed to be well-formed JSON but is a best-effort repair suitable for
 * rendering partial streaming payloads.
 */
export function repairPartialJson(value: string): string {
  let repaired = value.trim();

  if (!repaired) {
    return repaired;
  }

  let inString = false;
  let isEscaped = false;
  const stack: Array<'{' | '['> = [];

  for (let index = 0; index < repaired.length; index++) {
    const char = repaired[index];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' && stack[stack.length - 1] === '{') {
      stack.pop();
      continue;
    }

    if (char === ']' && stack[stack.length - 1] === '[') {
      stack.pop();
    }
  }

  if (inString && !isEscaped) {
    repaired += '"';
  }

  // strip trailing whitespace so the dangling-token checks don't miss
  repaired = repaired.replace(/\s+$/u, '');

  // drop a dangling comma: "...,"
  repaired = repaired.replace(/,$/u, '');

  // resolve a dangling key separator: `..."key":` → `..."key":null`
  if (repaired.endsWith(':')) {
    repaired += 'null';
  }

  if (stack.length > 0) {
    repaired += stack
      .slice()
      .reverse()
      .map((opening) => (opening === '{' ? '}' : ']'))
      .join('');
  }

  // strip any `,` that ended up directly before a closing bracket during repair
  return repaired.replace(/,\s*([}\]])/gu, '$1');
}

/**
 * Attempts to parse a JSON string that may be incomplete (still streaming).
 * Returns the parsed value (original or repaired) or `null` when recovery
 * fails entirely.
 */
export function parsePartialJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const direct = tryParseJson(trimmed);
  if (direct !== undefined) return direct;

  const repaired = tryParseJson(repairPartialJson(trimmed));
  return repaired ?? null;
}

/**
 * Accumulated delta helper: parse a raw (partial) JSON string and fall back to
 * a previously-known value when parsing cannot produce a result. Used to drive
 * streaming tool input/output without flickering to `undefined` between
 * deltas.
 */
export function parsePartialJsonWithFallback(
  accumulated: string,
  fallback: unknown
): unknown {
  const normalized = accumulated.trim();
  if (!normalized) return fallback;

  const direct = tryParseJson(normalized);
  if (direct !== undefined) return direct;

  const repaired = tryParseJson(repairPartialJson(normalized));
  if (repaired !== undefined) return repaired;

  return fallback;
}
