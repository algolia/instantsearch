/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default options', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(),
          react: createDefaultWidgetParams(),
          vue: {},
        },
      });

      await openChat(act);

      expect(document.querySelector('.ais-Chat')).toBeInTheDocument();
      expect(document.querySelector('.ais-Chat-container')).toBeInTheDocument();
      expect(document.querySelector('.ais-ChatHeader')).toBeInTheDocument();
      expect(document.querySelector('.ais-ChatMessages')).toBeInTheDocument();
      expect(document.querySelector('.ais-ChatPrompt')).toBeInTheDocument();
    });

    test('sends messages when prompt is submitted', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({});
      const sendMessageSpy = jest
        .spyOn(chat, 'sendMessage')
        .mockResolvedValue(undefined);

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

    test('closes chat when close button is clicked', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(),
          react: createDefaultWidgetParams(),
          vue: {},
        },
      });

      await openChat(act);

      userEvent.click(document.querySelector('.ais-ChatHeader-close')!);

      expect(document.querySelector('.ais-Chat-container')).not.toHaveClass(
        'ais-Chat-container--open'
      );
    });

    test('maximizes and minimizes chat when button is clicked', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(),
          react: createDefaultWidgetParams(),
          vue: {},
        },
      });

      await openChat(act);

      userEvent.click(document.querySelector('.ais-ChatHeader-maximize')!);

      expect(document.querySelector('.ais-Chat')).toHaveClass(
        'ais-Chat--maximized'
      );
      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--maximized'
      );

      userEvent.click(document.querySelector('.ais-ChatHeader-maximize')!);

      expect(document.querySelector('.ais-Chat')).not.toHaveClass(
        'ais-Chat--maximized'
      );
      expect(document.querySelector('.ais-Chat-container')).not.toHaveClass(
        'ais-Chat-container--maximized'
      );
    });

    describe('cssClasses', () => {
      test('adds custom CSS classes', async () => {
        const searchClient = createSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(),
              cssClasses: {
                root: 'ROOT',
                container: 'CONTAINER',
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              classNames: {
                root: 'ROOT',
                container: 'CONTAINER',
              },
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(document.querySelector('.ais-Chat')).toHaveClass('ROOT');
        expect(document.querySelector('.ais-Chat-container')).toHaveClass(
          'CONTAINER'
        );
      });
    });

    describe('tools', () => {
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
            javascript: createDefaultWidgetParams(chat),
            react: createDefaultWidgetParams(chat),
            vue: {},
          },
        });

        await openChat(act);

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
            javascript: {
              ...createDefaultWidgetParams(chat),
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
              ...createDefaultWidgetParams(chat),
              tools: {
                hello: {
                  layoutComponent: () => (
                    <div id="tool-content">The message said hello!</div>
                  ),
                },
              },
            },
            vue: {},
          },
        });

        await openChat(act);

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
            javascript: {
              ...createDefaultWidgetParams(chat),
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
              ...createDefaultWidgetParams(chat),
              tools: {
                [SearchIndexToolType]: {
                  layoutComponent: () => (
                    <div id="tool-content">The message said hello!</div>
                  ),
                },
              },
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(document.querySelector('#tool-content')!.textContent).toBe(
          'The message said hello!'
        );
      });
    });
  });
}
