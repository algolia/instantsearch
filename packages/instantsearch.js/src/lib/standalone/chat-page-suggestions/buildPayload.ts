export type ChatPageSuggestionsPrepareRequest = (
  body: Record<string, unknown>
) => { body: Record<string, unknown> };

export type BuildPayloadInput = {
  query?: string;
  hitsSample?: unknown[];
  context?: Record<string, unknown>;
};

export type BuildPayloadOptions = {
  maxSuggestions: number;
  prepareSendMessagesRequest?: ChatPageSuggestionsPrepareRequest;
};

export function buildPayload(
  input: BuildPayloadInput,
  { maxSuggestions, prepareSendMessagesRequest }: BuildPayloadOptions
): Record<string, unknown> {
  // When `context` is provided, it IS the message body — the caller has
  // opted out of auto-extraction from `query`/`hitsSample`. Otherwise we
  // auto-shape from the search state (default PLP behavior).
  const body = input.context
    ? { ...input.context, maxSuggestions }
    : {
        query: input.query || '',
        hitsSample: input.hitsSample || [],
        maxSuggestions,
      };

  const messageText = JSON.stringify(body);

  const payload: Record<string, unknown> = {
    messages: [
      {
        id: `sr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        role: 'user',
        parts: [{ type: 'text', text: messageText }],
      },
    ],
  };

  return prepareSendMessagesRequest
    ? prepareSendMessagesRequest(payload).body
    : payload;
}
