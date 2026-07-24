import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import React from 'react';

import type { PromptSuggestionsWidgetSetup } from '.';
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
  setup: PromptSuggestionsWidgetSetup,
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
            configurationId: 'prompt-suggestions',
            templates: {
              layout: ({ suggestions }) =>
                `Custom layout: ${suggestions.join(', ')}`,
            },
          },
          react: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
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
      // (and its `ais-PromptSuggestions` root) is not rendered.
      expect(
        document.querySelector('.ais-PromptSuggestions')
      ).toBeNull();
      expect(document.body.textContent).toContain(
        'Custom layout: Suggestion A, Suggestion B, Suggestion C'
      );
    });

    test('passes the `html` helper to a function layout template', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            templates: {
              // The `{ html }` helper is the second argument — before wiring
              // this template through `TemplateComponent`, it was `undefined`
              // and this tagged-template call threw.
              layout: ({ suggestions }, { html }) =>
                html`<div class="html-layout">
                  ${suggestions.map(
                    (suggestion) =>
                      html`<button type="button">${suggestion}</button>`
                  )}
                </div>`,
            },
          },
          react: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            layoutComponent: ({ suggestions }) => (
              <div className="html-layout">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button">
                    {suggestion}
                  </button>
                ))}
              </div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(document.querySelector('.html-layout')).not.toBeNull();
      expect(
        document.querySelectorAll('.html-layout button')
      ).toHaveLength(SUGGESTIONS.length);
      expect(document.body.textContent).toContain('Suggestion A');
    });

    test('replaces the default header with a custom one', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            templates: {
              header: () => 'Ask me anything',
            },
          },
          react: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            headerComponent: () => <div>Ask me anything</div>,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      // The default header is replaced, but the pills still render.
      expect(
        document.querySelector('.ais-PromptSuggestions-header')
      ).toBeNull();
      expect(document.body.textContent).toContain('Ask me anything');
      expect(
        document.querySelectorAll('.ais-PromptSuggestions-suggestion')
      ).toHaveLength(SUGGESTIONS.length);
    });

    test('translates the header title', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            translations: { headerTitle: 'Ideas' },
          },
          react: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            translations: { headerTitle: 'Ideas' },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(
        document.querySelector('.ais-PromptSuggestions-headerTitle')
      ).toHaveTextContent('Ideas');
    });

    test('disables the header', async () => {
      const searchClient = createResultsClient();
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            templates: { header: false },
          },
          react: {
            agentId: 'test-agent-id',
            configurationId: 'prompt-suggestions',
            headerComponent: false,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(
        document.querySelector('.ais-PromptSuggestions-header')
      ).toBeNull();
      expect(
        document.querySelectorAll('.ais-PromptSuggestions-suggestion')
      ).toHaveLength(SUGGESTIONS.length);
    });
  });
}
