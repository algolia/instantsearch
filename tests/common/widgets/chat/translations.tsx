import { createSearchClient } from '@instantsearch/mocks';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createTranslationsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('translations', () => {
    describe('header', () => {
      test('renders with custom translations', async () => {
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
                  titleText: 'Custom title',
                  closeLabelText: 'Custom close button label',
                  clearLabelText: 'Custom clear button label',
                  maximizeLabelText: 'Custom maximize button label',
                  minimizeLabelText: 'Custom minimize button label',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              translations: {
                header: {
                  title: 'Custom title',
                  closeLabel: 'Custom close button label',
                  clearLabel: 'Custom clear button label',
                  maximizeLabel: 'Custom maximize button label',
                  minimizeLabel: 'Custom minimize button label',
                },
              },
            },
            vue: {},
          },
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

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                prompt: {
                  textareaLabelText: 'Custom message input',
                  textareaPlaceholderText: 'Custom placeholder',
                  disclaimerText: 'Custom disclaimer',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              translations: {
                prompt: {
                  textareaLabel: 'Custom message input',
                  textareaPlaceholder: 'Custom placeholder',
                  disclaimer: 'Custom disclaimer',
                },
              },
            },
            vue: {},
          },
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

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                prompt: {
                  emptyMessageTooltipText: 'Custom empty message',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              translations: {
                prompt: {
                  emptyMessageTooltip: 'Custom empty message',
                },
              },
            },
            vue: {},
          },
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
                  sendMessageTooltipText: 'Custom send message',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(),
              translations: {
                prompt: {
                  sendMessageTooltip: 'Custom send message',
                },
              },
            },
            vue: {},
          },
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

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(chat),
              templates: {
                prompt: {
                  stopResponseTooltipText: 'Custom stop response',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              translations: {
                prompt: {
                  stopResponseTooltip: 'Custom stop response',
                },
              },
            },
            vue: {},
          },
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

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            javascript: {
              ...createDefaultWidgetParams(
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
              ),
              templates: {
                messages: {
                  copyToClipboardLabelText: 'Custom copy action',
                  regenerateLabelText: 'Custom regenerate action',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(
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
              ),
              translations: {
                messages: {
                  copyToClipboardLabel: 'Custom copy action',
                  regenerateLabel: 'Custom regenerate action',
                },
              },
            },
            vue: {},
          },
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

      test('renders with custom message translations', async () => {
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
                  type: 'text',
                  text: 'hello',
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
                message: {
                  messageLabelText: 'Custom message',
                  actionsLabelText: 'Custom actions',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              translations: {
                message: {
                  messageLabel: 'Custom message',
                  actionsLabel: 'Custom actions',
                },
              },
            },
            vue: {},
          },
        });

        await openChat(act);

        expect(
          document
            .querySelectorAll('.ais-ChatMessage')[0]
            ?.getAttribute('aria-label')
        ).toBe('Custom message');
        expect(
          document
            .querySelectorAll('.ais-ChatMessage')[1]
            ?.getAttribute('aria-label')
        ).toBe('Custom message');

        expect(
          document
            .querySelector('.ais-ChatMessage-actions')
            ?.getAttribute('aria-label')
        ).toBe('Custom actions');
      });
    });
  });
}
