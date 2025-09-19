/**
 * @jest-environment jsdom
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
          class="ais-ChatToggleButton ais-ChatToggleButton--open"
          type="button"
        >
          Close chat
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
          class="ais-ChatToggleButton"
          type="button"
        >
          Open chat
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
      'ais-ChatToggleButton ais-ChatToggleButton--open custom-root'
    );

    const { container: classNameContainer } = render(
      <ChatToggleButton open onClick={jest.fn()} className="custom-root" />
    );
    expect(classNameContainer.querySelector('button')!.className).toBe(
      'custom-root'
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
          class="ais-ChatToggleButton"
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
