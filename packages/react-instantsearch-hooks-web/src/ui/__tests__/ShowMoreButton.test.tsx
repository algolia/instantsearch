import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ShowMoreButton } from '../ShowMoreButton';

describe('ShowMoreButton', () => {
  test('renders with props', () => {
    const { container } = render(<ShowMoreButton isShowingMore={false} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Show more
        </button>
      </div>
    `);
  });

  test('changes the button label when is showing more', () => {
    const { container } = render(<ShowMoreButton isShowingMore={true} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Show less
        </button>
      </div>
    `);
  });

  test('calls an `onClick` callback when clicking the button', () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <ShowMoreButton isShowingMore={false} onClick={onClick} />
    );

    userEvent.click(getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disables the button', () => {
    const onClick = jest.fn();
    const { container, getByRole } = render(
      <ShowMoreButton isShowingMore={false} disabled={true} onClick={onClick} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          disabled=""
        >
          Show more
        </button>
      </div>
    `);

    userEvent.click(getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});
