/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import type { ChatWidgetSetup } from '.';
import type { Act, TestOptions } from '../../common';

const createDefaultWidgetParams = (chat?: Chat<any>) => ({
  agentId: 'agentId',
  chat: chat || new Chat({}),
});

async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

  await act(async () => {
    await wait(0);
  });
}

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
      const sendMessageSpy = jest.spyOn(chat, 'sendMessage');

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

    describe('templates', () => {
      describe('header', () => {
        test('renders with custom header template', async () => {
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
                  header: {
                    layout: '<div class="custom-header">Custom header</div>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(),
                headerLayoutComponent: () => (
                  <div className="custom-header">Custom header</div>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(document.querySelector('.custom-header')!.textContent).toBe(
            'Custom header'
          );
        });

        test('renders with custom sub components', async () => {
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
                  header: {
                    titleIcon:
                      '<span class="custom-title-icon">Custom title icon</span>',
                    closeIcon:
                      '<span class="custom-close-icon">Custom close icon</span>',
                    minimizeIcon:
                      '<span class="custom-minimize-icon">Custom minimize icon</span>',
                    maximizeIcon:
                      '<span class="custom-maximize-icon">Custom maximize icon</span>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(),
                headerTitleIconComponent: () => (
                  <span className="custom-title-icon">Custom title icon</span>
                ),
                headerCloseIconComponent: () => (
                  <span className="custom-close-icon">Custom close icon</span>
                ),
                headerMinimizeIconComponent: () => (
                  <span className="custom-minimize-icon">
                    Custom minimize icon
                  </span>
                ),
                headerMaximizeIconComponent: () => (
                  <span className="custom-maximize-icon">
                    Custom maximize icon
                  </span>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(
            document.querySelector('.custom-title-icon')!.textContent
          ).toBe('Custom title icon');
          expect(
            document.querySelector('.custom-close-icon')!.textContent
          ).toBe('Custom close icon');
          expect(
            document.querySelector('.custom-maximize-icon')!.textContent
          ).toBe('Custom maximize icon');
        });
      });

      describe('prompt', () => {
        test('renders with custom prompt template', async () => {
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
                  prompt: {
                    layout: '<div class="custom-prompt">Custom prompt</div>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(),
                promptLayoutComponent: () => (
                  <div className="custom-prompt">Custom prompt</div>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(document.querySelector('.custom-prompt')!.textContent).toBe(
            'Custom prompt'
          );
        });

        test('renders with custom sub components', async () => {
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
                  prompt: {
                    header: '<div class="custom-header">Custom header</div>',
                    footer: '<div class="custom-footer">Custom footer</div>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(),
                promptHeaderComponent: () => (
                  <div className="custom-header">Custom header</div>
                ),
                promptFooterComponent: () => (
                  <div className="custom-footer">Custom footer</div>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(document.querySelector('.custom-header')!.textContent).toBe(
            'Custom header'
          );
          expect(document.querySelector('.custom-footer')!.textContent).toBe(
            'Custom footer'
          );
        });
      });

      describe('messages', () => {
        test('renders with custom loader', async () => {
          const searchClient = createSearchClient();

          const chat = new Chat({});
          Object.defineProperty(chat, 'status', {
            get: () => 'submitted',
          });

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: {
                ...createDefaultWidgetParams(chat),
                templates: {
                  messages: {
                    loader: '<div class="custom-loader">Custom loader</div>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(chat),
                messagesLoaderComponent: () => (
                  <div className="custom-loader">Custom loader</div>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(document.querySelector('.custom-loader')!.textContent).toBe(
            'Custom loader'
          );
        });

        test('renders with custom error', async () => {
          const searchClient = createSearchClient();

          const chat = new Chat({});
          Object.defineProperty(chat, 'status', {
            get: () => 'error',
          });

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: {
                ...createDefaultWidgetParams(chat),
                templates: {
                  messages: {
                    error: '<div class="custom-error">Custom error</div>',
                  },
                },
              },
              react: {
                ...createDefaultWidgetParams(chat),
                messagesErrorComponent: () => (
                  <div className="custom-error">Custom error</div>
                ),
              },
              vue: {},
            },
          });

          await openChat(act);

          expect(document.querySelector('.custom-error')!.textContent).toBe(
            'Custom error'
          );
        });
      });

      test('renders with custom actions', async () => {
        const searchClient = createSearchClient();
        const chat = new Chat({
          messages: [
            {
              id: '0',
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'hello',
                },
              ],
            },
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
        });

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                actions: ({ message }, { html }) =>
                  message.role === 'assistant'
                    ? html`<button class="custom-action">
                        Custom assistant action
                      </button>`
                    : html`<button class="custom-action">
                        Custom user action
                      </button>`,
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              actionsComponent: ({ message }) => {
                return message.role === 'assistant' ? (
                  <button className="custom-action">
                    Custom assistant action
                  </button>
                ) : (
                  <button className="custom-action">Custom user action</button>
                );
              },
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(document.querySelectorAll('.custom-action')[0].textContent).toBe(
          'Custom user action'
        );
        expect(document.querySelectorAll('.custom-action')[1].textContent).toBe(
          'Custom assistant action'
        );
      });
    });

    describe('translations', () => {
      describe('header', () => {
        test('renders with custom translations', async () => {
          const searchClient = createSearchClient();

          const commonWidgetParams = createDefaultWidgetParams();
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              header: {
                titleText: 'Custom title',
                closeLabelText: 'Custom close button label',
                clearLabelText: 'Custom clear button label',
                maximizeLabelText: 'Custom maximize button label',
                minimizeLabelText: 'Custom minimize button label',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              header: {
                title: 'Custom title',
                closeLabel: 'Custom close button label',
                clearLabel: 'Custom clear button label',
                maximizeLabel: 'Custom maximize button label',
                minimizeLabel: 'Custom minimize button label',
              },
            },
          };
          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          expect(
            document.querySelector('.ais-ChatHeader-title')!.textContent
          ).toBe('Custom title');
          expect(
            document
              .querySelector('.ais-ChatHeader-close')!
              .getAttribute('aria-label')
          ).toBe('Custom close button label');
          expect(
            document.querySelector('.ais-ChatHeader-clear')!.textContent
          ).toBe('Custom clear button label');
          expect(
            document
              .querySelector('.ais-ChatHeader-maximize')!
              .getAttribute('aria-label')
          ).toBe('Custom maximize button label');

          userEvent.click(document.querySelector('.ais-ChatHeader-maximize')!);
          expect(
            document
              .querySelector('.ais-ChatHeader-maximize')!
              .getAttribute('aria-label')
          ).toBe('Custom minimize button label');
        });
      });

      describe('prompt', () => {
        test('renders with custom textarea translations', async () => {
          const searchClient = createSearchClient();

          const chat = new Chat({});
          const commonWidgetParams = createDefaultWidgetParams(chat);
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              prompt: {
                textareaLabelText: 'Custom message input',
                textareaPlaceholderText: 'Custom placeholder',
                disclaimerText: 'Custom disclaimer',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              prompt: {
                textareaLabel: 'Custom message input',
                textareaPlaceholder: 'Custom placeholder',
                disclaimer: 'Custom disclaimer',
              },
            },
          };

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          expect(
            document
              .querySelector('.ais-ChatPrompt-textarea')
              ?.getAttribute('aria-label')
          ).toBe('Custom message input');
          expect(
            document
              .querySelector('.ais-ChatPrompt-textarea')
              ?.getAttribute('placeholder')
          ).toBe('Custom placeholder');
          expect(
            document.querySelector('.ais-ChatPrompt-footer')!.textContent
          ).toBe('Custom disclaimer');
        });

        test('renders with custom empty message translation', async () => {
          const searchClient = createSearchClient();

          const chat = new Chat({});
          const commonWidgetParams = createDefaultWidgetParams(chat);
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              prompt: {
                emptyMessageTooltipText: 'Custom empty message',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              prompt: {
                emptyMessageTooltip: 'Custom empty message',
              },
            },
          };

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          expect(
            document
              .querySelector('.ais-ChatPrompt-submit')
              ?.getAttribute('aria-label')
          ).toBe('Custom empty message');
        });

        test('renders with custom send message translation', async () => {
          const searchClient = createSearchClient();

          const commonWidgetParams = createDefaultWidgetParams();
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              prompt: {
                sendMessageTooltipText: 'Custom send message',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              prompt: {
                sendMessageTooltip: 'Custom send message',
              },
            },
          };

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          userEvent.type(
            document.querySelector('.ais-ChatPrompt-textarea')!,
            'Hello, world!'
          );

          expect(
            document
              .querySelector('.ais-ChatPrompt-submit')
              ?.getAttribute('aria-label')
          ).toBe('Custom send message');
        });

        test('renders with custom stop response translation', async () => {
          const searchClient = createSearchClient();

          const chat = new Chat({});
          Object.defineProperty(chat, 'status', {
            get: () => 'streaming',
          });

          const commonWidgetParams = createDefaultWidgetParams(chat);
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              prompt: {
                stopResponseTooltipText: 'Custom stop response',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              prompt: {
                stopResponseTooltip: 'Custom stop response',
              },
            },
          };

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          expect(
            document
              .querySelector('.ais-ChatPrompt-submit')
              ?.getAttribute('aria-label')
          ).toBe('Custom stop response');
        });
      });

      describe('messages', () => {
        test('renders with custom actions translations', async () => {
          const searchClient = createSearchClient();

          const commonWidgetParams = createDefaultWidgetParams(
            new Chat({
              messages: [
                {
                  id: '0',
                  role: 'assistant',
                  parts: [
                    {
                      type: 'text',
                      text: 'hello',
                    },
                  ],
                },
              ],
            })
          );
          const jsWidgetParams: JSChatWidgetParams = {
            ...commonWidgetParams,
            templates: {
              messages: {
                copyToClipboardLabelText: 'Custom copy action',
                regenerateLabelText: 'Custom regenerate action',
              },
            },
          };
          const reactWidgetParams: ReactChatWidgetParams = {
            ...commonWidgetParams,
            translations: {
              messages: {
                copyToClipboardLabel: 'Custom copy action',
                regenerateLabel: 'Custom regenerate action',
              },
            },
          };

          await setup({
            instantSearchOptions: {
              indexName: 'indexName',
              searchClient,
            },
            widgetParams: {
              javascript: jsWidgetParams,
              react: reactWidgetParams,
              vue: {},
            }[flavor],
          });

          await openChat(act);

          const actions = document.querySelectorAll('.ais-ChatMessage-action');
          expect(actions[0].getAttribute('aria-label')).toBe(
            'Custom copy action'
          );
          expect(actions[1].getAttribute('aria-label')).toBe(
            'Custom regenerate action'
          );
        });
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
