/** @jsx React.createElement */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch-core/internal';
import React from 'react';

import { createDefaultWidgetParams, createVueElement, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessageChunk } from 'instantsearch-core';
import type { ClientSideToolTemplateData } from 'instantsearch.js/es/widgets/chat/chat';

function chunksToResponse(chunks: UIMessageChunk[]): Response {
  return new Response(
    `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}

export function createToolResultTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('tool results', () => {
    test('settles repeated tool calls by id when results arrive in reverse order', async () => {
      const searchClient = createSearchClient();
      const submissions = new Map<
        string,
        ClientSideToolTemplateData['context']['addToolResult']
      >();
      const captureSubmission = ({ context }: ClientSideToolTemplateData) => {
        submissions.set(context.message.toolCallId, context.addToolResult);
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
                    return '<span></span>';
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
                    <span
                      data-tool-call-id={data.context.message.toolCallId}
                    ></span>
                  );
                },
              },
            },
          },
          vue: {
            ...createDefaultWidgetParams(chat),
            tools: {
              review: {
                layoutComponent(data: Parameters<typeof captureSubmission>[0]) {
                  captureSubmission(data);
                  return createVueElement('span', {
                    'data-tool-call-id': data.context.message.toolCallId,
                  });
                },
              },
            },
          },
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

    test('shows the reply when the server runs a tool the chat has no entry for', async () => {
      const searchClient = createSearchClient();
      // Agent Studio streams the call, its output and the closing text in one
      // turn, without flagging the call `providerExecuted`.
      const fetchMock = jest.fn(() =>
        Promise.resolve(
          chunksToResponse([
            { type: 'start', messageId: 'assistant-1' },
            {
              type: 'tool-input-available',
              toolName: 'check_inventory',
              toolCallId: 'call-1',
              input: { sku: 'A1' },
            },
            {
              type: 'tool-output-available',
              toolName: 'check_inventory',
              toolCallId: 'call-1',
              output: { inStock: true },
            },
            { type: 'text-start', id: 'text-1' },
            { type: 'text-delta', id: 'text-1', delta: 'It is in stock.' },
            { type: 'text-end', id: 'text-1' },
            { type: 'finish' },
          ])
        )
      );
      const transport = { api: '/api', fetch: fetchMock };

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: { transport, persistence: false },
          react: { transport, persistence: false },
          vue: { transport, persistence: false },
        },
      });

      await openChat(act);

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'Is it in stock?'
      );

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await waitFor(() => {
        expect(
          document.querySelector('.ais-ChatMessages')!.textContent
        ).toContain('It is in stock.');
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ChatMessageError')
      ).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
}
