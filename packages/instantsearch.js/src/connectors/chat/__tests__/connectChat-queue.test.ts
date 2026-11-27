/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { waitFor } from '@testing-library/dom';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

import type { UIMessage, UIMessageChunk } from '../../../lib/ai-lite';
import type { ChatConnectorParams } from '../connectChat';

describe('connectChat queue for sends made while a reply runs', () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

  // Each reply stays open until the test ends it. Like a fetch body, an open
  // reply fails with an `AbortError` when its request is aborted.
  function setup(
    widgetParams: Partial<ChatConnectorParams> = {},
    chatOptions: Partial<ConstructorParameters<typeof Chat<UIMessage>>[0]> = {}
  ) {
    const replies: Array<ReadableStreamDefaultController<UIMessageChunk>> = [];
    const sendMessages = jest.fn(
      ({ abortSignal }: { abortSignal?: AbortSignal }) =>
        Promise.resolve(
          new ReadableStream<UIMessageChunk>({
            start(controller) {
              controller.enqueue({
                type: 'start',
                messageId: `assistant-${replies.length + 1}`,
              });
              replies.push(controller);
              abortSignal?.addEventListener('abort', () => {
                const error = new Error('The operation was aborted.');
                error.name = 'AbortError';
                controller.error(error);
              });
            },
          })
        )
    );
    const chat = new Chat<UIMessage>({
      persistence: false,
      transport: { sendMessages, reconnectToStream: jest.fn() } as any,
      ...chatOptions,
    });
    const renderFn = jest.fn();
    const widget = connectChat(renderFn)({
      chat,
      disableTriggerValidation: true,
      ...widgetParams,
    } as ChatConnectorParams);
    const helper = algoliasearchHelper(createSearchClient(), '');
    widget.init(createInitOptions({ helper }));

    const getRenderState = () =>
      widget.getWidgetRenderState(createInitOptions({ helper }));
    const sentTexts = () =>
      sendMessages.mock.calls.map((call) => {
        const { messages } = call[0] as unknown as { messages: UIMessage[] };
        const lastUser = [...messages]
          .reverse()
          .find((message) => message.role === 'user')!;
        return (lastUser.parts[0] as { text: string }).text;
      });
    const finishReply = async (index: number) => {
      replies[index].enqueue({ type: 'finish' });
      replies[index].close();
      // A queued message may start the next reply straight away.
      await waitFor(() =>
        expect(chat.status === 'ready' || replies.length > index + 1).toBe(true)
      );
      await tick();
    };
    const startFirstReply = async (text = 'first') => {
      getRenderState().sendMessage({ text });
      await waitFor(() => expect(chat.status).toBe('streaming'));
    };

    return {
      chat,
      replies,
      renderFn,
      sendMessages,
      sentTexts,
      getRenderState,
      finishReply,
      startFirstReply,
    };
  }

  it('sends straight away when the chat is idle and nothing waits', async () => {
    const { getRenderState, sentTexts } = setup();

    getRenderState().sendMessage({ text: 'first' });
    await waitFor(() => expect(sentTexts()).toEqual(['first']));

    expect(getRenderState().queuedMessages).toEqual([]);
  });

  it('queues a send made while a reply runs and shows it, without sending it', async () => {
    const { getRenderState, sentTexts, renderFn, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    await tick();

    expect(sentTexts()).toEqual(['first']);
    expect(getRenderState().queuedMessages).toEqual([
      { id: expect.any(String), text: 'second' },
    ]);
    expect(renderFn.mock.calls[renderFn.mock.calls.length - 1][0]).toEqual(
      expect.objectContaining({
        queuedMessages: [{ id: expect.any(String), text: 'second' }],
      })
    );
    expect(
      getRenderState().messages.filter((message) => message.role === 'user')
    ).toHaveLength(1);
  });

  it('sends queued messages one at a time, in order, as each reply ends', async () => {
    const { getRenderState, sentTexts, finishReply, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    getRenderState().sendMessage({ text: 'third' });

    await finishReply(0);
    await waitFor(() => expect(sentTexts()).toEqual(['first', 'second']));
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['third']);

    await finishReply(1);
    await waitFor(() =>
      expect(sentTexts()).toEqual(['first', 'second', 'third'])
    );
    expect(getRenderState().queuedMessages).toEqual([]);
  });

  it('never sends a removed message', async () => {
    const { getRenderState, sentTexts, finishReply, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    getRenderState().sendMessage({ text: 'third' });
    const [second] = getRenderState().queuedMessages;
    getRenderState().removeQueuedMessage(second.id);

    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['third']);

    await finishReply(0);
    await finishReply(1);

    expect(sentTexts()).toEqual(['first', 'third']);
  });

  it('pauses on Stop: nothing sends and the waiting messages stay visible', async () => {
    const { getRenderState, sentTexts, chat, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    await getRenderState().stop();
    await tick();
    await tick();

    expect(chat.status).toBe('ready');
    expect(sentTexts()).toEqual(['first']);
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['second']);
  });

  it('pauses when the reply ends in an error', async () => {
    const { getRenderState, sentTexts, chat, replies, startFirstReply } =
      setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    replies[0].error(new Error('disconnected'));
    await waitFor(() => expect(chat.status).toBe('error'));
    await tick();

    expect(sentTexts()).toEqual(['first']);
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['second']);
  });

  it('starts a paused queue again on the next send, from the top', async () => {
    const { getRenderState, sentTexts, finishReply, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    await getRenderState().stop();
    await tick();

    getRenderState().sendMessage({ text: 'third' });
    await waitFor(() => expect(sentTexts()).toEqual(['first', 'second']));
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['third']);

    await finishReply(1);
    await waitFor(() =>
      expect(sentTexts()).toEqual(['first', 'second', 'third'])
    );
  });

  it('sends right away after a stop when nothing waits', async () => {
    const { getRenderState, sentTexts, startFirstReply } = setup();
    await startFirstReply();
    await getRenderState().stop();
    await tick();

    getRenderState().sendMessage({ text: 'second' });
    await waitFor(() => expect(sentTexts()).toEqual(['first', 'second']));
    expect(getRenderState().queuedMessages).toEqual([]);
  });

  it('drops the queue on clear', async () => {
    const { getRenderState, sentTexts, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    getRenderState().clearMessages();
    await tick();
    await tick();

    expect(getRenderState().queuedMessages).toEqual([]);
    expect(sentTexts()).toEqual(['first']);
  });

  it('drops the queue on regenerate', async () => {
    const { getRenderState, sentTexts, finishReply, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    getRenderState().regenerate();
    expect(getRenderState().queuedMessages).toEqual([]);

    await finishReply(0);
    await waitFor(() => expect(sentTexts()).toHaveLength(2));
    await finishReply(1);

    expect(sentTexts()).not.toContain('second');
  });

  it('hides a queued prompt-shortcut token', async () => {
    const { getRenderState, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({
      text: '__ALGOLIA_COMPARE_products-comparison__',
    });

    expect(getRenderState().queuedMessages).toEqual([
      { id: expect.any(String), text: undefined },
    ]);
  });

  it('keeps sending after a function `context` throws', async () => {
    const context = jest.fn<Record<string, string>, []>(() => {
      throw new Error('context failed');
    });
    const { getRenderState, sentTexts } = setup({ context });

    expect(() => getRenderState().sendMessage({ text: 'first' })).toThrow(
      'context failed'
    );

    context.mockImplementation(() => ({}));
    getRenderState().sendMessage({ text: 'second' });
    await waitFor(() => expect(sentTexts()).toEqual(['second']));
    expect(getRenderState().queuedMessages).toEqual([]);
  });

  it('resolves a function `context` when the queued message is sent', async () => {
    let page = 'first page';
    const context = jest.fn(() => ({ page }));
    const { getRenderState, sendMessages, finishReply, startFirstReply } =
      setup({ context });
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    expect(context).toHaveBeenCalledTimes(1);

    page = 'second page';
    await finishReply(0);
    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(2));

    expect(context).toHaveBeenCalledTimes(2);
    const { messages } = sendMessages.mock.calls[1][0] as unknown as {
      messages: UIMessage[];
    };
    expect(messages[messages.length - 1].metadata).toEqual({
      turnContext: { page: 'second page' },
    });
  });

  it('resumes the queue on a send made right after Stop, once the stopped reply settles', async () => {
    const { getRenderState, sentTexts, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().stop();
    getRenderState().sendMessage({ text: 'second' });
    await tick();
    await tick();
    await tick();

    expect(sentTexts()).toEqual(['first', 'second']);
    expect(getRenderState().queuedMessages).toEqual([]);
  });

  it('sends from the top on a send made right after Stop with a message waiting', async () => {
    const { getRenderState, sentTexts, startFirstReply } = setup();
    await startFirstReply();

    getRenderState().sendMessage({ text: 'second' });
    getRenderState().stop();
    getRenderState().sendMessage({ text: 'third' });
    await tick();
    await tick();
    await tick();

    expect(sentTexts()).toEqual(['first', 'second']);
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['third']);
  });

  it('rejects a queued send whose `context` throws, pauses and keeps the rest', async () => {
    let fail = false;
    const context = jest.fn(() => {
      if (fail) throw new Error('context failed');
      return {};
    });
    const { getRenderState, sentTexts, finishReply, startFirstReply } = setup({
      context,
    });
    await startFirstReply();

    const second = getRenderState()
      .sendMessage({ text: 'second' })
      .then(
        () => 'resolved',
        (error: Error) => error.message
      );
    getRenderState().sendMessage({ text: 'third' });
    fail = true;
    await finishReply(0);
    await tick();
    fail = false;
    await tick();

    await expect(second).resolves.toBe('context failed');
    expect(sentTexts()).toEqual(['first']);
    expect(
      getRenderState().queuedMessages.map((message) => message.text)
    ).toEqual(['third']);

    getRenderState().sendMessage({ text: 'fourth' });
    await waitFor(() => expect(sentTexts()).toEqual(['first', 'third']));
  });

  describe('turns made of several steps', () => {
    // A client tool answered during the step makes the chat continue the turn
    // with a second request once the step ends.
    const continueAfterToolResult = (getChat: () => Chat<UIMessage>) => ({
      sendAutomaticallyWhen: ({ messages }: { messages: UIMessage[] }) => {
        const last = messages[messages.length - 1];
        return (
          last.role === 'assistant' &&
          last.parts.some(
            (part) =>
              'toolCallId' in part &&
              (part as { state?: string }).state === 'output-available'
          ) &&
          !last.parts.some((part) => part.type === 'text')
        );
      },
      onToolCall: ({
        toolCall,
      }: {
        toolCall: { toolName: string; toolCallId: string };
      }) => {
        getChat().addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { ok: true },
        } as any);
      },
    });
    const endStepWithToolCall = (
      reply: ReadableStreamDefaultController<UIMessageChunk>
    ) =>
      reply.enqueue({
        type: 'tool-input-available',
        toolCallId: 'call-1',
        toolName: 'demo',
        input: {},
      });

    it('keeps a message queued across the steps of a regenerated reply, and Stop keeps it unsent', async () => {
      let chat!: Chat<UIMessage>;
      const created = setup({}, continueAfterToolResult(() => chat) as any);
      chat = created.chat;
      const { getRenderState, sentTexts, finishReply, replies } = created;
      await created.startFirstReply();
      replies[0].enqueue({ type: 'text-start', id: 't' });
      replies[0].enqueue({ type: 'text-delta', id: 't', delta: 'hello' });
      replies[0].enqueue({ type: 'text-end', id: 't' });
      await finishReply(0);

      getRenderState().regenerate();
      await waitFor(() => expect(replies).toHaveLength(2));
      getRenderState().sendMessage({ text: 'second' });

      endStepWithToolCall(replies[1]);
      await finishReply(1);
      await waitFor(() => expect(replies).toHaveLength(3));

      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);

      await getRenderState().stop();
      await tick();
      await tick();

      expect(sentTexts()).not.toContain('second');
      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);
    });

    it('keeps a message queued across the steps of the initial message reply, and Stop keeps it unsent', async () => {
      let chat!: Chat<UIMessage>;
      const created = setup(
        { initialUserMessage: 'first' },
        continueAfterToolResult(() => chat) as any
      );
      chat = created.chat;
      const { getRenderState, sentTexts, finishReply, replies } = created;
      await waitFor(() => expect(replies).toHaveLength(1));
      getRenderState().sendMessage({ text: 'second' });

      endStepWithToolCall(replies[0]);
      await finishReply(0);
      await waitFor(() => expect(replies).toHaveLength(2));

      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);

      await getRenderState().stop();
      await tick();
      await tick();

      expect(sentTexts()).not.toContain('second');
      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);
    });

    it('waits for a tool result that arrives after the step ended, then sends', async () => {
      const created = setup({}, {
        sendAutomaticallyWhen: continueAfterToolResult(() => created.chat)
          .sendAutomaticallyWhen,
      } as any);
      const { chat, getRenderState, sentTexts, finishReply, replies } = created;
      await created.startFirstReply();
      getRenderState().sendMessage({ text: 'second' });

      endStepWithToolCall(replies[0]);
      await finishReply(0);
      await tick();

      expect(chat.status).toBe('ready');
      expect(sentTexts()).toEqual(['first']);
      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);

      chat.addToolResult({
        tool: 'demo',
        toolCallId: 'call-1',
        output: { ok: true },
      } as any);
      await waitFor(() => expect(replies).toHaveLength(2));
      expect(
        getRenderState().queuedMessages.map((message) => message.text)
      ).toEqual(['second']);

      await finishReply(1);
      await waitFor(() =>
        expect(sentTexts()).toEqual(['first', 'first', 'second'])
      );
    });

    it('still sends straight away while a tool call waits for an answer', async () => {
      const created = setup();
      const { chat, getRenderState, sentTexts, finishReply, replies } = created;
      await created.startFirstReply();
      endStepWithToolCall(replies[0]);
      await finishReply(0);
      expect(chat.status).toBe('ready');

      getRenderState().sendMessage({ text: 'second' });

      await waitFor(() => expect(sentTexts()).toEqual(['first', 'second']));
      expect(getRenderState().queuedMessages).toEqual([]);
    });
  });
});
