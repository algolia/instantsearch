/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { Chat } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { ClientSideToolTemplateData } from 'instantsearch.js/es/widgets/chat/chat';

export function createToolResultTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('tool results', () => {
    test('settles repeated tool calls by id when results arrive in reverse order', async () => {
      const searchClient = createSearchClient();
      const submissions = new Map<
        string,
        ClientSideToolTemplateData['addToolResult']
      >();
      const captureSubmission = ({
        message,
        addToolResult,
      }: ClientSideToolTemplateData) => {
        submissions.set(message.toolCallId, addToolResult);
      };
      const chat = new Chat({
        id: 'chat-id',
        persistence: false,
        messages: [
          {
            id: 'assistant-1',
            role: 'assistant',
            parts: [
              {
                type: 'tool-review',
                toolCallId: 'review-1',
                state: 'input-available',
                input: { item: 'first' },
              },
              {
                type: 'tool-review',
                toolCallId: 'review-2',
                state: 'input-available',
                input: { item: 'second' },
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
            tools: {
              review: {
                templates: {
                  layout(data) {
                    captureSubmission(data);
                    return `<span data-tool-call-id="${data.message.toolCallId}"></span>`;
                  },
                },
              },
            },
          },
          react: {
            ...createDefaultWidgetParams(chat),
            tools: {
              review: {
                layoutComponent(data) {
                  captureSubmission(data);
                  return (
                    <span data-tool-call-id={data.message.toolCallId}></span>
                  );
                },
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      await act(async () => {
        await submissions.get('review-2')!({
          output: { settled: 'second' },
        });
        await wait(0);
      });

      expect(chat.messages[0].parts).toMatchObject([
        { toolCallId: 'review-1', state: 'input-available' },
        {
          toolCallId: 'review-2',
          state: 'output-available',
          output: { settled: 'second' },
        },
      ]);

      await act(async () => {
        await submissions.get('review-1')!({
          output: { settled: 'first' },
        });
        await wait(0);
      });

      expect(chat.messages[0].parts).toMatchObject([
        {
          toolCallId: 'review-1',
          state: 'output-available',
          output: { settled: 'first' },
        },
        {
          toolCallId: 'review-2',
          state: 'output-available',
          output: { settled: 'second' },
        },
      ]);
    });
  });
}
