export async function sendChatMessageFeedback({
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
}): Promise<Response | undefined> {
  try {
    const response = await fetch(
      `https://${appId}.algolia.net/agent-studio/1/feedback`,
      {
        method: 'POST',
        body: JSON.stringify({ messageId, agentId, vote }),
        headers: {
          'x-algolia-application-id': appId,
          'x-algolia-api-key': apiKey,
          'content-type': 'application/json',
        },
        signal: abortSignal,
      }
    );

    if (response.status >= 300) {
      const data = await response.json();
      console.error(`Cannot send feedback: ${data.message}`);
      return undefined;
    }

    return response;
  } catch (error) {
    console.error(
      `Cannot send feedback: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return undefined;
  }
}
