/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

/**
 * Keeping this suite for when we migrate VDOM components to their own package.
 */
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
      resetButtonText: 'Clear refinements',
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

  test('renders with translations', () => {
    const props = createProps({
      translations: {
        resetButtonText: 'Reset filters',
      },
    });
    const { container } = render(<ClearRefinements {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Reset filters
          </button>
        </div>
      </div>
    `);
  });

  test('calls an `onClick` callback when clicking the button', () => {
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

    userEvent.click(
      container.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      disabled: true,
      className: 'MyCustomClearRefinements',
      classNames: {
        root: 'ROOT',
        button: 'BUTTON',
        disabledButton: 'DISABLEDBUTTON',
      },
    });
    const { container } = render(<ClearRefinements {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements ROOT MyCustomClearRefinements"
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

  test('forwards `div` props to the root element', () => {
    const props = createProps({});
    const { container } = render(
      <ClearRefinements {...props} title="Some custom title" />
    );

    expect(container.querySelector('.ais-ClearRefinements')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
