export const AGENT_STREAM_PATH: string;
export function search(body: {
  requests?: Array<{ indexName: string; params?: Record<string, unknown> }>;
}): { results: unknown[] };
