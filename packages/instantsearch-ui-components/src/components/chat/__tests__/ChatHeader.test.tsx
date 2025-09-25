/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
          title="Custom title"
        >
          <span
            class="ais-ChatHeader-title"
          >
            <span
              class="ais-ChatHeader-titleIcon"
            >
              <svg
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
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
              class="ais-ChatHeader-maximize"
              type="button"
            >
              <svg
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
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
              class="ais-ChatHeader-close"
              title="Close chat"
              type="button"
            >
              <svg
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
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
      </div>
    `);
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(<ChatHeader onClose={onClose} />);

    userEvent.click(container.querySelector('.ais-ChatHeader-close')!);
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
    expect(container.querySelector('.ais-ChatHeader-close')!.className).toBe(
      'ais-ChatHeader-close custom-close'
    );
    expect(container.querySelector('.ais-ChatHeader-title')!.className).toBe(
      'ais-ChatHeader-title custom-title'
    );
  });
});
