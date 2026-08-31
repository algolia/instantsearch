/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Chat as ChatInstance, openChat } from 'instantsearch.js/es/lib/chat';
import { CACHE_KEY } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { InstantSearch, useInstantSearch } from 'react-instantsearch-core';

import { ChatInlineLayout } from '../../components/ChatInlineLayout';
import { Chat } from '../Chat';
import { ChatTrigger } from '../ChatTrigger';

import type { ChatHandle, ChatProps } from '../Chat';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

const searchClient = createSearchClient();

const CHAT_PROPS_REPLACEMENT_WARNING =
  '[InstantSearch] Changing the props of the React <Chat> widget replaces its internal Chat instance and clears open state or non-persisted messages. Use stable prop references or provide your own Chat instance to preserve the conversation.';
const CHAT_OPEN_STATE_CACHE_KEY = 'instantsearch-chat-open-state-chat';

const existingMessage: UIMessage = {
  id: 'assistant-message',
  role: 'assistant',
  parts: [{ type: 'text', text: 'An existing answer' }],
};

function getChatPropsReplacementWarnings(warn: jest.SpyInstance) {
  return warn.mock.calls.filter(
    ([message]) => message === CHAT_PROPS_REPLACEMENT_WARNING
  );
}

function getConsoleWarnMock() {
  return jest.mocked(global.console.warn);
}

function CaptureChatRenderState({
  capture,
}: {
  capture: (chat: Parameters<typeof openChat>[0]) => void;
}) {
  const { indexRenderState } = useInstantSearch();
  capture(indexRenderState.chat);
  return null;
}

function createChat() {
  return new ChatInstance<UIMessage>({
    persistence: false,
    messages: [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Find a product' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Check the catalog.',
            state: 'done',
          },
          { type: 'text', text: 'I found one option.' },
        ],
      },
      {
        id: 'user-2',
        role: 'user',
        parts: [{ type: 'text', text: 'Find another' }],
      },
      {
        id: 'assistant-2',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Compare the results.',
            state: 'done',
          },
          { type: 'text', text: 'Here is another option.' },
        ],
      },
    ],
  });
}

function ChatUnderTest({
  chat,
  showReasoning,
  reasoningLabel = 'Reasoning',
}: {
  chat: ChatInstance<UIMessage>;
  showReasoning: boolean;
  reasoningLabel?: string;
}) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="indexName"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Chat
        chat={chat}
        transport={{ api: 'http://unused' }}
        layoutComponent={ChatInlineLayout}
        requiresSearch={false}
        showReasoning={showReasoning}
        translations={{ message: { reasoningLabel } }}
      />
    </InstantSearch>
  );
}

describe('Chat', () => {
  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  test('focuses only for explicit open transitions', async () => {
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);
    externalButton.focus();

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const chatRef = React.createRef<ChatHandle>();
    let chatRenderState: Parameters<typeof openChat>[0];

    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          ref={chatRef}
          agentId="test-agent-id"
          disableTriggerValidation={true}
          persistence={true}
          requiresSearch={false}
        />
        <ChatTrigger floating={false} />
        <CaptureChatRenderState
          capture={(renderState) => {
            chatRenderState = renderState;
          }}
        />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
    });

    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    expect(document.activeElement).toBe(externalButton);
    expect(focusSpy).not.toHaveBeenCalled();

    await act(async () => {
      chatRef.current!.setOpen(true);
      await wait(0);
    });

    expect(document.activeElement).toBe(externalButton);
    expect(focusSpy).not.toHaveBeenCalled();

    await act(async () => {
      chatRef.current!.setOpen(false);
      await wait(0);
    });
    externalButton.focus();
    await act(async () => {
      chatRef.current!.setOpen(true);
      await wait(0);
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    await act(async () => {
      chatRef.current!.setOpen(false);
      await wait(0);
    });
    externalButton.focus();
    await act(async () => {
      fireEvent.click(container.querySelector('.ais-ChatToggleButton')!);
      await wait(0);
    });

    expect(focusSpy).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.focus();
    await act(async () => {
      chatRenderState!.focusInput!();
      await wait(0);
    });

    expect(focusSpy).toHaveBeenCalledTimes(3);
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.remove();
  });

  test('does not focus after a reveal is interrupted by closing', async () => {
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const chatRef = React.createRef<ChatHandle>();

    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          ref={chatRef}
          agentId="test-agent-id"
          disableTriggerValidation={true}
          persistence={true}
          requiresSearch={false}
        />
        <ChatTrigger floating={false} />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
    });

    let finishReveal!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishReveal = resolve;
    });
    Object.defineProperty(
      container.querySelector('.ais-Chat-container'),
      'getAnimations',
      {
        configurable: true,
        value: () => [{ playState: 'running', finished }],
      }
    );

    await act(async () => {
      chatRef.current!.setOpen(false);
      await wait(0);
    });
    externalButton.focus();
    await act(async () => {
      chatRef.current!.setOpen(true);
      await wait(0);
    });

    expect(focusSpy).not.toHaveBeenCalled();

    await act(async () => {
      chatRef.current!.setOpen(false);
      await wait(0);
    });
    await act(async () => {
      finishReveal();
      await finished;
    });

    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(externalButton);

    externalButton.remove();
  });

  test('keeps a newer focus request waiting for a replacement reveal', async () => {
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    const animationFrames: Array<() => void> = [];
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        animationFrames.push(() => callback(0));
        return animationFrames.length;
      });
    const chatRef = React.createRef<ChatHandle>();
    let chatRenderState: Parameters<typeof openChat>[0];

    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          ref={chatRef}
          agentId="test-agent-id"
          disableTriggerValidation={true}
          persistence={true}
          requiresSearch={false}
        />
        <CaptureChatRenderState
          capture={(renderState) => {
            chatRenderState = renderState;
          }}
        />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(false);
      await wait(0);
    });
    externalButton.focus();

    let cancelSelectedReveal!: () => void;
    let selectedRevealPlayState: AnimationPlayState = 'running';
    let selectedRevealFinishedReads = 0;
    const selectedRevealFinished = new Promise<void>((_resolve, reject) => {
      cancelSelectedReveal = () => {
        selectedRevealPlayState = 'idle';
        reject();
      };
    });
    let finishReplacementReveal!: () => void;
    const replacementRevealFinished = new Promise<void>((resolve) => {
      finishReplacementReveal = resolve;
    });
    const selectedReveal = {
      currentTime: 10,
      startTime: 0,
      get playState() {
        return selectedRevealPlayState;
      },
      effect: {
        getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }],
        getTiming: () => ({ iterations: 1 }),
      },
      get finished() {
        selectedRevealFinishedReads++;
        return selectedRevealFinished;
      },
    } as unknown as Animation;
    const replacementReveal = {
      currentTime: 10,
      startTime: 0,
      playState: 'running',
      effect: selectedReveal.effect,
      finished: replacementRevealFinished,
    } as unknown as Animation;
    const chatContainer = container.querySelector<HTMLElement>(
      '.ais-Chat-container'
    )!;
    let animations = [selectedReveal];
    Object.defineProperty(chatContainer, 'getAnimations', {
      configurable: true,
      value: () =>
        chatContainer.classList.contains('ais-Chat-container--open')
          ? animations
          : [],
    });
    jest.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          clipPath: 'none',
          opacity: '0',
          rotate: 'none',
          scale: 'none',
          transform: 'none',
          translate: 'none',
          visibility: 'visible',
          getPropertyValue: () => 'auto',
        }) as unknown as CSSStyleDeclaration
    );

    await act(async () => {
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    while (selectedRevealFinishedReads === 0 && animationFrames.length > 0) {
      await act(async () => {
        animationFrames.shift()!();
      });
    }
    expect(selectedRevealFinishedReads).toBeGreaterThan(0);
    animationFrames.length = 0;

    expect(document.activeElement).toBe(externalButton);
    expect(chatContainer).toHaveAttribute('inert');
    expect(focusSpy).not.toHaveBeenCalled();

    animations = [replacementReveal];
    cancelSelectedReveal();
    await act(async () => {
      await wait(0);
      chatRenderState!.focusInput!();
      await wait(0);
    });
    expect(animationFrames).toHaveLength(2);
    await act(async () => {
      animationFrames.shift()!();
      animationFrames.shift()!();
    });

    expect(document.activeElement).toBe(externalButton);
    expect(chatContainer).toHaveAttribute('inert');
    expect(focusSpy).not.toHaveBeenCalled();

    animations = [];
    await act(async () => {
      finishReplacementReveal();
      await replacementRevealFinished;
      await wait(0);
      animationFrames.shift()!();
    });

    expect(chatContainer).not.toHaveAttribute('inert');
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.remove();
  });

  test('does not move focus when openChat submits to an open panel', async () => {
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);
    externalButton.focus();

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    let chatRenderState: Parameters<typeof openChat>[0];

    render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          agentId="test-agent-id"
          disableTriggerValidation={true}
          persistence={true}
          requiresSearch={false}
        />
        <CaptureChatRenderState
          capture={(renderState) => {
            chatRenderState = renderState;
          }}
        />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
    });
    externalButton.focus();

    await act(async () => {
      openChat(
        { ...chatRenderState, status: 'submitted' },
        { message: 'macbook' }
      );
      await wait(0);
    });

    expect(document.activeElement).toBe(externalButton);
    expect(focusSpy).not.toHaveBeenCalled();

    externalButton.remove();
  });

  test('keeps prompt autofocus when open persistence is disabled', async () => {
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);
    externalButton.focus();

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          agentId="test-agent-id"
          disableTriggerValidation={true}
          persistence={false}
          requiresSearch={false}
        />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
    });

    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.remove();
  });

  test('keeps inline prompt focus available with open persistence', async () => {
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);
    externalButton.focus();

    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    let chatRenderState: Parameters<typeof openChat>[0];
    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <Chat
          agentId="test-agent-id"
          layoutComponent={ChatInlineLayout}
          persistence={true}
          requiresSearch={false}
        />
        <CaptureChatRenderState
          capture={(renderState) => {
            chatRenderState = renderState;
          }}
        />
      </InstantSearch>
    );

    await act(async () => {
      await wait(0);
    });

    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.focus();
    await act(async () => {
      chatRenderState!.focusInput!();
      await wait(0);
    });

    expect(container.querySelector('.ais-Chat-container')).not.toHaveAttribute(
      'inert'
    );
    expect(document.activeElement).toBe(
      container.querySelector('.ais-ChatPrompt-textarea')
    );

    externalButton.remove();
  });

  test('shows reasoning on completed messages when enabled after rendering', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest chat={chat} showReasoning={false} />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );

    rerender(<ChatUnderTest chat={chat} showReasoning={true} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);
  });

  test('hides reasoning on completed messages when disabled after rendering', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest chat={chat} showReasoning={true} />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);

    rerender(<ChatUnderTest chat={chat} showReasoning={false} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );
  });

  test('updates the reasoning label on completed messages', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest
        chat={chat}
        showReasoning={true}
        reasoningLabel="Reasoning"
      />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);

    rerender(
      <ChatUnderTest
        chat={chat}
        showReasoning={true}
        reasoningLabel="Raisonnement"
      />
    );
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );
    expect(screen.getAllByRole('group', { name: 'Raisonnement' })).toHaveLength(
      2
    );
  });

  test('merges messagesProps.assistantMessageProps with the dedicated props', async () => {
    const chat = createChat();
    const { container } = render(
      <InstantSearch
        searchClient={searchClient}
        indexName="indexName"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Chat
          chat={chat}
          transport={{ api: 'http://unused' }}
          layoutComponent={ChatInlineLayout}
          requiresSearch={false}
          showReasoning={true}
          assistantMessageLeadingComponent={() => (
            <span data-testid="assistant-leading" />
          )}
          messagesProps={{
            assistantMessageProps: { autoHideActions: true },
          }}
        />
      </InstantSearch>
    );
    await act(async () => {
      await wait(0);
    });

    // The nested object sets one key; the dedicated props must survive alongside it.
    expect(screen.getAllByTestId('assistant-leading')).toHaveLength(2);
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);
    // And the caller's own key has to reach the message, or the merge is only
    // tested in one direction.
    expect(
      container.querySelectorAll('.ais-ChatMessage--auto-hide-actions')
    ).toHaveLength(2);
  });

  test('routes parseMarkdown from messagesProps into reasoning', async () => {
    const chat = new ChatInstance<UIMessage>({
      persistence: false,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **catalog**.',
              state: 'done',
            },
          ],
        },
      ],
    });
    const { container } = render(
      <InstantSearch
        searchClient={searchClient}
        indexName="indexName"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Chat
          chat={chat}
          transport={{ api: 'http://unused' }}
          layoutComponent={ChatInlineLayout}
          requiresSearch={false}
          showReasoning={true}
          messagesProps={{
            assistantMessageProps: { parseMarkdown: false },
          }}
        />
      </InstantSearch>
    );
    await act(async () => {
      await wait(0);
    });

    expect(container.querySelector('strong')).toBeNull();
    expect(
      screen.getByRole('group', { name: 'Reasoning' }).textContent
    ).toContain('Check the **catalog**.');
  });

  test('routes an assistant text component through messagesProps', async () => {
    const chat = new ChatInstance<UIMessage>({
      persistence: false,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Custom answer' }],
        },
      ],
    });
    const calls: Array<{
      partText: string;
      messageId: string;
      messageCount: number | undefined;
      status: string;
      partIndex: number;
    }> = [];
    const messagesProps = {
      assistantMessageProps: {
        textComponent: ({ part, message, messages, status, partIndex }) => {
          calls.push({
            partText: part.text,
            messageId: message.id,
            messageCount: messages?.length,
            status,
            partIndex,
          });
          return <span data-testid="assistant-text">{part.text}</span>;
        },
      },
    } satisfies NonNullable<ChatProps<unknown>['messagesProps']>;

    render(
      <InstantSearch
        searchClient={searchClient}
        indexName="indexName"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Chat
          chat={chat}
          transport={{ api: 'http://unused' }}
          layoutComponent={ChatInlineLayout}
          requiresSearch={false}
          messagesProps={messagesProps}
        />
      </InstantSearch>
    );
    await act(async () => {
      await wait(0);
    });

    expect(screen.getByTestId('assistant-text')).toHaveTextContent(
      'Custom answer'
    );
    expect(calls[calls.length - 1]).toEqual({
      partText: 'Custom answer',
      messageId: 'assistant-1',
      messageCount: 1,
      status: 'ready',
      partIndex: 0,
    });
  });

  test('updates reasoning on completed messages when parseMarkdown changes', async () => {
    const chat = new ChatInstance<UIMessage>({
      persistence: false,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **catalog**.',
              state: 'done',
            },
            { type: 'text', text: 'I found one option.' },
          ],
        },
        {
          id: 'assistant-2',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Compare the **results**.',
              state: 'done',
            },
            { type: 'text', text: 'Here is another option.' },
          ],
        },
      ],
    });

    function Subject({ parseMarkdown }: { parseMarkdown: boolean }) {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Chat
            chat={chat}
            transport={{ api: 'http://unused' }}
            layoutComponent={ChatInlineLayout}
            requiresSearch={false}
            showReasoning={true}
            messagesProps={{
              assistantMessageProps: { parseMarkdown },
            }}
          />
        </InstantSearch>
      );
    }

    const { container, rerender } = render(<Subject parseMarkdown={true} />);
    await act(async () => {
      await wait(0);
    });
    expect(container.querySelectorAll('strong')).toHaveLength(2);

    rerender(<Subject parseMarkdown={false} />);
    await act(async () => {
      await wait(0);
    });

    // Earlier rows are memoized, so the prop has to take part in the comparator.
    expect(container.querySelectorAll('strong')).toHaveLength(0);
  });

  test('warns before changed connector props replace an open internal Chat', async () => {
    const chatRef = React.createRef<ChatHandle>();
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            ref={chatRef}
            context={context}
            disableTriggerValidation={true}
            persistence={false}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { container, rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('does not warn when changed connector props preserve persisted open state', async () => {
    const chatRef = React.createRef<ChatHandle>();
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            ref={chatRef}
            context={context}
            disableTriggerValidation={true}
            persistence={{ messages: false, open: true }}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { container, rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
  });

  test('warns when changed connector props lose open state under a new type', async () => {
    const chatRef = React.createRef<ChatHandle>();

    function Subject({ type }: { type: string }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            ref={chatRef}
            disableTriggerValidation={true}
            persistence={{ messages: false, open: true }}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
            type={type}
          />
        </InstantSearch>
      );
    }

    const { container, rerender } = render(<Subject type="chat" />);
    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject type="support" />);
    await act(async () => {
      await wait(0);
    });

    expect(container.querySelector('.ais-Chat-container')).not.toHaveClass(
      'ais-Chat-container--open'
    );
    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('warns only when a suspended prop change commits the Chat replacement', async () => {
    const chatRef = React.createRef<ChatHandle>();
    const contexts = [
      () => ({ page: 'committed' }),
      () => ({ page: 'suspended' }),
      () => ({ page: 'replacement' }),
    ];
    const suspended = new Promise<never>(() => {});
    let setPhase!: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;

    function SuspendWhen({ active }: { active: boolean }) {
      if (active) {
        throw suspended;
      }

      return null;
    }

    function Subject() {
      const [phase, setCurrentPhase] = React.useState<0 | 1 | 2>(0);
      setPhase = setCurrentPhase;

      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <React.Suspense fallback={<div>Loading</div>}>
            <Chat
              ref={chatRef}
              context={contexts[phase]}
              disableTriggerValidation={true}
              persistence={false}
              requiresSearch={false}
              transport={{ api: 'http://unused' }}
            />
            <SuspendWhen active={phase === 1} />
          </React.Suspense>
        </InstantSearch>
      );
    }

    const { container } = render(<Subject />);
    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    const warn = getConsoleWarnMock();
    warn.mockClear();

    await act(async () => {
      React.startTransition(() => setPhase(1));
    });

    expect(container).not.toHaveTextContent('Loading');
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);

    await act(async () => {
      setPhase(2);
      await wait(0);
    });

    expect(container.querySelector('.ais-Chat-container')).not.toHaveClass(
      'ais-Chat-container--open'
    );
    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('warns before changed connector props replace non-persisted messages', async () => {
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            context={context}
            disableTriggerValidation={true}
            initialMessages={[existingMessage]}
            persistence={false}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
    });
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('warns when changing agentId replaces persisted messages', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-first-agent`,
      JSON.stringify([existingMessage])
    );

    function Subject({ agentId }: { agentId: string }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            agentId={agentId}
            disableTriggerValidation={true}
            persistence={{ messages: true, open: false }}
            requiresSearch={false}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject agentId="first-agent" />);
    await act(async () => {
      await wait(0);
    });
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject agentId="second-agent" />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryByText('An existing answer')).not.toBeInTheDocument();
    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('warns when disabling persistence replaces persisted messages', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-same-agent`,
      JSON.stringify([existingMessage])
    );

    function Subject({ persistence }: { persistence: boolean }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            agentId="same-agent"
            disableTriggerValidation={true}
            persistence={persistence}
            requiresSearch={false}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject persistence={true} />);
    await act(async () => {
      await wait(0);
    });
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject persistence={false} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryByText('An existing answer')).not.toBeInTheDocument();
    expect(getChatPropsReplacementWarnings(warn)).toEqual([
      [CHAT_PROPS_REPLACEMENT_WARNING],
    ]);
  });

  test('does not warn when changed props reuse the persisted message key', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-same-agent`,
      JSON.stringify([existingMessage])
    );
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            agentId="same-agent"
            context={context}
            disableTriggerValidation={true}
            persistence={{ messages: true, open: false }}
            requiresSearch={false}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
    });
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
  });

  test('treats missing and empty agentId as the same persisted message key', async () => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify([existingMessage]));

    function Subject({ emptyAgentId }: { emptyAgentId: boolean }) {
      const agent = emptyAgentId ? { agentId: '' } : {};

      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            {...agent}
            disableTriggerValidation={true}
            persistence={{ messages: true, open: false }}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject emptyAgentId={false} />);
    await act(async () => {
      await wait(0);
    });
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject emptyAgentId={true} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
  });

  test('does not warn or replace an open internal Chat for equal props', async () => {
    const chatRef = React.createRef<ChatHandle>();

    function Subject({ context }: { context: { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            ref={chatRef}
            context={context}
            disableTriggerValidation={true}
            persistence={false}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const context = { page: 'same' };
    const { container, rerender } = render(<Subject context={context} />);
    await act(async () => {
      await wait(0);
      chatRef.current!.setOpen(true);
      await wait(0);
    });
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={context} />);
    rerender(<Subject context={{ page: 'same' }} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--open'
    );
  });

  test('does not warn when changed connector props replace closed empty state', async () => {
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            context={context}
            disableTriggerValidation={true}
            persistence={false}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
    });
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
  });

  test('does not warn when changed connector props replace persisted closed messages', async () => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify([existingMessage]));
    const firstContext = () => ({ page: 'first' });
    const secondContext = () => ({ page: 'second' });

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            context={context}
            disableTriggerValidation={true}
            id="persisted-chat"
            persistence={{ messages: true, open: false }}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject context={firstContext} />);
    await act(async () => {
      await wait(0);
    });
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject context={secondContext} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
  });

  test('does not warn or lose messages when changed props reuse a caller-owned Chat', async () => {
    const chat = new ChatInstance<UIMessage>({
      messages: [existingMessage],
      persistence: false,
    });

    function Subject({ requiresSearch }: { requiresSearch: boolean }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            chat={chat}
            disableTriggerValidation={true}
            requiresSearch={requiresSearch}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject requiresSearch={true} />);
    await act(async () => {
      await wait(0);
    });
    const warn = getConsoleWarnMock();
    warn.mockClear();

    rerender(<Subject requiresSearch={false} />);
    await act(async () => {
      await wait(0);
    });

    expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
    expect(chat.messages).toEqual([existingMessage]);
    expect(screen.getByText('An existing answer')).toBeInTheDocument();
  });

  test('does not run replacement warning checks in production', async () => {
    const originalDev = (globalThis as { __DEV__?: boolean }).__DEV__;
    const contexts = [
      () => ({ page: 'first' }),
      () => ({ page: 'development' }),
      () => ({ page: 'production' }),
    ];
    sessionStorage.setItem(CHAT_OPEN_STATE_CACHE_KEY, 'true');
    const getItem = jest.spyOn(Storage.prototype, 'getItem');

    function Subject({ context }: { context: () => { page: string } }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            context={context}
            disableTriggerValidation={true}
            persistence={{ messages: false, open: true }}
            requiresSearch={false}
            transport={{ api: 'http://unused' }}
          />
        </InstantSearch>
      );
    }

    const { rerender } = render(<Subject context={contexts[0]} />);
    await act(async () => {
      await wait(0);
    });
    const warn = getConsoleWarnMock();
    warn.mockClear();
    getItem.mockClear();

    rerender(<Subject context={contexts[1]} />);
    await act(async () => {
      await wait(0);
    });
    expect(
      getItem.mock.calls.filter(([key]) => key === CHAT_OPEN_STATE_CACHE_KEY)
    ).toEqual([
      [CHAT_OPEN_STATE_CACHE_KEY],
      [CHAT_OPEN_STATE_CACHE_KEY],
      [CHAT_OPEN_STATE_CACHE_KEY],
    ]);
    getItem.mockClear();
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    try {
      rerender(<Subject context={contexts[2]} />);
      await act(async () => {
        await wait(0);
      });

      expect(getChatPropsReplacementWarnings(warn)).toHaveLength(0);
      expect(
        getItem.mock.calls.filter(([key]) => key === CHAT_OPEN_STATE_CACHE_KEY)
      ).toEqual([[CHAT_OPEN_STATE_CACHE_KEY], [CHAT_OPEN_STATE_CACHE_KEY]]);
    } finally {
      (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
    }
  });
});
