import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({});
      const sendMessageSpy = jest.spyOn(chat, 'sendMessage');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'agentId',
          chat,
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

      await act(async () => {
        await wait(0);
      });

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'Hello, world!'
      );
      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await act(async () => {
        await wait(0);
      });

      expect(sendMessageSpy).toHaveBeenCalledWith({ text: 'Hello, world!' });
    });

    test('renders with default tools', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({
        messages: [
          {
            id: '1',
            role: 'assistant',
            parts: [
              {
                type: `tool-${SearchIndexToolType}`,
                toolCallId: '1',
                input: { text: 'test' },
                state: 'output-available',
                output: { hits: [{ objectID: '123' }] },
              },
            ],
          },
        ],
        id: 'chat-id',
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'agentId',
          chat: chat as any,
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Carousel')).toBeInTheDocument();
    });

    test('renders with client side tools', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({
        messages: [
          {
            id: '1',
            role: 'assistant',
            parts: [
              {
                type: 'tool-hello',
                toolCallId: '1',
                input: { text: 'hello' },
                state: 'output-available',
                output: 'hello',
              },
            ],
          },
        ],
        id: 'chat-id',
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'agentId',
          chat: chat as any,
          tools: {
            hello: {
              template: {
                component: (_, { html }) =>
                  html`<div id="tool-content">The message said hello!</div>`,
              },
            },
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('#tool-content')!.textContent).toBe(
        'The message said hello!'
      );
    });

    test('renders with custom algolia search tool', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({
        messages: [
          {
            id: '1',
            role: 'assistant',
            parts: [
              {
                type: `tool-${SearchIndexToolType}`,
                toolCallId: '1',
                input: { text: 'hello' },
                state: 'output-available',
                output: 'hello',
              },
            ],
          },
        ],
        id: 'chat-id',
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'agentId',
          chat: chat as any,
          tools: {
            [SearchIndexToolType]: {
              template: {
                component: (_, { html }) =>
                  html`<div id="tool-content">The message said hello!</div>`,
              },
            },
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('#tool-content')!.textContent).toBe(
        'The message said hello!'
      );
    });
  });
}
