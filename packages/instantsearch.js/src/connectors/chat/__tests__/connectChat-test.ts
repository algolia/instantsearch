/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

import type { UIMessage, ChatTransport } from '../../../lib/ai-lite';

function createMockTransport(): ChatTransport<UIMessage> {
  return {
    sendMessages: jest.fn(() =>
      Promise.resolve(new ReadableStream({ start(ctrl) { ctrl.close(); } }))
    ),
    reconnectToStream: jest.fn(() => Promise.resolve(null)),
  };
}

function createTestChat() {
  const transport = createMockTransport();
  return new Chat<UIMessage>({ transport });
}

function createChatWidget(
  params: Omit<Parameters<ReturnType<typeof connectChat>>[0], 'transport' | 'agentId'> & { chat: Chat<UIMessage> }
) {
  const renderFn = jest.fn();
  const makeWidget = connectChat(renderFn);
  // Need to also provide transport to satisfy the makeChatInstance validation
  // (it checks transport/agentId before checking if `chat` is provided)
  const widget = makeWidget({
    ...params,
    transport: { api: 'http://unused' },
  });
  return { widget, renderFn };
}

describe('connectChat context', () => {
  beforeAll(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, val: string) => { store[key] = val; },
        removeItem: (key: string) => { delete store[key]; },
      },
      configurable: true,
    });
  });

  afterAll(() => {
    delete (globalThis as any).sessionStorage;
  });

  test('sendMessage injects context part when context is a static object', async () => {
    const chatInstance = createTestChat();
    const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

    const { widget, renderFn } = createChatWidget({
      chat: chatInstance,
      context: { currentPage: '/products', locale: 'en-US' },
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const { sendMessage } = renderFn.mock.calls[0][0];

    await sendMessage({ text: 'Hello' });

    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    const call = sendMessageSpy.mock.calls[0][0] as any;
    expect(call.parts).toEqual([
      { type: 'text', text: 'Hello' },
      { type: 'context', context: { currentPage: '/products', locale: 'en-US' } },
    ]);
  });

  test('sendMessage injects context part when context is a function', async () => {
    const chatInstance = createTestChat();
    const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

    let pageUrl = '/page-1';
    const { widget, renderFn } = createChatWidget({
      chat: chatInstance,
      context: () => ({ currentPage: pageUrl }),
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const { sendMessage } = renderFn.mock.calls[0][0];

    await sendMessage({ text: 'first message' });

    let call = sendMessageSpy.mock.calls[0][0] as any;
    expect(call.parts).toEqual([
      { type: 'text', text: 'first message' },
      { type: 'context', context: { currentPage: '/page-1' } },
    ]);

    pageUrl = '/page-2';
    await sendMessage({ text: 'second message' });

    call = sendMessageSpy.mock.calls[1][0] as any;
    expect(call.parts).toEqual([
      { type: 'text', text: 'second message' },
      { type: 'context', context: { currentPage: '/page-2' } },
    ]);
  });

  test('sendMessage passes through without modification when no context', async () => {
    const chatInstance = createTestChat();
    const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

    const { widget, renderFn } = createChatWidget({
      chat: chatInstance,
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const { sendMessage } = renderFn.mock.calls[0][0];

    await sendMessage({ text: 'Hello' });

    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    const call = sendMessageSpy.mock.calls[0][0] as any;
    expect(call).toEqual({ text: 'Hello' });
  });

  test('sendMessage injects context when called with parts', async () => {
    const chatInstance = createTestChat();
    const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

    const { widget, renderFn } = createChatWidget({
      chat: chatInstance,
      context: { page: '/about' },
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const { sendMessage } = renderFn.mock.calls[0][0];

    await sendMessage({
      parts: [{ type: 'text', text: 'Hi from parts' }],
    });

    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    const call = sendMessageSpy.mock.calls[0][0] as any;
    expect(call.parts).toEqual([
      { type: 'text', text: 'Hi from parts' },
      { type: 'context', context: { page: '/about' } },
    ]);
  });

  test('sendMessage passes through when called with no message', async () => {
    const chatInstance = createTestChat();
    const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

    const { widget, renderFn } = createChatWidget({
      chat: chatInstance,
      context: { page: '/about' },
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const { sendMessage } = renderFn.mock.calls[0][0];

    await sendMessage();

    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy.mock.calls[0][0]).toBeUndefined();
  });
});
