/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import connectChat from '../connectChat';

import type { UIMessageChunk } from '../../../lib/ai-lite';
import type { ChatConnectorParams } from '../connectChat';

const originalDev = (globalThis as any).__DEV__;

const chatStream = (chunks: UIMessageChunk[]) =>
  new Response(
    `${chunks
      .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
      .join('')}data: [DONE]`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );

describe('connectChat production tool handling', () => {
  beforeAll(() => {
    (globalThis as any).__DEV__ = false;
  });

  afterAll(() => {
    (globalThis as any).__DEV__ = originalDev;
  });

  it('submits the unknown-tool fallback and continues once', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        chatStream([
          { type: 'start', messageId: 'assistant-1' },
          {
            type: 'tool-input-available',
            toolName: 'missingTool',
            toolCallId: 'call-1',
            input: {},
          },
          { type: 'finish' },
        ])
      )
      .mockResolvedValueOnce(
        chatStream([
          { type: 'start', messageId: 'assistant-2' },
          { type: 'finish' },
        ])
      );
    const widget = connectChat(jest.fn())({
      agentId: undefined,
      disableTriggerValidation: true,
      transport: { fetch: fetchMock },
    } as ChatConnectorParams);
    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init(createInitOptions({ helper }));

    await widget.chatInstance.sendMessage({ text: 'use a missing tool' });

    const toolPart = widget.chatInstance.messages
      .find((message) => message.id === 'assistant-1')
      ?.parts.find(
        (part) => 'toolCallId' in part && part.toolCallId === 'call-1'
      );
    expect(toolPart).toMatchObject({
      state: 'output-available',
      output: 'No tool implemented for "missingTool".',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
