import type { ChatMessageBase } from '../../components';

export const getTextContent = (message: ChatMessageBase) => {
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
};

export const hasTextContent = (message: ChatMessageBase) => {
  return getTextContent(message).trim() !== '';
};

export const isPartText = (
  part: ChatMessageBase['parts'][number]
): part is Extract<ChatMessageBase['parts'][number], { type: 'text' }> => {
  return part.type === 'text';
};

/**
 * Unwraps nested JSON / double-encoded strings from streaming `error` chunks
 * (e.g. LangGraph `errorText` payloads). Each segment is one unwrap step; the
 * last entry is the innermost string (when wrapping exists).
 */
function collectErrorMessageSegments(raw: string): string[] {
  const segments: string[] = [raw];
  let remaining = raw.trim();

  for (let depth = 0; depth < 8; depth += 1) {
    try {
      const parsed: unknown = JSON.parse(remaining);
      if (typeof parsed === 'string') {
        segments.push(parsed);
        remaining = parsed.trim();
        continue;
      }
      if (
        parsed &&
        typeof parsed === 'object' &&
        'message' in parsed &&
        typeof (parsed as { message: unknown }).message === 'string'
      ) {
        const inner = (parsed as { message: string }).message;
        segments.push(inner);
        remaining = inner.trim();
        continue;
      }
      if (
        parsed &&
        typeof parsed === 'object' &&
        'error' in parsed &&
        typeof (parsed as { error: unknown }).error === 'string'
      ) {
        const inner = (parsed as { error: string }).error;
        segments.push(inner);
        remaining = inner.trim();
        continue;
      }
      break;
    } catch {
      break;
    }
  }

  return segments;
}

/**
 * Unwraps nested JSON / double-encoded strings from streaming `error` chunks
 * (e.g. LangGraph `errorText` payloads) into one searchable string.
 */
export function flattenErrorMessageForMatching(raw: string): string {
  return collectErrorMessageSegments(raw).join('\n');
}

/**
 * API / transport error text for display: {@link Error.message}, or the
 * innermost unwrapped string when the message is JSON-wrapped.
 */
function getUnwrappedApiErrorDisplayMessage(error: Error): string {
  const segments = collectErrorMessageSegments(error.message);
  return segments.length > 1 ? segments[segments.length - 1] : error.message;
}

/**
 * Predicate on the flattened error string. Register more at runtime via
 * {@link registerNewConversationErrorMatcher} for product-specific API errors.
 */
export type NewConversationErrorMatcher = (flatMessage: string) => boolean;

/**
 * True when the flattened text indicates thread / conversation depth limit
 * (wording varies by API).
 */
function matchesThreadDepthLimitError(flatLower: string): boolean {
  return (
    flatLower.includes('maximum thread depth') ||
    flatLower.includes('max thread depth') ||
    (flatLower.includes('thread depth') && flatLower.includes('conversation'))
  );
}

/**
 * True for stream/model output limit — uses `max_output` as a token/code, not
 * substrings of words like “maximum”. Runs on lowercased text so casing matches
 * the `includes` checks and the `max_output` token regex.
 */
function matchesMaxOutputIncompleteError(flatLower: string): boolean {
  if (flatLower.includes('max_output_tokens')) {
    return true;
  }
  if (
    flatLower.includes('response is incomplete') &&
    /\bmax_output\b/.test(flatLower)
  ) {
    return true;
  }
  return false;
}

/**
 * True for LangGraph-style recursion limit errors (wording varies by API).
 */
function matchesRecursionLimitError(flatLower: string): boolean {
  return flatLower.includes('recursion limit of');
}

/**
 * Agent / graph “max steps” style limits (wording varies by API).
 */
function matchesMaxStepsLimitError(flatLower: string): boolean {
  return (
    flatLower.includes('max_steps') ||
    flatLower.includes('max steps') ||
    flatLower.includes('maximum steps') ||
    flatLower.includes('step limit')
  );
}

/**
 * HTTP / API rate limiting (429, “too many requests”, etc.).
 */
function matchesRateLimitError(flatLower: string): boolean {
  if (
    flatLower.includes('rate limit') ||
    flatLower.includes('rate_limit') ||
    flatLower.includes('ratelimit')
  ) {
    return true;
  }
  if (flatLower.includes('too many requests')) {
    return true;
  }
  if (flatLower.includes('throttl')) {
    return true;
  }
  if (/\b429\b/.test(flatLower)) {
    return true;
  }
  return false;
}

/**
 * Default matchers for errors where the user should start a new conversation
 * (same UX: conversation-limit alert, “Start a new conversation”, hidden prompt, etc.).
 */
export const newConversationErrorMatchers: NewConversationErrorMatcher[] = [
  (m) => matchesThreadDepthLimitError(m.toLowerCase()),
  (m) => matchesRecursionLimitError(m.toLowerCase()),
  (m) => matchesMaxStepsLimitError(m.toLowerCase()),
  (m) => matchesMaxOutputIncompleteError(m.toLowerCase()),
  (m) => matchesRateLimitError(m.toLowerCase()),
];

/**
 * Register an extra matcher (e.g. for a new Agent Studio error code) without
 * forking the library.
 */
export function registerNewConversationErrorMatcher(
  fn: NewConversationErrorMatcher
): void {
  newConversationErrorMatchers.push(fn);
}

/**
 * Maps a flattened API error string to a short, user-facing line. Return
 * `null` or `undefined` to try the next resolver; if none match, the raw
 * {@link Error.message} is shown.
 */
export type StartNewConversationErrorDisplayResolver = (
  flatMessage: string,
  rawMessage: string
) => string | null | undefined;

/** Legacy shortened copy for LangGraph / agent recursion limits. */
export const START_NEW_CONVERSATION_RECURSION_MESSAGE =
  'Recursion limit reached';

const defaultStartNewConversationErrorDisplayResolvers: StartNewConversationErrorDisplayResolver[] =
  [];

/**
 * Resolvers run in order (index `0` first). Use
 * {@link registerStartNewConversationErrorDisplayResolver} to prepend
 * product-specific mappings ahead of the defaults.
 */
export const startNewConversationErrorDisplayResolvers: StartNewConversationErrorDisplayResolver[] =
  [...defaultStartNewConversationErrorDisplayResolvers];

export function registerStartNewConversationErrorDisplayResolver(
  resolver: StartNewConversationErrorDisplayResolver
): void {
  startNewConversationErrorDisplayResolvers.unshift(resolver);
}

/**
 * Legacy shortened copy for thread-depth limits. Thread-depth errors now use
 * the API message in the UI; this remains for backwards compatibility.
 */
export const START_NEW_CONVERSATION_THREAD_DEPTH_MESSAGE =
  'Conversation has reached its maximum thread depth';

/** Legacy shortened copy for `max_output_tokens` / incomplete stream output. */
export const START_NEW_CONVERSATION_MAX_OUTPUT_MESSAGE =
  "Token limit reached — the answer couldn't finish.";

function resolveStartNewConversationErrorDisplayMessage(error: Error): string {
  const flat = flattenErrorMessageForMatching(error.message);
  const flatLower = flat.toLowerCase();

  // Ordered “map”: first matching rule wins. Put strict / unambiguous signals first,
  // then recursion before thread depth: some payloads still mention “thread depth”
  // from an earlier turn or bundle multiple hints; when recursion is the active
  // failure it must win over the broader thread-depth phrase match.
  // 1) Output token / incomplete response (`max_output_tokens`, etc.).
  if (matchesMaxOutputIncompleteError(flatLower)) {
    return getUnwrappedApiErrorDisplayMessage(error);
  }
  // 2) Recursion limit (LangGraph, etc.).
  if (matchesRecursionLimitError(flatLower)) {
    return getUnwrappedApiErrorDisplayMessage(error);
  }
  // 3) Max steps (agent / graph limits).
  if (matchesMaxStepsLimitError(flatLower)) {
    return getUnwrappedApiErrorDisplayMessage(error);
  }
  // 4) Rate limiting (HTTP 429, “too many requests”, …).
  if (matchesRateLimitError(flatLower)) {
    return getUnwrappedApiErrorDisplayMessage(error);
  }
  // 5) Optional product-specific resolvers (prepend with registerStartNewConversationErrorDisplayResolver).
  for (const resolver of startNewConversationErrorDisplayResolvers) {
    const resolved = resolver(flat, error.message);
    if (resolved != null && resolved !== '') {
      return resolved;
    }
  }
  // 6) Thread / conversation depth — API text.
  if (matchesThreadDepthLimitError(flatLower)) {
    return getUnwrappedApiErrorDisplayMessage(error);
  }
  return error.message;
}

/**
 * User-facing copy for “start a new conversation” errors (API message for
 * built-in cases, plus optional display resolvers). Returns `undefined` when
 * the error is not treated as a start-new-conversation error.
 */
export function getStartNewConversationErrorDisplayMessage(
  error: Error | undefined
): string | undefined {
  if (!error?.message || !isStartNewConversationError(error)) {
    return undefined;
  }
  return resolveStartNewConversationErrorDisplayMessage(error);
}

/**
 * Maps a flattened API / stream error string to a short user-facing line for
 * errors that are not “start a new conversation”. Prefer
 * {@link registerNewConversationErrorMatcher} when the UX should match
 * thread-depth / recursion (alert + new conversation).
 */
export type GenericChatErrorDisplayResolver = (
  flatMessage: string,
  rawMessage: string
) => string | null | undefined;

/**
 * Legacy stable line for Agent Studio HTTP 403 when the origin is not allowlisted.
 * The UI now shows the API message by default.
 */
export const REQUEST_ORIGIN_NOT_ALLOWED_MESSAGE =
  'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.';

function matchesRequestOriginNotAllowedError(flatLower: string): boolean {
  return (
    flatLower.includes('request origin is not in the allowed domains') ||
    (flatLower.includes('request origin') &&
      flatLower.includes('allowed domains list'))
  );
}

/**
 * HTTP / Agent Studio error when the app origin is missing from allowed domains.
 */
export function isRequestOriginNotAllowedError(
  error: Error | undefined
): boolean {
  if (!error?.message) {
    return false;
  }
  const flat = flattenErrorMessageForMatching(error.message);
  return matchesRequestOriginNotAllowedError(flat.toLowerCase());
}

const defaultGenericChatErrorDisplayResolvers: GenericChatErrorDisplayResolver[] =
  [
    (flat, rawMessage) => {
      if (matchesRequestOriginNotAllowedError(flat.toLowerCase())) {
        return getUnwrappedApiErrorDisplayMessage(new Error(rawMessage));
      }
      return null;
    },
  ];

/**
 * Resolvers for generic chat errors (not “start new conversation”). Includes a
 * default mapping for Agent Studio HTTP 403 “request origin not allowed”.
 * Prepend custom resolvers with {@link registerGenericChatErrorDisplayResolver}.
 */
export const genericChatErrorDisplayResolvers: GenericChatErrorDisplayResolver[] =
  [...defaultGenericChatErrorDisplayResolvers];

export function registerGenericChatErrorDisplayResolver(
  resolver: GenericChatErrorDisplayResolver
): void {
  genericChatErrorDisplayResolvers.unshift(resolver);
}

function resolveGenericChatErrorDisplayMessage(error: Error): string {
  const flat = flattenErrorMessageForMatching(error.message);
  for (const resolver of genericChatErrorDisplayResolvers) {
    const resolved = resolver(flat, error.message);
    if (resolved != null && resolved !== '') {
      return resolved;
    }
  }
  return error.message;
}

/**
 * User-facing error line for chat: “start new conversation” errors (API text),
 * then optional generic resolvers (e.g. request origin), then {@link Error.message}.
 */
export function getChatErrorDisplayMessage(
  error: Error | undefined
): string | undefined {
  if (!error?.message) {
    return undefined;
  }
  if (isStartNewConversationError(error)) {
    return getStartNewConversationErrorDisplayMessage(error) ?? error.message;
  }
  return resolveGenericChatErrorDisplayMessage(error);
}

/**
 * Whether this error should get the “start a new conversation” treatment
 * (thread depth, recursion, max steps, `max_output_tokens` / incomplete output,
 * rate limiting, and any registered matchers).
 */
export function isStartNewConversationError(error: Error | undefined): boolean {
  if (!error?.message) {
    return false;
  }
  const flat = flattenErrorMessageForMatching(error.message);
  return newConversationErrorMatchers.some((fn) => fn(flat));
}

/**
 * Detects Agent Studio (and similar) errors when the chat thread has reached
 * its maximum depth. Message wording comes from the completions API.
 *
 * Prefer {@link isStartNewConversationError} for UI that should also cover
 * recursion limits and other recoverable-by-new-chat errors.
 */
export function isConversationThreadDepthLimitError(
  error: Error | undefined
): boolean {
  if (!error?.message) {
    return false;
  }
  const flat = flattenErrorMessageForMatching(error.message);
  return matchesThreadDepthLimitError(flat.toLowerCase());
}
