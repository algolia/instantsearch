/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createChatInlineLayoutComponent } from '../ChatInlineLayout';

const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement,
  Fragment,
});

describe('ChatInlineLayout', () => {
  const defaultProps = {
    open: true,
    maximized: false,
    headerElement: <div className="header">Header</div>,
    messagesElement: <div className="messages">Messages</div>,
    promptElement: <div className="prompt">Prompt</div>,
    toggleButtonElement: <button className="toggle">Toggle</button>,
  };

  test('renders with default props', () => {
    const { container } = render(<ChatInlineLayout {...defaultProps} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat ais-ChatInlineLayout"
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

  test('does not render toggle button', () => {
    const { container } = render(<ChatInlineLayout {...defaultProps} />);
    expect(container.querySelector('.toggle')).not.toBeInTheDocument();
    expect(
      container.querySelector('.ais-Chat-toggleButtonWrapper')
    ).not.toBeInTheDocument();
  });

  test('accepts custom classNames', () => {
    const { container } = render(
      <ChatInlineLayout
        {...defaultProps}
        classNames={{ root: 'ROOT', container: 'CONTAINER' }}
      />
    );
    expect(container.querySelector('.ais-Chat')!.className).toBe(
      'ais-Chat ais-ChatInlineLayout ROOT'
    );
    expect(container.querySelector('.ais-Chat-container')!.className).toBe(
      'ais-Chat-container ais-Chat-container--open CONTAINER'
    );
  });

  test('renders all slot elements', () => {
    const { container } = render(<ChatInlineLayout {...defaultProps} />);
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.messages')).toBeInTheDocument();
    expect(container.querySelector('.prompt')).toBeInTheDocument();
  });
});
