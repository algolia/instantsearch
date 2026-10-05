/**
 * Where a streamed JSON document currently ends.
 *
 * Tool input streams in as raw text and is parsed with partial-JSON repair, so
 * a value still mid-delta reaches `input` looking complete: an open string is
 * closed, an open array or object is closed. A tool that renders while the
 * input streams uses this cursor to tell the settled part of the document from
 * the part still being written.
 */

export type JsonCursorFrame = {
  /** The property the container was opened under; `''` for the root and for array items. */
  key: string;
  /** The last property name read inside this container, when it is an object. */
  lastKey: string;
  isObject: boolean;
};

export type JsonCursor = {
  /** The innermost container first opened last: `frames[0]` is the root. */
  frames: JsonCursorFrame[];
  /** Whether the document ends inside an unterminated string literal. */
  inString: boolean;
  /** When `inString`, whether that string is a property name rather than a value. */
  isKey: boolean;
};

/**
 * Decodes a raw property-key body with JSON string semantics, so an escaped
 * spelling of a name compares equal to the name `JSON.parse` produces. An
 * undecodable key is kept verbatim: it matches no name, and the document
 * holding it cannot parse either.
 */
function decodeJsonKey(rawKey: string) {
  if (rawKey.indexOf('\\') === -1) {
    return rawKey;
  }
  try {
    return JSON.parse(`"${rawKey}"`) as string;
  } catch {
    return rawKey;
  }
}

export function getJsonCursor(rawJson: string): JsonCursor {
  const frames: JsonCursorFrame[] = [];
  let inString = false;
  let isEscaped = false;
  let isKey = false;
  let expectValue = false;
  let stringStart = 0;

  for (let index = 0; index < rawJson.length; index++) {
    const char = rawJson[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
        if (isKey) {
          frames[frames.length - 1].lastKey = decodeJsonKey(
            rawJson.slice(stringStart, index)
          );
        } else {
          expectValue = false;
        }
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      stringStart = index + 1;
      isKey = !expectValue && frames[frames.length - 1]?.isObject === true;
    } else if (char === ':') {
      expectValue = true;
    } else if (char === ',') {
      expectValue = false;
    } else if (char === '{' || char === '[') {
      frames.push({
        key: expectValue ? (frames[frames.length - 1]?.lastKey ?? '') : '',
        lastKey: '',
        isObject: char === '{',
      });
      expectValue = false;
    } else if (char === '}' || char === ']') {
      frames.pop();
      expectValue = false;
    }
  }

  return { frames, inString, isKey };
}

/**
 * Whether the document ends inside the root property `key` — that property's
 * value is still being written (an open string, array, or object under it).
 */
export function endsInsideRootProperty(cursor: JsonCursor, key: string) {
  const [root, child] = cursor.frames;
  if (!root || !root.isObject) {
    return false;
  }
  if (child) {
    return child.key === key;
  }
  return cursor.inString && !cursor.isKey && root.lastKey === key;
}
