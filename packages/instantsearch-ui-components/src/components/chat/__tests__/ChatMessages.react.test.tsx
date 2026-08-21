/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { act, render } from '@testing-library/react';
import React, {
  Fragment,
  createElement,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createChatMessagesComponent } from '../ChatMessages';

import type { Pragma } from '../../../types';

const ChatMessages = createChatMessagesComponent({
  createElement: createElement as Pragma,
  Fragment,
  useMemo,
  useState,
  useEffect,
});

describe('ChatMessages with React', () => {
  const baseProps = {
    indexUiState: {},
    setIndexUiState: jest.fn(),
    tools: {},
    onReload: jest.fn(),
    onClose: jest.fn(),
  };

  const answered = [
    {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'text' as const,
          text: 'Working on it.',
          state: 'done' as const,
        },
      ],
    },
  ];

  const waiting = [
    {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'text' as const,
          text: 'Working on it.',
          state: 'done' as const,
        },
        {
          type: 'tool-some_tool' as const,
          toolCallId: '1',
          input: undefined,
          state: 'input-streaming' as const,
        },
      ],
    },
  ];

  const loader = (container: Element) =>
    container.querySelector('.ais-ChatMessageLoader');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('keeps a delayed loader hidden across identical renders until its timer fires', () => {
    const { container, rerender } = render(
      <ChatMessages {...baseProps} status="streaming" messages={[]} />
    );

    expect(loader(container)).not.toBeNull();

    rerender(
      <ChatMessages {...baseProps} status="streaming" messages={answered} />
    );
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(loader(container)).toBeNull();

    const delayedProps = {
      ...baseProps,
      status: 'streaming' as const,
      messages: waiting,
    };
    rerender(<ChatMessages {...delayedProps} />);

    expect(loader(container)).toBeNull();

    act(() => {
      jest.setSystemTime(Date.now() + 250);
    });
    rerender(<ChatMessages {...delayedProps} />);

    expect(loader(container)).toBeNull();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(loader(container)).not.toBeNull();
  });

  test('keeps a delayed loader hidden when loading stops before its timer commits', () => {
    const { container, rerender } = render(
      <ChatMessages {...baseProps} status="streaming" messages={[]} />
    );

    rerender(
      <ChatMessages {...baseProps} status="streaming" messages={answered} />
    );
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(loader(container)).toBeNull();

    rerender(
      <ChatMessages {...baseProps} status="streaming" messages={waiting} />
    );

    expect(loader(container)).toBeNull();

    act(() => {
      rerender(
        <ChatMessages {...baseProps} status="streaming" messages={answered} />
      );
      jest.advanceTimersByTime(250);
    });

    expect(loader(container)).toBeNull();
  });

  test('extends a visible loader hold when its minimum duration increases', () => {
    const { container, rerender } = render(
      <ChatMessages
        {...baseProps}
        status="streaming"
        messages={[]}
        loaderMinDuration={100}
      />
    );

    expect(loader(container)).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender(
      <ChatMessages
        {...baseProps}
        status="streaming"
        messages={[]}
        loaderMinDuration={1000}
      />
    );
    rerender(
      <ChatMessages
        {...baseProps}
        status="streaming"
        messages={answered}
        loaderMinDuration={1000}
      />
    );

    expect(loader(container)).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(899);
    });
    expect(loader(container)).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(loader(container)).toBeNull();
  });
});
