import { getJsonCursor } from 'instantsearch-ui-components';

export const tryParseJson = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/**
 * Closes whatever a truncated JSON document left open — a string, then every
 * container — so it parses. Tools that render streaming input read the same
 * cursor to know which part of the result is still being written.
 */
export const repairPartialJson = (value: string): string => {
  let repaired = value.trim();

  if (!repaired) {
    return repaired;
  }

  const cursor = getJsonCursor(repaired);

  if (cursor.inString && !cursor.isEscaped) {
    repaired += '"';
  }

  repaired = repaired.replace(/,\s*$/u, '');

  if (cursor.frames.length > 0) {
    repaired += cursor.frames
      .slice()
      .reverse()
      .map((frame) => (frame.isObject ? '}' : ']'))
      .join('');
  }

  return repaired.replace(/,\s*([}\]])/gu, '$1');
};

export const parsePartialJson = (
  accumulatedRawJson: string,
  fallbackValue: unknown
): unknown => {
  const normalized = accumulatedRawJson.trim();
  if (!normalized) {
    return fallbackValue;
  }

  const directParsed = tryParseJson(normalized);
  if (directParsed !== undefined) {
    return directParsed;
  }

  const repairedParsed = tryParseJson(repairPartialJson(normalized));
  if (repairedParsed !== undefined) {
    return repairedParsed;
  }

  return fallbackValue;
};
