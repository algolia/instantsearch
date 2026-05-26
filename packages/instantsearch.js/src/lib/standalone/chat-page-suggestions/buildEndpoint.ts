export function buildEndpoint({
  appId,
  agentId,
}: {
  appId: string;
  agentId: string;
}): string {
  return `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5&stream=false`;
}
