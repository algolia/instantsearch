export function sendChatMessageFeedback({
  agentId,
  vote,
  messageId,
  appId,
  apiKey,
  abortSignal,
}: {
  agentId: string;
  vote: 0 | 1;
  messageId: string;
  appId: string;
  apiKey: string;
  abortSignal?: AbortSignal;
}): Promise<Response> {
  return fetch(`https://${appId}.algolia.net/agent-studio/1/feedback`, {
    method: 'POST',
    body: JSON.stringify({ messageId, agentId, vote }),
    headers: {
      'x-algolia-application-id': appId,
      'x-algolia-api-key': apiKey,
      'content-type': 'application/json',
    },
    ...(abortSignal ? { signal: abortSignal } : {}),
  });
}
