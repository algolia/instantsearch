import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

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

    test('copies only answer text when reasoning is hidden', async () => {
      const searchClient = createSearchClient();
      const writeText = jest.fn();
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });

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

      userEvent.click(
        within(document.body).getByRole('button', {
          name: 'Copy to clipboard',
        })
      );

      expect(writeText).toHaveBeenCalledWith('The answer is 2001.');
    });

    test('does not offer Copy when hidden reasoning is the only content', async () => {
      const searchClient = createSearchClient();
      const chat = new Chat({
        messages: [
          {
            id: 'assistant-reasoning-only',
            role: 'assistant',
            parts: [
              {
                type: 'reasoning',
                text: 'No answer was produced.',
                state: 'done',
              },
            ],
          },
        ],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(chat),
          react: createDefaultWidgetParams(chat),
          vue: {},
        },
      });

      await openChat(act);

      expect(
        within(document.body).queryByRole('button', {
          name: 'Copy to clipboard',
        })
      ).not.toBeInTheDocument();
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

    test('keeps an active reasoning disclosure collapsed until the reader opens it', async () => {
      const searchClient = createSearchClient();
      const activeMessage: UIMessage = {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Checking the catalog',
            state: 'streaming',
          },
        ],
      };
      const answeringMessage: UIMessage = {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          { type: 'reasoning', text: 'Checking the catalog', state: 'done' },
          { type: 'text', text: 'The answer is 2001.', state: 'streaming' },
        ],
      };
      const chat = new Chat({ messages: [activeMessage] });
      chat._state.status = 'streaming';

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          vue: {},
        },
      });

      await openChat(act);

      const disclosure = within(document.body).getByRole('group', {
        name: 'Reasoning',
      });
      expect(disclosure).not.toHaveAttribute('open');
      expect(disclosure).toHaveAttribute('aria-busy', 'true');

      userEvent.click(disclosure.querySelector('summary')!);
      expect(disclosure).toHaveAttribute('open');

      // Reasoning ending and the answer starting must not close a disclosure
      // the reader opened.
      await act(async () => {
        chat.messages = [answeringMessage];
        await wait(0);
      });

      const streamedDisclosure = within(document.body).getByRole('group', {
        name: 'Reasoning',
      });
      expect(streamedDisclosure).toHaveAttribute('open');
      expect(streamedDisclosure).toHaveAttribute('aria-busy', 'false');
    });

    test('moves the streaming state to a newly appended response', async () => {
      const searchClient = createSearchClient();
      const previousMessage = {
        id: 'assistant-previous',
        role: 'assistant' as const,
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Previous reasoning',
            state: 'streaming' as const,
          },
        ],
      };
      const chat = new Chat({ messages: [previousMessage] });
      chat._state.status = 'streaming';

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        within(document.body).getByRole('group', {
          name: 'Reasoning',
        })
      ).toHaveAttribute('aria-busy', 'true');

      await act(async () => {
        chat.messages = [
          previousMessage,
          {
            id: 'assistant-current',
            role: 'assistant',
            parts: [
              {
                type: 'reasoning',
                text: 'Current reasoning',
                state: 'streaming',
              },
            ],
          },
        ];
        await wait(0);
      });

      const disclosures = within(document.body).getAllByRole('group', {
        name: 'Reasoning',
      });
      expect(disclosures).toHaveLength(2);
      expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
      expect(disclosures[1]).toHaveAttribute('aria-busy', 'true');
    });

    test('stops showing reasoning as busy when answer text starts streaming', async () => {
      const searchClient = createSearchClient();
      const chat = new Chat({
        messages: [
          {
            id: 'assistant-1',
            role: 'assistant',
            parts: [
              {
                type: 'reasoning',
                text: 'Checking the catalog',
                state: 'streaming',
              },
              {
                type: 'text',
                text: 'Here is what I found',
                state: 'streaming',
              },
            ],
          },
        ],
      });
      chat._state.status = 'streaming';

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        within(document.body).getByRole('group', { name: 'Reasoning' })
      ).toHaveAttribute('aria-busy', 'false');
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
