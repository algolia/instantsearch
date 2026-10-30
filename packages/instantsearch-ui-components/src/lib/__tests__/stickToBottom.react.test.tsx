/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { fireEvent, render } from '@testing-library/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createStickToBottom } from '../stickToBottom';

import type { StickToBottomInstance } from '../stickToBottom';

const useStickToBottom = createStickToBottom({
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
});

describe('useStickToBottom with React', () => {
  beforeEach(() => {
    global.ResizeObserver = class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  test('keeps following when a React handler takes the key', () => {
    let instance: StickToBottomInstance | undefined;
    function Harness() {
      instance = useStickToBottom();

      return (
        <div ref={instance.scrollRef} style={{ overflow: 'auto' }}>
          <div ref={instance.contentRef}>
            <button
              type="button"
              onKeyDown={(event) => {
                event.preventDefault();
              }}
            >
              Carousel
            </button>
          </div>
        </div>
      );
    }
    const { container, getByRole } = render(<Harness />);
    Object.defineProperties(container.firstElementChild, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 500 },
    });

    fireEvent.keyDown(getByRole('button', { name: 'Carousel' }), {
      key: 'PageUp',
    });

    expect(instance?.state.isAtBottom).toBe(true);
  });
});
