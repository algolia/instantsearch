import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { ChatPageSuggestionsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchResponse } from 'instantsearch.js';

// The connector debounces the fetch that follows a results change by 300ms.
const DEBOUNCE_MS = 300;

const SUGGESTIONS = ['Suggestion A', 'Suggestion B', 'Suggestion C'];

function createResultsClient(hits: Array<Record<string, unknown>>) {
  return createSearchClient({
    search: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            hits,
            nbHits: hits.length,
            page: 0,
            nbPages: hits.length ? 1 : 0,
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

/**
 * Mocks `global.fetch` (the agent-studio transport, not the search client)
 * with the Agent Studio `tasks` response shape `{ output: { suggestions } }`.
 */
function mockAgentFetch(suggestions: string[] = SUGGESTIONS) {
  const fetchMock = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ output: { suggestions } }),
    } as Response)
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

export function createOptionsTests(
  setup: ChatPageSuggestionsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('throws without agentId or transport', () => {
      const searchClient = createSearchClient({});

      expect(() =>
        setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {} as any,
            react: {} as any,
            vue: {},
          },
        })
      ).toThrow(
        'The `agentId` option is required unless a custom `transport` is provided.'
      );
    });

    test('renders the suggestion pills returned by the agent', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
        { objectID: '2', name: 'Product 2' },
      ]);
      mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id' },
          react: { agentId: 'test-agent-id' },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(
        document.querySelector('.ais-ChatPromptSuggestions')
      ).toBeInTheDocument();

      const pills = document.querySelectorAll(
        '.ais-ChatPromptSuggestions-suggestion'
      );
      expect(pills).toHaveLength(SUGGESTIONS.length);
      expect(document.body.textContent).toContain('Suggestion A');
      expect(document.body.textContent).toContain('Suggestion C');
    });

    test('shows loading skeletons while the request is in flight', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);

      // Keep the fetch pending so we can observe the loading state.
      let resolveFetch: () => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({ output: { suggestions: SUGGESTIONS } }),
              } as Response);
          })
      ) as unknown as typeof fetch;

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id' },
          react: { agentId: 'test-agent-id' },
          vue: {},
        },
      });

      // Past the debounce, the request has fired but not resolved: skeletons.
      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(
        document.querySelector('.ais-ChatPromptSuggestions-skeleton')
      ).toBeInTheDocument();
      expect(
        document.querySelectorAll('.ais-ChatPromptSuggestions-skeletonItem')
          .length
      ).toBeGreaterThan(0);
      expect(
        document.querySelector('.ais-ChatPromptSuggestions-suggestion')
      ).toBeNull();

      await act(async () => {
        resolveFetch();
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-ChatPromptSuggestions-suggestion')
      ).toHaveLength(SUGGESTIONS.length);
      expect(
        document.querySelector('.ais-ChatPromptSuggestions-skeleton')
      ).toBeNull();
    });

    test('renders nothing when the agent returns no suggestions', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);
      mockAgentFetch([]);

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id' },
          react: { agentId: 'test-agent-id' },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      // The UI component returns `null` when there are no suggestions and it
      // isn't loading, so no root element is rendered.
      expect(
        document.querySelector('.ais-ChatPromptSuggestions')
      ).toBeNull();
    });

    test('does not request suggestions in PLP mode when there are no hits', async () => {
      const searchClient = createResultsClient([]);
      const fetchMock = mockAgentFetch();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id' },
          react: { agentId: 'test-agent-id' },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(
        document.querySelector('.ais-ChatPromptSuggestions')
      ).toBeNull();
    });

    test('sends requests through a custom transport', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);
      const fetchMock = mockAgentFetch();
      const transport = {
        api: 'https://example.test/agents/xyz/tasks',
        headers: { 'x-custom-header': 'custom-value' },
      };

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { transport },
          react: { transport },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        transport.api,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-custom-header': 'custom-value',
          }),
        })
      );
    });

    test('sends the page context in PDP mode', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);
      const fetchMock = mockAgentFetch();
      const context = { title: 'A product', brand: 'A brand' };

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id', context },
          react: { agentId: 'test-agent-id', context },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(fetchMock).toHaveBeenCalled();
      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit
      ];
      const body = JSON.parse(init.body as string);
      // PDP mode forwards only the context (no auto-extracted hitsSample).
      expect(body.input.pageType).toBe('pdp');
      expect(body.input.title).toBe('A product');
      expect(body.input.brand).toBe('A brand');
      expect(body.input.hitsSample).toBeUndefined();
    });

    test('applies transformItems to the rendered suggestions', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);
      mockAgentFetch();
      const transformItems = jest.fn((items: string[]) =>
        items.map((item) => `Custom ${item}`)
      );

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id', transformItems },
          react: { agentId: 'test-agent-id', transformItems },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      expect(transformItems).toHaveBeenCalledWith(
        SUGGESTIONS,
        expect.objectContaining({ query: expect.any(String) })
      );
      expect(document.body.textContent).toContain('Custom Suggestion A');
    });

    test('runs the onSuggestionClick override when a pill is clicked', async () => {
      const searchClient = createResultsClient([
        { objectID: '1', name: 'Product 1' },
      ]);
      mockAgentFetch();
      const onSuggestionClick = jest.fn();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { agentId: 'test-agent-id', onSuggestionClick },
          react: { agentId: 'test-agent-id', onSuggestionClick },
          vue: {},
        },
      });

      await act(async () => {
        await wait(DEBOUNCE_MS + 50);
      });

      await act(async () => {
        userEvent.click(
          document.querySelector('.ais-ChatPromptSuggestions-suggestion')!
        );
        await wait(0);
      });

      expect(onSuggestionClick).toHaveBeenCalledWith(
        'Suggestion A',
        expect.objectContaining({ sendToChat: expect.any(Function) })
      );
    });
  });
}
