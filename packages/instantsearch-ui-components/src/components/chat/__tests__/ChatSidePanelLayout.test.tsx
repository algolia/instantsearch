/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createChatSidePanelLayoutComponent } from '../ChatSidePanelLayout';

const ChatSidePanelLayout = createChatSidePanelLayoutComponent({
  createElement,
  Fragment,
});

describe('ChatSidePanelLayout', () => {
  const defaultProps = {
    open: true,
    maximized: false,
    headerComponent: <div className="header">Header</div>,
    messagesComponent: <div className="messages">Messages</div>,
    promptComponent: <div className="prompt">Prompt</div>,
    toggleButtonComponent: <button className="toggle">Toggle</button>,
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
    const { container } = render(<ChatSidePanelLayout {...defaultProps} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat ais-ChatSidePanelLayout"
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
          <div
            class="ais-Chat-toggleButtonWrapper"
          >
            <button
              class="toggle"
            >
              Toggle
            </button>
          </div>
        </div>
      </div>
    `);
  });

  test('renders closed state', () => {
    const { container } = render(
      <ChatSidePanelLayout {...defaultProps} open={false} />
    );
    expect(container.querySelector('.ais-Chat-container')).not.toHaveClass(
      'ais-Chat-container--open'
    );
  });

  test('renders maximized state', () => {
    const { container } = render(
      <ChatSidePanelLayout {...defaultProps} maximized={true} />
    );
    expect(container.querySelector('.ais-Chat')).toHaveClass(
      'ais-ChatSidePanelLayout--maximized'
    );
    expect(container.querySelector('.ais-Chat-container')).toHaveClass(
      'ais-Chat-container--maximized'
    );
  });

  test('accepts custom classNames', () => {
    const { container } = render(
      <ChatSidePanelLayout
        {...defaultProps}
        classNames={{ root: 'ROOT', container: 'CONTAINER' }}
      />
    );
    expect(container.querySelector('.ais-Chat')!.className).toBe(
      'ais-Chat ais-ChatSidePanelLayout ROOT'
    );
    expect(container.querySelector('.ais-Chat-container')!.className).toBe(
      'ais-Chat-container ais-Chat-container--open CONTAINER'
    );
  });

  test('renders all slot elements', () => {
    const { container } = render(<ChatSidePanelLayout {...defaultProps} />);
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.messages')).toBeInTheDocument();
    expect(container.querySelector('.prompt')).toBeInTheDocument();
    expect(container.querySelector('.toggle')).toBeInTheDocument();
    expect(
      container.querySelector('.ais-Chat-toggleButtonWrapper')
    ).toBeInTheDocument();
  });

  test('adds body-open class to body when open', () => {
    render(<ChatSidePanelLayout {...defaultProps} open={true} />);
    expect(document.body).toHaveClass('ais-ChatSidePanelLayout--body-open');
  });

  test('removes body-open class from body when closed', () => {
    render(<ChatSidePanelLayout {...defaultProps} open={false} />);
    expect(document.body).not.toHaveClass('ais-ChatSidePanelLayout--body-open');
  });

  test('adds body-open class to custom parentElement', () => {
    const parent = document.createElement('div');
    render(
      <ChatSidePanelLayout
        {...defaultProps}
        open={true}
        parentElement={parent}
      />
    );
    expect(parent).toHaveClass('ais-ChatSidePanelLayout--body-open');
    expect(document.body).not.toHaveClass(
      'ais-ChatSidePanelLayout--body-open'
    );
  });
});
