import { createSearchClient } from '@instantsearch/mocks';

import { openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export function createPersistenceTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('persistence', () => {
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
