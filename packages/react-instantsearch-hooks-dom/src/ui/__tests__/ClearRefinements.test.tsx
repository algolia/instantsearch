import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ClearRefinements } from '../ClearRefinements';

import type { ClearRefinementsProps } from '../ClearRefinements';

function createProps(
  props?: Partial<ClearRefinementsProps>
): ClearRefinementsProps {
  return {
    translations: {
      resetLabel: 'Clear refinements',
    },
    ...props,
  };
}

describe('ClearRefinements', () => {
  test('renders with props', () => {
    const props = createProps({});
    const { container } = render(<ClearRefinements {...props} />);

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

  test('passes an `onClick` callback to the button', () => {
    const props = createProps({});
    const onClick = jest.fn();
    const { container } = render(
      <ClearRefinements {...props} onClick={onClick} />
    );

    userEvent.click(
      container.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disables the button', () => {
    const props = createProps({});
    const onClick = jest.fn();
    const { container } = render(
      <ClearRefinements {...props} onClick={onClick} disabled />
    );

    const button = container.querySelector('.ais-ClearRefinements-button');

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
      container.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({});
    const { container } = render(
      <ClearRefinements {...props} className="MyClearsRefinements" />
    );

    expect(container.querySelector('.ais-ClearRefinements')).toHaveClass(
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
    const props = createProps({});
    const { container } = render(
      <ClearRefinements {...props} title="Some custom title" />
    );

    expect(container.querySelector('.ais-ClearRefinements')).toHaveAttribute(
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

  test('allows custom class names', () => {
    const props = createProps({});
    const { container } = render(
      <ClearRefinements
        {...props}
        disabled
        classNames={{
          root: 'ROOT',
          button: 'BUTTON',
          disabledButton: 'DISABLEDBUTTON',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements ROOT"
        >
          <button
            class="ais-ClearRefinements-button BUTTON ais-ClearRefinements-button--disabled DISABLEDBUTTON"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });
});
