export function sendChatMessageFeedback({
  agentId,
  vote,
  messageId,
  appId,
  apiKey,
}: {
  agentId: string;
  vote: 0 | 1;
  messageId: string;
  appId: string;
  apiKey: string;
}): Promise<Response> {
  return fetch(`https://${appId}.algolia.net/agent-studio/1/feedback`, {
    method: 'POST',
    body: JSON.stringify({ messageId, agentId, vote }),
    headers: {
      'x-algolia-application-id': appId,
      'x-algolia-api-key': apiKey,
      'content-type': 'application/json',
    },
  }).then((response) => {
    if (response.status >= 300) {
      return response.json().then((data) => {
        throw new Error(
          `Feedback request failed with status ${response.status}: ${data.message}`
        );
      });
    }

    return response.json();
  });
}
