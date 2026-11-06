import { liteClient } from 'algoliasearch/lite';

import { ALGOLIA, BACKEND, IN_BROWSER } from './backend';
import { inlineSearchClient } from './fake/inlineBackend';

import type { SearchClient } from 'instantsearch.js';

type SearchRequest = { indexName: string; params?: Record<string, unknown> };

/**
 * Agent Studio mode searches Algolia directly: the agentic trigger comes from
 * query rules on the index. Fake mode searches the fixture backend
 * (`server/search.mjs`), which speaks the same multi-query shape.
 */
export const searchClient: SearchClient = IN_BROWSER
  ? inlineSearchClient
  : BACKEND === 'agent-studio'
    ? liteClient(ALGOLIA.appId, ALGOLIA.searchApiKey)
    : ({
        search(requests: SearchRequest[]) {
          return fetch('/search', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ requests }),
          }).then((response) => {
            if (!response.ok) {
              throw new Error(`Search failed: ${response.status}`);
            }
            return response.json();
          });
        },
      } as unknown as SearchClient);
