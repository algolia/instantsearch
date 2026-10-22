/**
 * Where a streamed JSON document currently ends: the containers still open,
 * and whether the text stops inside a string.
 *
 * The one scanner behind partial-JSON handling in the chat: the connector
 * closes the open containers to repair a tool's streaming input, and a tool
 * that renders while the input streams reads the same cursor to tell the
 * settled part of the document from the part still being written (repair
 * makes a half-written value look complete).
 */

export type JsonCursorFrame = {
  /** The property the container was opened under; `''` for the root and for array items. */
  key: string;
  /** The last property name read inside this container, when it is an object. */
  lastKey: string;
  isObject: boolean;
  /**
   * How many entries have started in this container so far: array items, or
   * object properties. Counts the entry under the cursor too.
   */
  items: number;
};

export type JsonCursor = {
  /** The open containers, outermost first: `frames[0]` is the root. */
  frames: JsonCursorFrame[];
  /** Whether the document ends inside an unterminated string literal. */
  inString: boolean;
  /** When `inString`, whether that string is a property name rather than a value. */
  isKey: boolean;
  /** When `inString`, whether the last character is a lone escaping backslash. */
  isEscaped: boolean;
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

const WHITESPACE = /\s/;

export function getJsonCursor(rawJson: string): JsonCursor {
  const frames: JsonCursorFrame[] = [];
  let inString = false;
  let isEscaped = false;
  let isKey = false;
  let expectValue = false;
  let entryStarted = false;
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

    if (char === ',' || WHITESPACE.test(char)) {
      if (char === ',') {
        expectValue = false;
        entryStarted = false;
      }
      continue;
    }

    if (char === ':') {
      expectValue = true;
      continue;
    }

    if (char === '}' || char === ']') {
      frames.pop();
      expectValue = false;
      entryStarted = true;
      continue;
    }

    // Anything else starts a value (or a property name): a string, a nested
    // container, or the first character of a number / literal.
    const frame = frames[frames.length - 1];
    if (frame && !entryStarted) {
      frame.items++;
    }
    entryStarted = true;

    if (char === '"') {
      inString = true;
      stringStart = index + 1;
      isKey = !expectValue && frame?.isObject === true;
    } else if (char === '{' || char === '[') {
      frames.push({
        key: expectValue ? (frame?.lastKey ?? '') : '',
        lastKey: '',
        isObject: char === '{',
        items: 0,
      });
      expectValue = false;
      entryStarted = false;
    }
  }

  return { frames, inString, isKey, isEscaped };
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
