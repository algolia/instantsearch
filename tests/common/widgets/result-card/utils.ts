import { createSearchClient } from '@instantsearch/mocks';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchResponse } from 'instantsearch.js';

// The connector waits this long after a results change before requesting.
export const DEBOUNCE_MS = 700;

export const ANSWER = 'Pick the Pegasus for daily runs.';

/**
 * Search client whose every response carries `query` and activates the card
 * through the Rule payload in `userData` (unless `enabled` is `false`). No
 * widget owns the query in these setups, so the response states it rather
 * than echoing the request.
 */
export function createResultsClient({
  hits = [
    { objectID: '1', name: 'Pegasus' },
    { objectID: '2', name: 'Vomero' },
  ],
  query = 'running shoes',
  enabled = true,
}: {
  hits?: Array<Record<string, unknown>>;
  query?: string;
  enabled?: boolean;
} = {}) {
  return createSearchClient({
    search: jest.fn((requests: unknown[]) =>
      Promise.resolve({
        results: requests.map(() => ({
          hits,
          nbHits: hits.length,
          page: 0,
          nbPages: hits.length ? 1 : 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query,
          params: '',
          index: 'indexName',
          ...(enabled ? { userData: [{ resultCard: { enabled: true } }] } : {}),
        })) as unknown as Array<SearchResponse<any>>,
      })
    ) as MockSearchClient['search'],
  });
}

function sseResponse(chunks: Array<Record<string, unknown>>): Response {
  const body = chunks
    .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
    .join('');
  return new Response(`${body}data: [DONE]`, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/**
 * Mocks `global.fetch` (the Agent Studio transport, not the search client)
 * with a streamed answer.
 */
export function mockAgentFetch(text = ANSWER) {
  const fetchMock = jest.fn(() =>
    Promise.resolve(
      sseResponse([
        { type: 'start', messageId: 'assistant-1' },
        { type: 'text-start', id: 't1' },
        { type: 'text-delta', id: 't1', delta: text },
        { type: 'text-end', id: 't1' },
        { type: 'finish' },
      ])
    )
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}
