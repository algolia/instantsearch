export const tryParseJson = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const repairPartialJson = (value: string): string => {
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

  repaired = repaired.replace(/,\s*$/u, '');

  if (stack.length > 0) {
    repaired += stack
      .reverse()
      .map((opening) => (opening === '{' ? '}' : ']'))
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
