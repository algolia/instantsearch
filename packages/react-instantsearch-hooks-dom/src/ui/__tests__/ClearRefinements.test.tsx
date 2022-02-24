import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ClearRefinements } from '../ClearRefinements';

describe('ClearRefinements', () => {
  test('renders with default props', () => {
    const { container } = render(<ClearRefinements />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('renders with a custom label', () => {
    const { container } = render(<ClearRefinements resetLabel="Clear" />);

    expect(
      document.querySelector('.ais-ClearRefinements-button')
    ).toHaveTextContent('Clear');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear
          </button>
        </div>
      </div>
    `);
  });

  test('passes an `onClick` callback to the button', () => {
    const onClick = jest.fn();
    render(<ClearRefinements onClick={onClick} />);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disables the button', () => {
    const onClick = jest.fn();
    const { container } = render(
      <ClearRefinements onClick={onClick} disabled />
    );

    const button = document.querySelector('.ais-ClearRefinements-button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('ais-ClearRefinements-button--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  test('forwards a custom class name to the root element', () => {
    const { container } = render(
      <ClearRefinements className="MyClearsRefinements" />
    );

    expect(document.querySelector('.ais-ClearRefinements')).toHaveClass(
      'MyClearsRefinements'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements MyClearsRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <ClearRefinements title="Some custom title" />
    );

    expect(document.querySelector('.ais-ClearRefinements')).toHaveAttribute(
      'title',
      'Some custom title'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
          title="Some custom title"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });
});
