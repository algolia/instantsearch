import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import { openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export function createPersistenceTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('persistence', () => {
    test('restores and updates the open state when enabled', async () => {
      sessionStorage.clear();
      const searchClient = createSearchClient();
      const cacheKey = 'instantsearch-chat-open-state-chat';
      sessionStorage.setItem(cacheKey, 'true');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
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

      expect(
        document.querySelector(
          '.ais-ChatToggleButton:not(.ais-ChatToggleButton--open)'
        )
      ).toBeNull();

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--open'
      );
      expect(document.querySelector('.ais-ChatToggleButton')).toHaveClass(
        'ais-ChatToggleButton--open'
      );

      await act(async () => {
        (
          document.querySelector('.ais-ChatHeader-close') as HTMLButtonElement
        ).click();
      });

      expect(sessionStorage.getItem(cacheKey)).toBe('false');
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
  });
}
