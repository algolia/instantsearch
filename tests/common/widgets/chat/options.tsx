/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import {
  chatInlineLayout,
  chatSidePanelLayout,
} from 'instantsearch.js/es/templates';
import React from 'react';
import { ChatInlineLayout, ChatSidePanelLayout } from 'react-instantsearch';

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
        'ais-ChatOverlayLayout--maximized'
      );
      expect(document.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--maximized'
      );

      userEvent.click(document.querySelector('.ais-ChatHeader-maximize')!);

      expect(document.querySelector('.ais-Chat')).not.toHaveClass(
        'ais-ChatOverlayLayout--maximized'
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

      test('adds custom CSS classes for message component', async () => {
        const searchClient = createSearchClient();

        const chat = new Chat({
          messages: [
            {
              id: '1',
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'Hello, world!',
                },
              ],
            },
            {
              id: '2',
              role: 'assistant',
              parts: [
                {
                  type: 'text',
                  text: 'Hi there!',
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
            javascript: {
              ...createDefaultWidgetParams(chat),
              cssClasses: {
                message: {
                  root: 'MESSAGE-ROOT',
                  container: 'MESSAGE-CONTAINER',
                  content: 'MESSAGE-CONTENT',
                  message: 'MESSAGE-MESSAGE',
                  actions: 'MESSAGE-ACTIONS',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              classNames: {
                message: {
                  root: 'MESSAGE-ROOT',
                  container: 'MESSAGE-CONTAINER',
                  content: 'MESSAGE-CONTENT',
                  message: 'MESSAGE-MESSAGE',
                  actions: 'MESSAGE-ACTIONS',
                },
              },
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(document.querySelectorAll('.ais-ChatMessage')[0]).toHaveClass(
          'MESSAGE-ROOT'
        );
        expect(
          document.querySelectorAll('.ais-ChatMessage-container')[0]
        ).toHaveClass('MESSAGE-CONTAINER');
        expect(
          document.querySelectorAll('.ais-ChatMessage-content')[0]
        ).toHaveClass('MESSAGE-CONTENT');
        expect(
          document.querySelectorAll('.ais-ChatMessage-message')[0]
        ).toHaveClass('MESSAGE-MESSAGE');

        expect(document.querySelectorAll('.ais-ChatMessage')[1]).toHaveClass(
          'MESSAGE-ROOT'
        );
        expect(
          document.querySelectorAll('.ais-ChatMessage-container')[1]
        ).toHaveClass('MESSAGE-CONTAINER');
        expect(
          document.querySelectorAll('.ais-ChatMessage-content')[1]
        ).toHaveClass('MESSAGE-CONTENT');
        expect(
          document.querySelectorAll('.ais-ChatMessage-message')[1]
        ).toHaveClass('MESSAGE-MESSAGE');

        expect(document.querySelector('.ais-ChatMessage-actions')).toHaveClass(
          'MESSAGE-ACTIONS'
        );
      });
    });

    describe('loader', () => {
      test('shows loader when status is submitted', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.status = 'submitted';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).toBeInTheDocument();
      });

      test('shows loader during streaming with no parts yet', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
            {
              id: '2',
              role: 'assistant',
              parts: [],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).toBeInTheDocument();
      });

      test('shows loader during streaming when last part is not text', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
            {
              id: '2',
              role: 'assistant',
              // message has text content but ends with a step-start,
              // so the loader should still show (last part is not text)
              parts: [
                { type: 'text', text: 'Searching...' },
                { type: 'step-start' },
              ],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).toBeInTheDocument();
      });

      test('shows loader during streaming when last part is a tool without output', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
            {
              id: '2',
              role: 'assistant',
              parts: [
                {
                  type: `tool-${SearchIndexToolType}`,
                  toolCallId: '1',
                  state: 'input-streaming',
                  input: undefined,
                },
              ],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).toBeInTheDocument();
      });

      test('shows loader during streaming when last part is a tool with output', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
            {
              id: '2',
              role: 'assistant',
              parts: [
                { type: 'text', text: 'Let me search for that.' },
                {
                  type: `tool-${SearchIndexToolType}`,
                  toolCallId: '1',
                  state: 'output-available',
                  input: {},
                  output: { hits: [] },
                },
              ],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).toBeInTheDocument();
      });

      test('does not show loader during streaming when last part is text', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
            {
              id: '2',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Hello back!' }],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessageLoader')
        ).not.toBeInTheDocument();
      });

      test('does not show loader when status is ready', async () => {
        const searchClient = createSearchClient();

        const chat = new Chat({
          messages: [
            {
              id: '1',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Hello!' }],
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
          document.querySelector('.ais-ChatMessageLoader')
        ).not.toBeInTheDocument();
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

      test('applies filters from the algolia search tool view all button', async () => {
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
                  input: {
                    query: 'test',
                    facet_filters: [['brand:Apple'], ['category:Laptops']],
                  },
                  state: 'output-available',
                  output: {
                    hits: [
                      {
                        objectID: '123',
                      },
                    ],
                  },
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
            initialUiState: {
              indexName: {
                refinementList: {
                  brand: ['Samsung', 'Apple'],
                  category: ['Laptops'],
                },
              },
            },
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              renderRefinements: true,
            },
            react: {
              ...createDefaultWidgetParams(chat),
              renderRefinements: true,
            },
            vue: {},
          },
        });

        await openChat(act);

        userEvent.click(
          document.querySelector(
            '.ais-ChatToolSearchIndexCarouselHeaderViewAll'
          )!
        );

        await act(async () => {
          await wait(0);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(2);
        expect(searchClient.search).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              params: expect.objectContaining({
                query: 'test',
                facetFilters: [['brand:Apple'], ['category:Laptops']],
              }),
            }),
          ])
        );
      });

      test('applies filters for custom tools', async () => {
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
                  input: {
                    query: 'test',
                    facet_filters: [['brand:Apple'], ['category:Laptops']],
                  },
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
            initialUiState: {
              indexName: {
                refinementList: {
                  brand: ['Samsung', 'Apple'],
                  category: ['Laptops'],
                },
              },
            },
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              tools: {
                hello: {
                  templates: {
                    layout: ({ applyFilters }, { html }) =>
                      html`<button
                        class="ais-ChatToolHelloViewAll"
                        onclick="${() => {
                          applyFilters({
                            query: 'test',
                            facetFilters: [
                              ['brand:Apple'],
                              ['category:Laptops'],
                            ],
                          });
                        }}"
                      >
                        View All
                      </button>`,
                  },
                },
              },
              renderRefinements: true,
            },
            react: {
              ...createDefaultWidgetParams(chat),
              tools: {
                hello: {
                  layoutComponent: ({ applyFilters }) => {
                    return (
                      <button
                        className="ais-ChatToolHelloViewAll"
                        onClick={() => {
                          applyFilters({
                            query: 'test',
                            facetFilters: [
                              ['brand:Apple'],
                              ['category:Laptops'],
                            ],
                          });
                        }}
                      >
                        View All
                      </button>
                    );
                  },
                },
              },
              renderRefinements: true,
            },
            vue: {},
          },
        });

        await openChat(act);

        userEvent.click(document.querySelector('.ais-ChatToolHelloViewAll')!);

        await act(async () => {
          await wait(0);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(2);
        expect(searchClient.search).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              params: expect.objectContaining({
                query: 'test',
                facetFilters: [['brand:Apple'], ['category:Laptops']],
              }),
            }),
          ])
        );
      });

      test('handles missing filters and attributes when applying filters', async () => {
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
                  input: {
                    query: 'test',
                    facet_filters: [['brand:Apple']],
                  },
                  state: 'output-available',
                  output: {
                    hits: [
                      {
                        objectID: '123',
                      },
                    ],
                  },
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
            initialUiState: {
              indexName: {
                refinementList: {
                  category: ['Laptops'],
                },
              },
            },
          },
          widgetParams: {
            javascript: createDefaultWidgetParams(chat),
            react: createDefaultWidgetParams(chat),
            vue: {},
          },
        });

        await openChat(act);

        userEvent.click(
          document.querySelector(
            '.ais-ChatToolSearchIndexCarouselHeaderViewAll'
          )!
        );

        await act(async () => {
          await wait(0);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(2);
        expect(searchClient.search).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              params: expect.objectContaining({
                query: 'test',
                facetFilters: [['brand:Apple']],
              }),
            }),
          ])
        );
      });

      test('shows actions for assistant messages when status is ready', async () => {
        const searchClient = createSearchClient();

        const chat = new Chat({
          messages: [
            {
              id: '1',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Hello!' }],
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
          document.querySelector('.ais-ChatMessage-actions')
        ).toBeInTheDocument();
      });

      test('does not show actions when status is not ready', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({});

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

        await act(async () => {
          chat._state.messages = [
            {
              id: '1',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Hello!' }],
            },
          ] as any;
          chat._state.status = 'streaming';
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatMessage-actions')
        ).not.toBeInTheDocument();
      });

      test('handles hierarchical facets when applying filters', async () => {
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
                  input: {
                    query: 'test',
                    facet_filters: [
                      [
                        'hierarchicalCategories.lvl1:Computers & Tablets > Laptops',
                      ],
                    ],
                  },
                  state: 'output-available',
                  output: {
                    hits: [
                      {
                        objectID: '123',
                      },
                    ],
                  },
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
            initialUiState: {
              indexName: {
                hierarchicalMenu: {
                  category: [
                    'hierarchicalCategories.lvl0',
                    'hierarchicalCategories.lvl1',
                  ],
                },
              },
            },
          },
          widgetParams: {
            javascript: createDefaultWidgetParams(chat),
            react: createDefaultWidgetParams(chat),
            vue: {},
          },
        });

        await openChat(act);

        userEvent.click(
          document.querySelector(
            '.ais-ChatToolSearchIndexCarouselHeaderViewAll'
          )!
        );

        await act(async () => {
          await wait(0);
        });

        expect(searchClient.search).toHaveBeenCalledTimes(2);
        expect(searchClient.search).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              params: expect.objectContaining({
                query: 'test',
                facetFilters: [
                  ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
                ],
              }),
            }),
          ])
        );
      });
    });

    describe('layoutComponent', () => {
      test('renders with custom layout component', async () => {
        const searchClient = createSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(),
              templates: {
                layout: (props, { html }: any) =>
                  html`<div class="custom-layout">
                    <span class="custom-layout-title">My Custom Chat</span>
                    ${props.templates.header()}
                    ${props.templates.toggleButton()}
                  </div>`,
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              layoutComponent: (props) => (
                <div className="custom-layout">
                  <span className="custom-layout-title">My Custom Chat</span>
                  {props.toggleButtonComponent}
                </div>
              ),
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(document.querySelector('.custom-layout')).toBeInTheDocument();
        expect(
          document.querySelector('.custom-layout-title')!.textContent
        ).toBe('My Custom Chat');
        expect(
          document.querySelector('.ais-ChatOverlayLayout')
        ).not.toBeInTheDocument();
        expect(
          document.querySelector('.ais-ChatInlineLayout')
        ).not.toBeInTheDocument();
      });

      test('exposes sendMessage to custom layout component', async () => {
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
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                layout: (props, { html }: any) =>
                  html`<div class="custom-layout">
                    ${props.templates.toggleButton()}
                    <button
                      class="custom-send"
                      onclick="${() =>
                      props.sendMessage({ text: 'hello from layout' })}"
                    >
                      Send
                    </button>
                  </div>`,
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              layoutComponent: (props) => (
                <div className="custom-layout">
                  {props.toggleButtonComponent}
                  <button
                    className="custom-send"
                    onClick={() =>
                      props.sendMessage({ text: 'hello from layout' })
                    }
                  >
                    Send
                  </button>
                </div>
              ),
            },
            vue: {},
          },
        });

        await openChat(act);

        userEvent.click(document.querySelector('.custom-send')!);

        await act(async () => {
          await wait(0);
        });

        expect(sendMessageSpy).toHaveBeenCalledWith({
          text: 'hello from layout',
        });
      });

      test('exposes status to custom layout component', async () => {
        const searchClient = createSearchClient();

        const chat = new Chat({});

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                layout: (props, { html }: any) =>
                  html`<div class="custom-layout">
                    ${props.templates.toggleButton()}
                    <span class="custom-status">${props.status}</span>
                  </div>`,
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              layoutComponent: (props) => (
                <div className="custom-layout">
                  {props.toggleButtonComponent}
                  <span className="custom-status">{props.status}</span>
                </div>
              ),
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(
          document.querySelector('.custom-status')!.textContent
        ).toBe('ready');

        await act(async () => {
          chat._state.status = 'submitted';
          await wait(0);
        });

        expect(
          document.querySelector('.custom-status')!.textContent
        ).toBe('submitted');
      });

      test('renders with inline layout component', async () => {
        const searchClient = createSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(),
              templates: {
                layout: chatInlineLayout(),
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              layoutComponent: ChatInlineLayout,
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          document.querySelector('.ais-ChatInlineLayout')
        ).toBeInTheDocument();
        expect(
          document.querySelector('.ais-Chat-container')
        ).toBeInTheDocument();
        expect(
          document.querySelector('.ais-ChatOverlayLayout')
        ).not.toBeInTheDocument();
        expect(
          document.querySelector('.ais-Chat-toggleButtonWrapper')
        ).not.toBeInTheDocument();
      });

      test('renders with sidepanel layout component', async () => {
        const searchClient = createSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(),
              templates: {
                layout: chatSidePanelLayout(),
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              layoutComponent: ChatSidePanelLayout,
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(
          document.querySelector('.ais-ChatSidePanelLayout')
        ).toBeInTheDocument();
        expect(
          document.querySelector('.ais-Chat-container--open')
        ).toBeInTheDocument();
        expect(
          document.querySelector('.ais-Chat-toggleButtonWrapper')
        ).toBeInTheDocument();
        expect(
          document.querySelector('.ais-ChatOverlayLayout')
        ).not.toBeInTheDocument();
        expect(
          document.querySelector('.ais-ChatInlineLayout')
        ).not.toBeInTheDocument();
      });

      test('sidepanel layout adjusts parent margin when opened and closed', async () => {
        const searchClient = createSearchClient();
        const parentEl = document.createElement('div');
        parentEl.id = 'sidepanel-parent';
        document.body.appendChild(parentEl);

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(),
              templates: {
                layout: chatSidePanelLayout({
                  parentElement: '#sidepanel-parent',
                }),
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              layoutComponent: (props: any) => (
                <ChatSidePanelLayout
                  {...props}
                  parentElement="#sidepanel-parent"
                />
              ),
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(parentEl.style.marginRight).toBe('');

        await openChat(act);

        expect(parentEl.style.marginRight).not.toBe('');

        userEvent.click(document.querySelector('.ais-ChatHeader-close')!);

        await act(async () => {
          await wait(0);
        });

        expect(parentEl.style.marginRight).toBe('');
      });
    });
  });
}
