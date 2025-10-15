/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import type { ChatWidgetSetup } from '.';
import type { SupportedFlavor, TestOptions } from '../../common';

export function createOptionsTests<T extends SupportedFlavor>(
  setup: ChatWidgetSetup<T>,
  { act, flavor }: Required<TestOptions<T>>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({});
      const sendMessageSpy = jest.spyOn(chat, 'sendMessage');

      const commonWidgetParams = {
        agentId: 'agentId',
        chat,
      };
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: commonWidgetParams,
          react: commonWidgetParams,
          vue: {},
        }[flavor],
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

      const commonWidgetParams = {
        agentId: 'agentId',
        chat: chat as any,
      };

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: commonWidgetParams,
          react: commonWidgetParams,
          vue: {},
        }[flavor],
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

      const commonWidgetParams = {
        agentId: 'agentId',
        chat: chat as any,
      };

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...commonWidgetParams,
            tools: {
              hello: {
                templates: {
                  layout:
                    '<div id="tool-content">The message said hello!</div>',
                },
              },
            },
          },
          react: {
            ...commonWidgetParams,
            tools: {
              hello: {
                layoutComponent: () => (
                  <div id="tool-content">The message said hello!</div>
                ),
              },
            },
          },
          vue: {},
        }[flavor],
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
      const commonWidgetParams = {
        agentId: 'agentId',
        chat: chat as any,
      };

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            ...commonWidgetParams,
            tools: {
              [SearchIndexToolType]: {
                templates: {
                  layout:
                    '<div id="tool-content">The message said hello!</div>',
                },
              },
            },
          },
          react: {
            ...commonWidgetParams,
            tools: {
              [SearchIndexToolType]: {
                layoutComponent: () => (
                  <div id="tool-content">The message said hello!</div>
                ),
              },
            },
          },
          vue: {},
        }[flavor],
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
