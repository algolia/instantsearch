/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { act, fireEvent, render } from '@testing-library/preact';
import { createElement } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import { createStickToBottom } from '../stickToBottom';

import type { StickToBottomInstance } from '../stickToBottom';

const useStickToBottom = createStickToBottom({
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
});

describe('useStickToBottom', () => {
  let instance: StickToBottomInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    global.ResizeObserver = class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function Harness() {
    instance = useStickToBottom();

    return createElement(
      'div',
      { ref: instance.scrollRef, style: { overflow: 'auto' } },
      createElement('div', { ref: instance.contentRef })
    );
  }

  test('releases the scroll guard when content grows after returning to the bottom', () => {
    const { container } = render(createElement(Harness, null));
    const scroll = container.firstElementChild as HTMLDivElement;
    let scrollHeight = 500;

    Object.defineProperties(scroll, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: {
        configurable: true,
        get: () => scrollHeight,
      },
    });
    scroll.scrollTop = 400;

    fireEvent.wheel(scroll, { deltaY: -120 });
    expect(instance.state.isAtBottom).toBe(false);

    scroll.scrollTop = 280;
    fireEvent.scroll(scroll);
    scroll.scrollTop = 400;
    fireEvent.scroll(scroll);

    scrollHeight = 640;

    act(() => {
      jest.advanceTimersByTime(2);
    });

    expect(instance.state.escapedFromLock).toBe(false);
    expect(instance.state.isAtBottom).toBe(true);
  });
});
