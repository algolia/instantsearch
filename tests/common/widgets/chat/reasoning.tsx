import { createSearchClient } from '@instantsearch/mocks';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

const reasoningMessages = [
  {
    id: '0',
    role: 'assistant' as const,
    parts: [
      {
        type: 'reasoning' as const,
        text: 'Looking at product images and comparing them.',
      },
      { type: 'text' as const, text: 'Here are some options.' },
    ],
  },
];

export function createReasoningTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('reasoning', () => {
    test('does not render the reasoning panel by default', async () => {
      const searchClient = createSearchClient();
      const chat = new Chat({ messages: reasoningMessages });

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: createDefaultWidgetParams(chat),
          react: createDefaultWidgetParams(chat),
          vue: {},
        },
      });

      await openChat(act);

      expect(
        document.querySelector('.ais-ChatMessageReasoning')
      ).not.toBeInTheDocument();
    });

    test('renders the reasoning panel when `showReasoning` is enabled', async () => {
      const searchClient = createSearchClient();
      const chat = new Chat({ messages: reasoningMessages });

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            reasoningVisibility: 'expanded',
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            reasoningVisibility: 'expanded',
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        document.querySelector('.ais-ChatMessageReasoning')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.ais-ChatMessageReasoning-text')
      ).toHaveTextContent('Looking at product images and comparing them.');
    });

    test('renders with custom reasoning label translations', async () => {
      const searchClient = createSearchClient();
      const chat = new Chat({ messages: reasoningMessages });

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            reasoningVisibility: 'expanded',
            templates: {
              messages: {
                reasoningTitleText: 'Raisonnement',
                reasoningToggleLabelText: 'Basculer le raisonnement',
              },
            },
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            reasoningVisibility: 'expanded',
            translations: {
              reasoning: {
                title: 'Raisonnement',
                toggleLabel: 'Basculer le raisonnement',
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        document.querySelector('.ais-ChatMessageReasoning-label')
      ).toHaveTextContent('Raisonnement');
      expect(
        document.querySelector('.ais-ChatMessageReasoning-header')
      ).toHaveAttribute('aria-label', 'Basculer le raisonnement');
    });
  });
}
