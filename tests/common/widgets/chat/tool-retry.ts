import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type {
  HttpChatTransportInitOptions,
  UIMessage,
  UIMessageChunk,
} from 'instantsearch.js/es/lib/ai-lite';
import type { Tool } from 'instantsearch.js/es/widgets/chat/chat';

function chunksToResponse(chunks: UIMessageChunk[]): Response {
  return new Response(
    `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}

const toolCallChunks = (
  messageId: string,
  toolCallId: string
): UIMessageChunk[] => [
  { type: 'start', messageId },
  {
    type: 'tool-input-available',
    toolName: 'save',
    toolCallId,
    input: { value: 'remember me' },
  },
  { type: 'finish' },
];

const textChunks = (messageId: string, text: string): UIMessageChunk[] => [
  { type: 'start', messageId },
  { type: 'text-start', id: `${messageId}-text` },
  { type: 'text-delta', id: `${messageId}-text`, delta: text },
  { type: 'text-end', id: `${messageId}-text` },
  { type: 'finish' },
];

export function createToolRetryTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('tool retry', () => {
    test('regenerates the response and executes a fresh tool call', async () => {
      const searchClient = createSearchClient();
      const responses = [
        toolCallChunks('assistant-1', 'call-1'),
        textChunks('assistant-2', 'Please check whether the save completed.'),
        toolCallChunks('assistant-3', 'call-2'),
        textChunks('assistant-4', 'The save completed.'),
      ];
      const fetchMock = jest.fn(() =>
        Promise.resolve(chunksToResponse(responses.shift()!))
      );
      const prepareRequest: NonNullable<
        HttpChatTransportInitOptions<UIMessage>['prepareSendMessagesRequest']
      > = ({ id, messages, trigger, messageId }) => ({
        body: { id, messages, trigger, messageId },
      });
      const prepareSendMessagesRequest = jest.fn(prepareRequest);
      const transport: HttpChatTransportInitOptions<UIMessage> = {
        api: '/api',
        fetch: fetchMock,
        prepareSendMessagesRequest,
      };
      const executeTool: NonNullable<Tool['onToolCall']> = ({
        toolCallId,
        addToolResult,
      }) => {
        if (toolCallId === 'call-1') {
          throw new Error('The save may have completed.');
        }
        return addToolResult({ output: { saved: true } });
      };
      const onToolCall = jest.fn(executeTool);

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: {
            transport,
            persistence: false,
            tools: {
              save: {
                retryOnError: true,
                onToolCall,
                templates: {},
              },
            },
          },
          react: {
            transport,
            persistence: false,
            tools: {
              save: {
                retryOnError: true,
                onToolCall,
              },
            },
          },
          vue: {},
        },
      });

      await openChat(act);

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'Save this'
      );
      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await waitFor(() => {
        expect(onToolCall).toHaveBeenCalledTimes(1);
        expect(
          document.querySelector('.ais-ChatMessage-toolError-action')
        ).toBeInTheDocument();
      });

      await act(async () => {
        userEvent.click(
          document.querySelector('.ais-ChatMessage-toolError-action')!
        );
        await wait(0);
      });

      await waitFor(() => {
        expect(onToolCall).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(
          document.querySelector('.ais-ChatMessages')!.textContent
        ).toContain('The save completed.');
      });

      expect(onToolCall.mock.calls.map(([call]) => call.toolCallId)).toEqual([
        'call-1',
        'call-2',
      ]);
      expect(
        prepareSendMessagesRequest.mock.calls.map(
          ([request]) => request.trigger
        )
      ).toEqual([
        'submit-message',
        'submit-message',
        'regenerate-message',
        'submit-message',
      ]);
    });
  });
}
