import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export function createPersistenceTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('persistence', () => {
    const openStateKey = 'instantsearch-chat-open-state-chat';

    test('restores and persists open state independently from messages', async () => {
      sessionStorage.clear();
      sessionStorage.setItem(openStateKey, 'true');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          javascript: {
            agentId: 'agentId',
            persistence: false,
            persistOpen: true,
          },
          react: {
            agentId: 'agentId',
            persistence: false,
            persistOpen: true,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--open'
      );

      await act(async () => {
        userEvent.click(document.querySelector('.ais-ChatHeader-close')!);
        await wait(0);
      });

      expect(document.querySelector('.ais-Chat-container')).not.toHaveClass(
        'ais-Chat-container--open'
      );
      expect(sessionStorage.getItem(openStateKey)).toBe('false');
    });

    test('does not enable open persistence with message persistence', async () => {
      sessionStorage.clear();
      sessionStorage.setItem(openStateKey, 'true');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          javascript: {
            agentId: 'agentId',
            persistence: true,
            persistOpen: false,
          },
          react: {
            agentId: 'agentId',
            persistence: true,
            persistOpen: false,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Chat-container')).not.toHaveClass(
        'ais-Chat-container--open'
      );
    });

    test('restores open state with a caller-owned Chat', async () => {
      sessionStorage.clear();
      sessionStorage.setItem(openStateKey, 'true');
      const customChat = new Chat({
        persistence: false,
        transport: {} as any,
      });
      customChat.messages = [
        {
          id: 'owned',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Caller-owned message' }],
        },
      ];

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          javascript: { chat: customChat, persistOpen: true },
          react: { chat: customChat, persistOpen: true },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--open'
      );
      expect(document.body).toHaveTextContent('Caller-owned message');
      expect(customChat.messages).toHaveLength(1);
    });

    test('does not restore persisted messages when persistence is disabled', async () => {
      sessionStorage.clear();
      const searchClient = createSearchClient();
      const cacheKey = 'instantsearch-chat-initial-messages';
      const previousMessages: UIMessage[] = [
        {
          id: 'previous',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Previous persisted answer' }],
        },
      ];
      const initialMessages: UIMessage[] = [
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Fresh greeting' }],
        },
      ];

      sessionStorage.setItem(
        `${cacheKey}-agentId`,
        JSON.stringify(previousMessages)
      );

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'agentId',
            persistence: false,
            initialMessages,
          },
          react: {
            agentId: 'agentId',
            persistence: false,
            initialMessages,
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(document.body).toHaveTextContent('Fresh greeting');
      expect(document.body).not.toHaveTextContent('Previous persisted answer');
    });

    test('renders restored unfinished reasoning as inactive when chat is ready', async () => {
      sessionStorage.clear();
      const searchClient = createSearchClient();
      const cacheKey = 'instantsearch-chat-initial-messages';
      const previousMessages: UIMessage[] = [
        {
          id: 'previous',
          role: 'assistant',
          // A trailing unsettled reasoning part, which is what a response stopped
          // mid-reasoning persists. Any other trailing type would make
          // `isReasoningPartActive` false on its own and not reach the guard.
          parts: [
            {
              type: 'reasoning',
              text: 'A stopped response.',
              state: 'streaming',
            },
          ],
        },
      ];

      sessionStorage.setItem(
        `${cacheKey}-agentId`,
        JSON.stringify(previousMessages)
      );

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'agentId',
            showReasoning: true,
          },
          react: {
            agentId: 'agentId',
            showReasoning: true,
          },
          vue: {},
        },
      });

      await openChat(act);

      const disclosure = within(document.body).getByRole('group', {
        name: 'Reasoning',
      });
      expect(disclosure).toHaveAttribute('aria-busy', 'false');
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-label--streaming')
      ).not.toBeInTheDocument();
    });
  });
}
