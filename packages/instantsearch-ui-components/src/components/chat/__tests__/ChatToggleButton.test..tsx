/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createChatToggleButtonComponent } from '../ChatToggleButton';

const ChatToggleButton = createChatToggleButtonComponent({
  createElement,
  Fragment,
});

describe('ChatToggleButton', () => {
  test('renders with default props', () => {
    const { container } = render(<ChatToggleButton open onClick={jest.fn()} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton ais-ChatToggleButton--open"
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
              d="m18 15-6-6-6 6"
            />
          </svg>
        </button>
      </div>
    `);
  });

  test('renders with closed prop', () => {
    const { container } = render(
      <ChatToggleButton open={false} onClick={jest.fn()} />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton"
          type="button"
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
        </button>
      </div>
    `);
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const { container } = render(<ChatToggleButton open onClick={onClick} />);

    userEvent.click(container.querySelector('button')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom class names', () => {
    const { container } = render(
      <ChatToggleButton
        open
        onClick={jest.fn()}
        classNames={{ root: 'custom-root' }}
      />
    );
    expect(container.querySelector('button')!.className).toBe(
      'ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton ais-ChatToggleButton--open custom-root'
    );

    const { container: classNameContainer } = render(
      <ChatToggleButton open onClick={jest.fn()} className="custom-root" />
    );
    expect(classNameContainer.querySelector('button')!.className).toBe(
      'ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton ais-ChatToggleButton--open custom-root'
    );
  });

  test('renders with custom toggle icon component', () => {
    const CustomIcon = ({ isOpen }: { isOpen: boolean }) => (
      <span>{isOpen ? 'Close' : 'Open'}</span>
    );

    const { container } = render(
      <ChatToggleButton
        open={false}
        onClick={jest.fn()}
        toggleIconComponent={CustomIcon}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton"
          type="button"
        >
          <span>
            Open
          </span>
        </button>
      </div>
    `);
  });
});
