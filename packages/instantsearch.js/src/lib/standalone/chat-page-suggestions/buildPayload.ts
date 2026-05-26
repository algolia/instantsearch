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
  const messageText = JSON.stringify({
    query: input.query || '',
    hitsSample: input.hitsSample || [],
    context: input.context,
    maxSuggestions,
  });

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
