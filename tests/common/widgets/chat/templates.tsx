import { createSearchClient } from '@instantsearch/mocks';
import { Chat } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createTemplatesTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
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
              headerComponent: () => (
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

        expect(document.querySelector('.custom-title-icon')!.textContent).toBe(
          'Custom title icon'
        );
        expect(document.querySelector('.custom-close-icon')!.textContent).toBe(
          'Custom close icon'
        );
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
              promptComponent: () => (
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

      test('renders with custom assistant and user message parts', async () => {
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
                  text: 'hi there!',
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
                  leading: 'MESSAGE-LEADING',
                  footer: 'MESSAGE-FOOTER',
                },
              },
              templates: {
                assistantMessage: {
                  leading: '<span>Assistant Leading</span>',
                  footer: '<span>Assistant Footer</span>',
                },
                userMessage: {
                  leading: '<span>User Leading</span>',
                  footer: '<span>User Footer</span>',
                },
              },
            },
            react: {
              ...createDefaultWidgetParams(chat),
              classNames: {
                message: {
                  leading: 'MESSAGE-LEADING',
                  footer: 'MESSAGE-FOOTER',
                },
              },
              assistantMessageLeadingComponent: () => (
                <div>Assistant Leading</div>
              ),
              assistantMessageFooterComponent: () => (
                <div>Assistant Footer</div>
              ),
              userMessageLeadingComponent: () => <div>User Leading</div>,
              userMessageFooterComponent: () => <div>User Footer</div>,
            },
            vue: {},
          },
        });

        await openChat(act);

        const leadingElements = document.querySelectorAll(
          '.ais-ChatMessage-leading'
        );
        const footerElements = document.querySelectorAll(
          '.ais-ChatMessage-footer'
        );
        expect(leadingElements).toHaveLength(2);
        expect(footerElements).toHaveLength(2);
        expect(leadingElements[0].textContent).toBe('User Leading');
        expect(leadingElements[1].textContent).toBe('Assistant Leading');
        expect(footerElements[0].textContent).toBe('User Footer');
        expect(footerElements[1].textContent).toBe('Assistant Footer');

        expect(leadingElements[0]).toHaveClass('MESSAGE-LEADING');
        expect(leadingElements[1]).toHaveClass('MESSAGE-LEADING');
        expect(footerElements[0]).toHaveClass('MESSAGE-FOOTER');
        expect(footerElements[1]).toHaveClass('MESSAGE-FOOTER');
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
}
