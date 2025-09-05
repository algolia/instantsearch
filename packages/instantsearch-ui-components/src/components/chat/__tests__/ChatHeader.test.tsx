/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createChatHeaderComponent } from '../ChatHeader';

const ChatHeader = createChatHeaderComponent({
  createElement,
  Fragment,
});

describe('ChatHeader', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ChatHeader title="Custom title" onClose={jest.fn()} />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ChatHeader"
        >
          <span
            class="ais-ChatHeader-title"
          >
            Custom title
          </span>
          <button
            aria-label="Close chat"
            class="ais-ChatHeader-close"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
    `);
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(<ChatHeader onClose={onClose} />);

    userEvent.click(container.querySelector('button')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('applies custom class names', () => {
    const { container } = render(
      <ChatHeader
        title="Custom Title"
        onClose={jest.fn()}
        classNames={{
          root: 'custom-root',
          close: 'custom-close',
          title: 'custom-title',
        }}
      />
    );
    expect(container.querySelector('.ais-ChatHeader')!.className).toBe(
      'ais-ChatHeader custom-root'
    );
    expect(container.querySelector('button')!.className).toBe(
      'ais-ChatHeader-close custom-close'
    );
    expect(container.querySelector('.ais-ChatHeader-title')!.className).toBe(
      'ais-ChatHeader-title custom-title'
    );
  });
});
