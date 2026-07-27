/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { createChatComponent } from '../Chat';

import type { ChatProps } from '../Chat';

const Chat = createChatComponent({
  createElement,
  Fragment,
  useMemo,
  useState,
});

describe('Chat', () => {
  test('renders with default props', () => {
    const { container } = render(
      <Chat
        open
        sendMessage={jest.fn() as any}
        regenerate={jest.fn() as any}
        stop={jest.fn() as any}
        error={undefined}
        headerProps={{ onClose: jest.fn() }}
        messagesProps={{
          messages: [],
          indexUiState: {},
          setIndexUiState: jest.fn(),
          tools: {},
          onReload: jest.fn(),
          onClose: jest.fn(),
        }}
        promptProps={{}}
        suggestionsProps={{ onSuggestionClick: jest.fn() }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat ais-ChatOverlayLayout"
        >
          <div
            class="ais-Chat-container ais-Chat-container--open"
          >
            <div
              class="ais-ChatHeader"
            >
              <span
                class="ais-ChatHeader-title"
              >
                <span
                  class="ais-ChatHeader-titleIcon"
                >
                  <svg
                    fill="none"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 1.875c.27 0 .51.173.594.43l1.593 4.844a1.043 1.043 0 0 0 .664.664l4.844 1.593a.625.625 0 0 1 0 1.188l-4.844 1.593a1.043 1.043 0 0 0-.664.664l-1.593 4.844a.625.625 0 0 1-1.188 0l-1.593-4.844a1.042 1.042 0 0 0-.664-.664l-4.844-1.593a.625.625 0 0 1 0-1.188l4.844-1.593a1.042 1.042 0 0 0 .664-.664l1.593-4.844a.625.625 0 0 1 .594-.43ZM9 7.539A2.292 2.292 0 0 1 7.54 9L4.5 10l3.04 1A2.292 2.292 0 0 1 9 12.46l1 3.04 1-3.04A2.293 2.293 0 0 1 12.46 11l3.04-1-3.04-1A2.292 2.292 0 0 1 11 7.54L10 4.5 9 7.54ZM4.167 1.875c.345 0 .625.28.625.625v3.333a.625.625 0 0 1-1.25 0V2.5c0-.345.28-.625.625-.625ZM15.833 13.542c.345 0 .625.28.625.625V17.5a.625.625 0 1 1-1.25 0v-3.333c0-.345.28-.625.625-.625Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                    <path
                      clipRule="evenodd"
                      d="M1.875 4.167c0-.346.28-.625.625-.625h3.333a.625.625 0 1 1 0 1.25H2.5a.625.625 0 0 1-.625-.625ZM13.542 15.833c0-.345.28-.625.625-.625H17.5a.625.625 0 0 1 0 1.25h-3.333a.625.625 0 0 1-.625-.625Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
                Chat
              </span>
              <div
                class="ais-ChatHeader-actions"
              >
                <button
                  aria-label="Maximize chat"
                  class="ais-Button ais-Button--ghost ais-Button--sm ais-Button--icon-only ais-ChatHeader-maximize"
                  type="button"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3h6v6"
                    />
                    <path
                      d="m21 3-7 7"
                    />
                    <path
                      d="m3 21 7-7"
                    />
                    <path
                      d="M9 21H3v-6"
                    />
                  </svg>
                </button>
                <button
                  aria-label="Close chat"
                  class="ais-Button ais-Button--ghost ais-Button--sm ais-Button--icon-only ais-ChatHeader-close"
                  title="Close chat"
                  type="button"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6 6 18"
                    />
                    <path
                      d="m6 6 12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              aria-live="polite"
              class="ais-ChatMessages"
              role="log"
            >
              <div
                class="ais-ChatMessages-scroll ais-Scrollbar"
              >
                <div
                  class="ais-ChatMessages-content"
                />
              </div>
              <button
                aria-label="Scroll to bottom"
                class="ais-Button ais-Button--outline ais-Button--sm ais-Button--icon-only ais-ChatMessages-scrollToBottom"
                tabindex="0"
                type="button"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
            </div>
            <form
              class="ais-ChatPrompt"
            >
              <div
                class="ais-ChatPrompt-body"
              >
                <textarea
                  aria-label="Type your message..."
                  autofocus="true"
                  class="ais-ChatPrompt-textarea ais-Scrollbar"
                  data-max-rows="5"
                  placeholder="Type your message..."
                  style="height: auto; overflow-y: hidden;"
                />
                <div
                  class="ais-ChatPrompt-actions"
                >
                  <button
                    aria-label="Message is empty"
                    class="ais-Button ais-Button--primary ais-Button--sm ais-Button--icon-only ais-ChatPrompt-submit"
                    data-status="ready"
                    disabled=""
                    type="submit"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m5 12 7-7 7 7"
                      />
                      <path
                        d="M12 19V5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                class="ais-ChatPrompt-footer"
              >
                <div
                  class="ais-ChatPrompt-disclaimer"
                >
                  AI can make mistakes. Verify responses.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `);
  });

  describe('clearing', () => {
    const baseProps = (
      onClear: () => void
    ): Omit<ChatProps, 'headerProps' | 'messagesProps'> & {
      headerProps: ChatProps['headerProps'];
      messagesProps: ChatProps['messagesProps'];
    } => ({
      open: true,
      sendMessage: jest.fn() as any,
      regenerate: jest.fn() as any,
      stop: jest.fn() as any,
      error: undefined,
      headerProps: { onClose: jest.fn(), onClear, canClear: true },
      messagesProps: {
        messages: [
          { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
        ],
        indexUiState: {},
        setIndexUiState: jest.fn(),
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      },
      promptProps: {},
      suggestionsProps: { onSuggestionClick: jest.fn() },
    });

    const originalMatchMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    // Preact only normalizes an `onX` prop to a lowercase `x` event listener
    // when `onx` exists on the element (always true in real browsers). jsdom
    // omits `ontransitionend`, so without this preact would listen for a
    // `TransitionEnd` event that our dispatched `transitionend` never matches.
    let hadOnTransitionEnd: boolean;
    beforeAll(() => {
      hadOnTransitionEnd = 'ontransitionend' in window.HTMLElement.prototype;
      if (!hadOnTransitionEnd) {
        Object.defineProperty(window.HTMLElement.prototype, 'ontransitionend', {
          value: null,
          writable: true,
          configurable: true,
        });
      }
    });
    afterAll(() => {
      if (!hadOnTransitionEnd) {
        delete (window.HTMLElement.prototype as any).ontransitionend;
      }
    });

    const mockReducedMotion = (matches: boolean) => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)' && matches,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
    };

    test('fades out, then commits the clear when the opacity transition ends', () => {
      mockReducedMotion(false);
      const onClear = jest.fn();
      const { container } = render(<Chat {...baseProps(onClear)} />);

      fireEvent.click(container.querySelector('.ais-ChatHeader-clear')!);

      // Fade-out has started but the messages are not committed yet.
      const content = container.querySelector('.ais-ChatMessages-content')!;
      expect(
        content.classList.contains('ais-ChatMessages-content--clearing')
      ).toBe(true);
      expect(onClear).not.toHaveBeenCalled();

      // The opacity transition ending commits the clear. jsdom lacks
      // `TransitionEvent`, so build a native `transitionend` event and set
      // `propertyName` on it explicitly.
      const transitionEndEvent = new Event('transitionend', { bubbles: true });
      Object.defineProperty(transitionEndEvent, 'propertyName', {
        value: 'opacity',
      });
      fireEvent(content, transitionEndEvent);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    test('stops an in-flight stream immediately, then commits on transition end', () => {
      mockReducedMotion(false);
      const onClear = jest.fn();
      const stop = jest.fn();
      const props = baseProps(onClear);
      const { container } = render(
        <Chat
          {...props}
          stop={stop as any}
          messagesProps={{ ...props.messagesProps, status: 'streaming' }}
        />
      );

      fireEvent.click(container.querySelector('.ais-ChatHeader-clear')!);

      // Streaming is stopped right away so the assistant stops responding; the
      // messages keep fading until the transition ends.
      expect(stop).toHaveBeenCalledTimes(1);
      expect(onClear).not.toHaveBeenCalled();
      const content = container.querySelector('.ais-ChatMessages-content')!;
      expect(
        content.classList.contains('ais-ChatMessages-content--clearing')
      ).toBe(true);

      const transitionEndEvent = new Event('transitionend', { bubbles: true });
      Object.defineProperty(transitionEndEvent, 'propertyName', {
        value: 'opacity',
      });
      fireEvent(content, transitionEndEvent);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    test('commits immediately when the user prefers reduced motion', () => {
      mockReducedMotion(true);
      const onClear = jest.fn();
      const { container } = render(<Chat {...baseProps(onClear)} />);

      fireEvent.click(container.querySelector('.ais-ChatHeader-clear')!);

      // No fade-out, no waiting for a transition that would never fire.
      expect(onClear).toHaveBeenCalledTimes(1);
      const content = container.querySelector('.ais-ChatMessages-content')!;
      expect(
        content.classList.contains('ais-ChatMessages-content--clearing')
      ).toBe(false);
    });
  });
});
