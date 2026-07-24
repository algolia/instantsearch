import { createSearchClient } from '@instantsearch/mocks';
import { within } from '@testing-library/dom';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function createChatWithReasoning() {
  return new Chat({
    messages: [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Check the **catalog**.',
            state: 'done',
          },
          {
            type: 'reasoning',
            text: 'Compare release dates.',
            state: 'done',
          },
          { type: 'text', text: 'The answer is 2001.' },
        ],
      },
    ],
  });
}

export function createReasoningTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('reasoning', () => {
    test('does not render reasoning by default', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(createChatWithReasoning()),
          react: createDefaultWidgetParams(createChatWithReasoning()),
          vue: {},
        },
      });

      await openChat(act);

      expect(
        within(document.body).queryByRole('group', { name: 'Reasoning' })
      ).not.toBeInTheDocument();
      expect(document.body).not.toHaveTextContent('Check the catalog.');
    });

    test('renders each reasoning part in a collapsed disclosure when enabled', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(createChatWithReasoning()),
            showReasoning: true,
          },
          react: {
            ...createDefaultWidgetParams(createChatWithReasoning()),
            showReasoning: true,
            messagesProps: {
              onClose: () => {},
              onReload: () => {},
              assistantMessageProps: {
                autoHideActions: true,
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      const disclosures = within(document.body).getAllByRole('group', {
        name: 'Reasoning',
      });
      expect(disclosures).toHaveLength(2);
      expect(disclosures[0]).not.toHaveAttribute('open');
      expect(disclosures[1]).not.toHaveAttribute('open');
      expect(disclosures[0]).toHaveTextContent('Check the catalog.');
      expect(disclosures[0].querySelector('strong')).toHaveTextContent(
        'catalog'
      );
      expect(disclosures[1]).toHaveTextContent('Compare release dates.');
    });

    test('renders the translated reasoning label', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(createChatWithReasoning()),
            showReasoning: true,
            templates: {
              message: {
                reasoningLabelText: 'Raisonnement',
              },
            },
          },
          react: {
            ...createDefaultWidgetParams(createChatWithReasoning()),
            showReasoning: true,
            translations: {
              message: {
                reasoningLabel: 'Raisonnement',
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        within(document.body).getAllByRole('group', {
          name: 'Raisonnement',
        })
      ).toHaveLength(2);
    });
  });
}
