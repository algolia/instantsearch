/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.ts
 */
import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

function createMessage(id: string, text: string) {
  return { id, role: 'assistant', parts: [{ type: 'text', text }] };
}

// A caller-owned `chat` is a complete configuration on its own; passing a
// `transport` alongside it would hide whether that is true.
function createServerWidget(
  widgetParams: Record<string, unknown>,
  chat: Chat<any>
) {
  return connectChat(jest.fn())({
    chat,
    disableTriggerValidation: true,
    ...widgetParams,
  } as any);
}

describe('connectChat server rendering', () => {
  it('does not retain callbacks across initializations', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    createServerWidget({}, chat).init(createInitOptions({ helper }));
    createServerWidget({}, chat).init(createInitOptions({ helper }));

    expect(chat._state._messagesCallbacks.size).toBe(0);
    expect(chat._state._statusCallbacks.size).toBe(0);
    expect(chat._state._errorCallbacks.size).toBe(0);
  });

  it('does not send the initial user message', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const sendMessage = jest.fn();
    (chat as any).sendMessage = sendMessage;
    const widget = createServerWidget(
      { initialUserMessage: 'HELLO FROM SSR' },
      chat
    );
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    widget.init(createInitOptions({ helper }));

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does not resume a stream', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const resumeStream = jest.fn();
    (chat as any).resumeStream = resumeStream;
    const widget = createServerWidget({ resume: true }, chat);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    widget.init(createInitOptions({ helper }));

    expect(resumeStream).not.toHaveBeenCalled();
  });

  it('keeps the status ready when a resume is suppressed', () => {
    // A real resume sets `submitted` synchronously, so suppressing it is what
    // makes the server report `ready`. That difference is why a hydration render
    // has to pin `status` even for a chat the connector built itself.
    const chat = new Chat<any>({
      persistence: false,
      transport: { reconnectToStream: () => new Promise(() => {}) } as any,
    });
    const widget = createServerWidget({ resume: true }, chat);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');
    const initOptions = createInitOptions({ helper });

    widget.init(initOptions);

    expect(chat.status).toBe('ready');
    expect(widget.getWidgetRenderState(initOptions).status).toBe('ready');
  });

  it('initialises a chat-only widget without a transport', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const widget = createServerWidget({}, chat);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    expect(() => widget.init(createInitOptions({ helper }))).not.toThrow();
  });

  it('initialises closed when open persistence is enabled without a window', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const widget = createServerWidget({ persistOpen: true }, chat);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');
    const initOptions = createInitOptions({ helper });

    expect(() => widget.init(initOptions)).not.toThrow();
    expect(widget.getWidgetRenderState(initOptions).open).toBe(false);
  });

  it('does not apply initial messages', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const widget = createServerWidget(
      { initialMessages: [createMessage('initial', 'INITIAL FROM SSR')] },
      chat
    );
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    widget.init(createInitOptions({ helper }));

    expect(chat.messages).toEqual([]);
  });
});
