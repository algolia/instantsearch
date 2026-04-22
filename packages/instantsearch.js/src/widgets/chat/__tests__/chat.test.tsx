/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { screen } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import chat from '../chat';

describe('chat', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({ indexName: 'indexName', searchClient });

        search.addWidgets([
          chat({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/"
      `);
    });
  });

  describe('search tool compatibility', () => {
    test('renders search results from Agent Studio', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });

      search.addWidgets([
        chat({
          container,
          agentId: 'test-agent-id',
          templates: { item: (hit) => `<div>${hit.name}</div>` },
          messages: [
            {
              id: 'assistant-message-id',
              role: 'assistant',
              parts: [
                {
                  type: 'tool-algolia_search_index',
                  toolCallId: 'tool-call-1',
                  state: 'output-available',
                  input: { query: 'products' },
                  output: {
                    hits: [
                      { objectID: '1', name: 'Product 1', __position: 1 },
                      { objectID: '2', name: 'Product 2', __position: 2 },
                    ],
                    nbHits: 100,
                  },
                },
              ],
            },
          ],
        }),
      ]);

      search.start();
      await wait(0);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    test('renders search results from Algolia MCP Server', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });

      search.addWidgets([
        chat({
          container,
          agentId: 'test-agent-id',
          templates: { item: (hit) => `<div>${hit.name}</div>` },
          messages: [
            {
              id: 'assistant-message-id',
              role: 'assistant',
              parts: [
                {
                  type: 'tool-algolia_search_index_products',
                  toolCallId: 'tool-call-1',
                  state: 'output-available',
                  input: { query: 'products' },
                  output: {
                    hits: [
                      {
                        objectID: '1',
                        name: 'MCP Product 1',
                        __position: 1,
                      },
                      {
                        objectID: '2',
                        name: 'MCP Product 2',
                        __position: 2,
                      },
                    ],
                    nbHits: 50,
                  },
                },
              ],
            },
          ],
        }),
      ]);

      search.start();
      await wait(0);

      expect(screen.getByText('MCP Product 1')).toBeInTheDocument();
      expect(screen.getByText('MCP Product 2')).toBeInTheDocument();
    });
  });
});
