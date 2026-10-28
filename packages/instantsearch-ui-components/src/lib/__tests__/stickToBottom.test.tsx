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
  let resize: (contentRect: { width: number; height: number }) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    global.ResizeObserver = class ResizeObserverMock {
      constructor(callback: ResizeObserverCallback) {
        resize = (contentRect) =>
          callback([{ contentRect } as ResizeObserverEntry], this);
      }
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

  // Browsers report a hidden element (`display: none` on it or an ancestor)
  // as 0 high and scrolled to the top, and restore its scroll position when
  // it's shown again.
  function mockScrollBox(
    scroll: HTMLElement,
    box: { hidden: boolean; scrollHeight: number }
  ) {
    let scrollTop = 0;
    Object.defineProperties(scroll, {
      clientHeight: { configurable: true, get: () => (box.hidden ? 0 : 100) },
      scrollHeight: {
        configurable: true,
        get: () => (box.hidden ? 0 : box.scrollHeight),
      },
      scrollTop: {
        configurable: true,
        get: () => (box.hidden ? 0 : scrollTop),
        set: (value: number) => {
          if (!box.hidden) {
            scrollTop = Math.round(
              Math.max(0, Math.min(value, box.scrollHeight - 100))
            );
          }
        },
      },
    });
  }

  async function runFrames(count: number): Promise<void> {
    await act(async () => {
      jest.advanceTimersByTime(16);
    });
    if (count > 1) {
      await runFrames(count - 1);
    }
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

  describe('when the chat is hidden and shown again', () => {
    test('keeps a reader who scrolled up where they were', async () => {
      const { container } = render(createElement(Harness, null));
      const scroll = container.firstElementChild as HTMLDivElement;
      const box = { hidden: false, scrollHeight: 500 };
      mockScrollBox(scroll, box);
      scroll.scrollTop = 400;
      act(() => resize({ width: 300, height: 500 }));

      fireEvent.wheel(scroll, { deltaY: -120 });
      scroll.scrollTop = 200;
      fireEvent.scroll(scroll);
      await runFrames(2);
      expect(instance.state.isAtBottom).toBe(false);

      box.hidden = true;
      act(() => resize({ width: 0, height: 0 }));

      expect(instance.state.isAtBottom).toBe(false);
      expect(instance.state.escapedFromLock).toBe(true);

      box.hidden = false;
      act(() => resize({ width: 300, height: 500 }));
      await runFrames(60);

      expect(scroll.scrollTop).toBe(200);
      expect(instance.state.isAtBottom).toBe(false);
    });

    test('keeps following the conversation when it was at the bottom', async () => {
      const { container } = render(createElement(Harness, null));
      const scroll = container.firstElementChild as HTMLDivElement;
      const box = { hidden: false, scrollHeight: 500 };
      mockScrollBox(scroll, box);
      scroll.scrollTop = 400;
      act(() => resize({ width: 300, height: 500 }));
      await runFrames(2);

      box.hidden = true;
      act(() => resize({ width: 0, height: 0 }));
      box.scrollHeight = 640;

      box.hidden = false;
      act(() => resize({ width: 300, height: 640 }));
      await runFrames(60);

      expect(scroll.scrollTop).toBe(539);
      expect(instance.state.isAtBottom).toBe(true);
    });
  });

  describe('when the reader scrolls up while a reply streams', () => {
    async function renderAtBottom() {
      const { container } = render(createElement(Harness, null));
      const scroll = container.firstElementChild as HTMLDivElement;
      const box = { hidden: false, scrollHeight: 500 };
      mockScrollBox(scroll, box);
      scroll.scrollTop = 400;
      act(() => resize({ width: 300, height: 500 }));
      await runFrames(2);
      return { scroll, box };
    }

    // The browser scrolls a page up, then the next streamed line arrives.
    async function scrollUpWhileStreaming(
      scroll: HTMLElement,
      box: { scrollHeight: number }
    ) {
      scroll.scrollTop = 300;
      fireEvent.scroll(scroll);
      box.scrollHeight = 560;
      act(() => resize({ width: 300, height: 560 }));
      await runFrames(60);
    }

    test('stays where the keyboard scrolled it', async () => {
      const { scroll, box } = await renderAtBottom();

      fireEvent.keyDown(scroll, { key: 'PageUp' });
      await scrollUpWhileStreaming(scroll, box);

      expect(scroll.scrollTop).toBe(300);
      expect(instance.state.isAtBottom).toBe(false);
    });

    test('stays where the wheel scrolled it', async () => {
      const { scroll, box } = await renderAtBottom();
      // Like the chat's styles, which only scroll the history vertically.
      scroll.style.overflow = '';
      scroll.style.overflowY = 'auto';
      scroll.style.overflowX = 'hidden';

      fireEvent.wheel(scroll.firstElementChild!, { deltaY: -120 });
      await scrollUpWhileStreaming(scroll, box);

      expect(scroll.scrollTop).toBe(300);
      expect(instance.state.isAtBottom).toBe(false);
    });

    test('keeps following for keys that do not scroll it up', async () => {
      const { scroll } = await renderAtBottom();
      const field = document.createElement('input');
      const widget = document.createElement('div');
      widget.addEventListener('keydown', (event) => event.preventDefault());
      scroll.firstElementChild!.append(field, widget);

      fireEvent.keyDown(scroll, { key: 'PageDown' });
      expect(instance.state.isAtBottom).toBe(true);
      fireEvent.keyDown(field, { key: 'ArrowUp' });
      expect(instance.state.isAtBottom).toBe(true);
      fireEvent.keyDown(widget, { key: 'PageUp' });
      expect(instance.state.isAtBottom).toBe(true);
    });
  });
});
