import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import React from 'react';

import type { ChatPageSuggestionsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchResponse } from 'instantsearch.js';

// The connector debounces the fetch that follows a results change by 300ms.
const DEBOUNCE_MS = 300;

const SUGGESTIONS = ['Suggestion A', 'Suggestion B', 'Suggestion C'];

function createResultsClient() {
  return createSearchClient({
    search: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            hits: [{ objectID: '1', name: 'Product 1' }],
            nbHits: 1,
            page: 0,
            nbPages: 1,
            hitsPerPage: 20,
            processingTimeMS: 1,
            query: '',
            params: '',
            index: 'indexName',
          },
        ] as unknown as Array<SearchResponse<any>>,
      })
    ) as MockSearchClient['search'],
  });
}

function mockAgentFetch() {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ output: { suggestions: SUGGESTIONS } }),
    } as Response)
  ) as unknown as typeof fetch;
}

export function createTemplatesTests(
  setup: ChatPageSuggestionsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('templates', () => {
    test('replaces the default pills with a custom layout', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            templates: {
              layout: ({ suggestions }) =>
                `Custom layout: ${suggestions.join(', ')}`,
            },
          },
          react: {
            agentId: 'test-agent-id',
            layoutComponent: ({ suggestions }) => (
              <div className="custom-layout">
                Custom layout: {suggestions.join(', ')}
              </div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      // The custom layout owns the whole markup, so the default UI component
      // (and its `ais-ChatPromptSuggestions` root) is not rendered.
      expect(
        document.querySelector('.ais-ChatPromptSuggestions')
      ).toBeNull();
      expect(document.body.textContent).toContain(
        'Custom layout: Suggestion A, Suggestion B, Suggestion C'
      );
    });
  });
}
