/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { fireEvent, screen } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import { chatInlineLayout } from '../../../templates';
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

  describe('prompt focus stability', () => {
    // A fresh `layoutComponent` per render would remount the chat subtree
    // and drop textarea focus on every keystroke.
    test('keeps the prompt textarea mounted across re-renders with a custom templates.layout', async () => {
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
          templates: {
            item: (hit) => `<div>${hit.name}</div>`,
            layout: chatInlineLayout(),
          },
        }),
      ]);

      search.start();
      await wait(0);

      const textareaBefore = container.querySelector<HTMLTextAreaElement>(
        '.ais-ChatPrompt-textarea'
      );
      expect(textareaBefore).toBeInstanceOf(HTMLTextAreaElement);

      textareaBefore!.focus();
      expect(document.activeElement).toBe(textareaBefore);

      // Typing into the prompt triggers the widget's internal setInput ->
      // connector re-render path. Before the fix, the chat subtree was
      // remounted here and the textarea DOM node was replaced.
      fireEvent.input(textareaBefore!, { target: { value: 'h' } });
      await wait(0);
      fireEvent.input(textareaBefore!, { target: { value: 'he' } });
      await wait(0);
      fireEvent.input(textareaBefore!, { target: { value: 'hel' } });
      await wait(0);

      const textareaAfter = container.querySelector(
        '.ais-ChatPrompt-textarea'
      );

      expect(textareaAfter).toBe(textareaBefore);
      expect(document.activeElement).toBe(textareaAfter);
    });
  });
});
