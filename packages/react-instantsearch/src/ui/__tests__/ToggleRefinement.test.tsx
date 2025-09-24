/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ToggleRefinement } from '../ToggleRefinement';

import type { ToggleRefinementProps } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  function createProps(
    props: Partial<ToggleRefinementProps>
  ): ToggleRefinementProps {
    return {
      label: 'Free shipping',
      onChange: jest.fn(),
      classNames: {},
      ...props,
    };
  }

  test('renders with props', () => {
    const props = createProps({});
    const { container } = render(<ToggleRefinement {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              Free shipping
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('customizes the label', () => {
    const props = createProps({ label: 'Gluten free' });
    const { container } = render(<ToggleRefinement {...props} />);

    expect(
      container.querySelector('.ais-ToggleRefinement-labelText')
    ).toHaveTextContent('Gluten free');
  });

  test('sets the checkbox as checked', () => {
    const props = createProps({ checked: true });
    const { container } = render(<ToggleRefinement {...props} />);

    expect(
      (
        container.querySelector(
          '.ais-ToggleRefinement-checkbox'
        ) as HTMLInputElement
      ).checked
    ).toBe(true);
  });

  test('calls an `onChange` callback when clicking a checkbox', () => {
    const props = createProps({});
    const { container } = render(<ToggleRefinement {...props} />);

    userEvent.click(
      container.querySelector<HTMLInputElement>(
        '.ais-ToggleRefinement-checkbox'
      )!
    );

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(true);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomToggleRefinement',
      classNames: {
        root: 'ROOT',
        label: 'LABEL',
        checkbox: 'CHECKBOX',
        labelText: 'LABELTEXT',
      },
    });
    const { container } = render(<ToggleRefinement {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement ROOT MyCustomToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label LABEL"
          >
            <input
              class="ais-ToggleRefinement-checkbox CHECKBOX"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText LABELTEXT"
            >
              Free shipping
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<ToggleRefinement {...props} />);

    expect(container.firstChild).toHaveAttribute('title', 'Some custom title');
  });
});
