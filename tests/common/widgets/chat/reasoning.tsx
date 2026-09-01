import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';
import React from 'react';

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

    test('renders received reasoning in one collapsed timeline when enabled', async () => {
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
      expect(disclosures).toHaveLength(1);
      expect(disclosures[0]).not.toHaveAttribute('open');
      expect(disclosures[0]).toHaveTextContent('Check the catalog.');
      expect(disclosures[0].querySelector('strong')).toHaveTextContent(
        'catalog'
      );
      expect(disclosures[0]).toHaveTextContent('Compare release dates.');
      expect(
        within(disclosures[0])
          .getAllByRole('listitem')
          .map((entry) => entry.textContent)
      ).toEqual(['Check the catalog.', 'Compare release dates.']);
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
      ).toHaveLength(1);
    });

    test('renders a custom reasoning renderer once per part, in stream order', async () => {
      const searchClient = createSearchClient();
      // Reasoning and text alternate, so a renderer that received the whole
      // array at the first reasoning position would produce
      // `R1, R2, T1, T2` instead of the stream's own order.
      const chat = new Chat({
        messages: [
          {
            id: 'assistant-1',
            role: 'assistant',
            parts: [
              { type: 'reasoning', text: 'R1', state: 'done' },
              { type: 'text', text: 'T1' },
              { type: 'reasoning', text: 'R2', state: 'done' },
              { type: 'text', text: 'T2' },
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
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            templates: {
              assistantMessage: {
                reasoning: ({ part, partIndex }, { html }) =>
                  html`<span
                    class="custom-reasoning-part"
                    data-part-index="${partIndex}"
                    >${part.text}</span
                  >`,
              },
            },
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            messagesProps: {
              assistantMessageProps: {
                reasoningComponent: ({ part, partIndex }) => (
                  <span
                    className="custom-reasoning-part"
                    data-part-index={partIndex}
                  >
                    {part.text}
                  </span>
                ),
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      expect(
        Array.from(document.querySelectorAll('.custom-reasoning-part')).map(
          (element) => ({
            text: element.textContent,
            partIndex: Number(element.getAttribute('data-part-index')),
          })
        )
      ).toEqual([
        { text: 'R1', partIndex: 0 },
        { text: 'R2', partIndex: 2 },
      ]);

      // The built-in disclosure must not also render.
      expect(
        within(document.body).queryAllByRole('group', { name: 'Reasoning' })
      ).toHaveLength(0);

      const message = document.querySelector('.ais-ChatMessage-message')!;
      expect(
        Array.from(message.children).map((child) => child.textContent)
      ).toEqual(['R1', 'T1', 'R2', 'T2']);
    });

    test('keeps a custom renderer disclosure state across a part ending', async () => {
      const searchClient = createSearchClient();
      const firstPart = {
        type: 'reasoning' as const,
        text: 'R1',
        state: 'done' as const,
      };
      const chat = new Chat({
        messages: [
          { id: 'assistant-1', role: 'assistant' as const, parts: [firstPart] },
        ],
      });

      // A consumer rendering its own disclosure owns the open state. The library
      // must not remount an earlier step when a later one arrives.
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            templates: {
              assistantMessage: {
                reasoning: ({ part, partIndex }, { html }) =>
                  html`<details
                    class="custom-reasoning-disclosure"
                    data-part-index="${partIndex}"
                  >
                    <summary>Step</summary>
                    ${part.text}
                  </details>`,
              },
            },
          },
          react: {
            ...createDefaultWidgetParams(chat),
            showReasoning: true,
            messagesProps: {
              assistantMessageProps: {
                reasoningComponent: ({ part, partIndex }) => (
                  <details
                    className="custom-reasoning-disclosure"
                    data-part-index={partIndex}
                  >
                    <summary>Step</summary>
                    {part.text}
                  </details>
                ),
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      const opened = document.querySelector<HTMLDetailsElement>(
        '.custom-reasoning-disclosure'
      )!;
      await act(async () => {
        await userEvent.click(within(opened).getByText('Step'));
        await wait(0);
      });
      expect(opened.open).toBe(true);

      await act(async () => {
        chat.messages = [
          {
            id: 'assistant-1',
            role: 'assistant',
            parts: [
              firstPart,
              { type: 'reasoning', text: 'R2', state: 'done' },
            ],
          },
        ];
        await wait(0);
      });

      const disclosures = document.querySelectorAll<HTMLDetailsElement>(
        '.custom-reasoning-disclosure'
      );
      expect(disclosures).toHaveLength(2);
      expect(disclosures[0]).toBe(opened);
      expect(disclosures[0].open).toBe(true);
      expect(disclosures[1].open).toBe(false);
    });
  });
}
