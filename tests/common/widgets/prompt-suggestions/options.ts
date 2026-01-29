/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import type { PromptSuggestionsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

const createMockFetch = (suggestions: string[] = []) => {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Hello' },
          {
            type: 'data-suggestions',
            data: { suggestions },
          },
        ],
      }),
  });
};

const createChatInstance = (messages: any = []) => {
  return new Chat({
    // @ts-ignore - we need to mock it partially
    transport: {
      sendMessages: jest.fn().mockResolvedValue({
        pipeThrough: () => ({
          getReader: () => ({
            releaseLock: () => {},
            read: jest.fn().mockResolvedValue({ done: true }),
          }),
        }),
      }),
    },
    messages,
  }) as unknown as Chat<UIMessage>;
};

export function createOptionsTests(
  setup: PromptSuggestionsWidgetSetup,
  _: Required<TestOptions>
) {
  describe('options', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('fetches suggestions with context on init', async () => {
      const searchClient = createSearchClient();
      const mockFetch = createMockFetch(['Suggestion 1', 'Suggestion 2']);
      global.fetch = mockFetch;

      const chat = createChatInstance();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'abc',
            context: { objectID: '123', title: 'Hello' },
            chat,
          },
          react: {
            agentId: 'abc',
            context: { objectID: '123', title: 'Hello' },
            chat,
          },
          vue: {},
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/agent-studio/1/agents/abc/completions?compatibilityMode=ai-sdk-5&stream=false'
        ),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                parts: [
                  {
                    type: 'text',
                    text: JSON.stringify({ objectID: '123', title: 'Hello' }),
                  },
                ],
              },
            ],
          }),
        })
      );
    });

    test('renders buttons with suggestions and sends message when clicked', async () => {
      const searchClient = createSearchClient();
      const mockFetch = createMockFetch(['Suggestion 1', 'Suggestion 2']);
      global.fetch = mockFetch;

      const chat = createChatInstance();
      const sendMessageSpy = jest.spyOn(chat, 'sendMessage');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'abc',
            context: { objectID: '123', title: 'Hello' },
            chat,
          },
          react: {
            agentId: 'abc',
            context: { objectID: '123', title: 'Hello' },
            chat,
          },
          vue: {},
        },
      });

      const suggestion1Button = await screen.findByRole('button', {
        name: /suggestion 1/i,
      });
      const suggestion2Button = await screen.findByRole('button', {
        name: /suggestion 2/i,
      });

      expect(suggestion1Button).toBeInTheDocument();
      expect(suggestion2Button).toBeInTheDocument();

      userEvent.click(suggestion1Button);

      await waitFor(() => {
        expect(sendMessageSpy).toHaveBeenCalledWith({
          text: '<!--ais-context:{"objectID":"123","title":"Hello"}-->Suggestion 1',
        });
      });
    });

    describe('cssClasses', () => {
      test('adds custom CSS classes', async () => {
        const searchClient = createSearchClient();
        const mockFetch = createMockFetch(['Suggestion 1', 'Suggestion 2']);
        global.fetch = mockFetch;

        const chat = createChatInstance();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              agentId: 'abc',
              context: { objectID: '123', title: 'Hello' },
              cssClasses: {
                header: 'HEADER',
                headerIcon: 'HEADER-ICON',
                headerTitle: 'HEADER-TITLE',
                root: 'ROOT',
                suggestions: {
                  root: 'SUGGESTIONS-ROOT',
                  suggestion: 'SUGGESTION',
                },
              },
              chat,
            },
            react: {
              agentId: 'abc',
              context: { objectID: '123', title: 'Hello' },
              classNames: {
                header: 'HEADER',
                headerIcon: 'HEADER-ICON',
                headerTitle: 'HEADER-TITLE',
                root: 'ROOT',
                suggestions: {
                  root: 'SUGGESTIONS-ROOT',
                  suggestion: 'SUGGESTION',
                },
              },
              chat,
            },
            vue: {},
          },
        });

        await screen.findByRole('button', { name: /suggestion 1/i });

        expect(document.querySelector('.ais-PromptSuggestions')).toHaveClass(
          'ROOT'
        );
        expect(
          document.querySelector('.ais-PromptSuggestions-header')
        ).toHaveClass('HEADER');
        expect(
          document.querySelector('.ais-PromptSuggestions-headerIcon')
        ).toHaveClass('HEADER-ICON');
        expect(
          document.querySelector('.ais-PromptSuggestions-headerTitle')
        ).toHaveClass('HEADER-TITLE');
        expect(
          document.querySelector('.ais-ChatPromptSuggestions')
        ).toHaveClass('SUGGESTIONS-ROOT');
        expect(
          document.querySelector('.ais-ChatPromptSuggestions-suggestion')
        ).toHaveClass('SUGGESTION');
      });
    });
  });
}
