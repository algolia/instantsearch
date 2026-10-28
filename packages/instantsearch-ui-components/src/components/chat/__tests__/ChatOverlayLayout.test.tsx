/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createChatOverlayLayoutComponent } from '../ChatOverlayLayout';

const ChatOverlayLayout = createChatOverlayLayoutComponent({
  createElement,
  Fragment,
});

describe('ChatOverlayLayout', () => {
  const defaultProps = {
    open: true,
    maximized: false,
    headerComponent: <div className="header">Header</div>,
    messagesComponent: <div className="messages">Messages</div>,
    promptComponent: <div className="prompt">Prompt</div>,
    messages: [],
    status: 'ready' as const,
    isClearing: false,
    clearMessages: jest.fn(),
    onClearTransitionEnd: jest.fn(),
    tools: {},
    sendMessage: jest.fn() as any,
    regenerate: jest.fn() as any,
    stop: jest.fn() as any,
    error: undefined,
  };

  test('renders with default props', () => {
    const { container } = render(<ChatOverlayLayout {...defaultProps} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat ais-ChatOverlayLayout"
        >
          <div
            class="ais-Chat-container ais-Chat-container--open"
          >
            <div
              class="header"
            >
              Header
            </div>
            <div
              class="messages"
            >
              Messages
            </div>
            <div
              class="prompt"
            >
              Prompt
            </div>
          </div>
        </div>
      </div>
    `);
  });

  test('renders closed state', () => {
    const { container } = render(
      <ChatOverlayLayout {...defaultProps} open={false} />
    );
    expect(container.querySelector('.ais-Chat-container')).not.toHaveClass(
      'ais-Chat-container--open'
    );
  });

  test('makes closed content inactive until reopened', () => {
    const createElementSpy = jest.fn(createElement);
    const CompatibleChatOverlayLayout = createChatOverlayLayoutComponent({
      createElement: createElementSpy,
      Fragment,
    });
    const { container, rerender } = render(
      <CompatibleChatOverlayLayout
        {...defaultProps}
        open={false}
        promptComponent={<button>Send</button>}
      />
    );
    const chatContainer = container.querySelector('.ais-Chat-container')!;

    expect(chatContainer).toHaveAttribute('inert');
    expect(chatContainer.querySelector('button')).toBeInTheDocument();
    expect(
      createElementSpy.mock.calls.some(
        ([, props]) => (props as { inert?: unknown } | null)?.inert === 1
      )
    ).toBe(true);

    rerender(
      <CompatibleChatOverlayLayout
        {...defaultProps}
        open={true}
        promptComponent={<button>Send</button>}
      />
    );

    expect(chatContainer).not.toHaveAttribute('inert');
    expect(chatContainer.querySelector('button')).toBeInTheDocument();
  });

  test('renders maximized state', () => {
    const { container } = render(
      <ChatOverlayLayout {...defaultProps} maximized={true} />
    );
    expect(container.querySelector('.ais-Chat')).toHaveClass(
      'ais-ChatOverlayLayout--maximized'
    );
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--maximized'
    );
  });

  test('accepts custom classNames', () => {
    const { container } = render(
      <ChatOverlayLayout
        {...defaultProps}
        classNames={{ root: 'ROOT', container: 'CONTAINER' }}
      />
    );
    expect(container.querySelector('.ais-Chat')!.className).toBe(
      'ais-Chat ais-ChatOverlayLayout ROOT'
    );
    expect(container.querySelector('.ais-Chat-container')!.className).toBe(
      'ais-Chat-container ais-Chat-container--open CONTAINER'
    );
  });

  test('renders all slot elements', () => {
    const { container } = render(<ChatOverlayLayout {...defaultProps} />);
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.messages')).toBeInTheDocument();
    expect(container.querySelector('.prompt')).toBeInTheDocument();
  });
});
