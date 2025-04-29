/**
 * @jest-environment jsdom
 */

/**
 * Keeping this suite for when we migrate VDOM components to their own package.
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HitsPerPage } from '../HitsPerPage';

import type { HitsPerPageProps } from '../HitsPerPage';

function createProps(props?: Partial<HitsPerPageProps>): HitsPerPageProps {
  return {
    items: [
      { label: '10', value: 10, default: true },
      { label: '20', value: 20 },
      { label: '30', value: 30 },
    ],
    currentValue: 10,
    onChange: jest.fn(),
    ...props,
  };
}

describe('HitsPerPage', () => {
  test('renders with props', () => {
    const props = createProps();
    const { container } = render(<HitsPerPage {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HitsPerPage"
        >
          <select
            class="ais-HitsPerPage-select"
          >
            <option
              class="ais-HitsPerPage-option"
              value="10"
            >
              10
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="20"
            >
              20
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="30"
            >
              30
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('selects current value', () => {
    const props = createProps({
      currentValue: 20,
    });
    const { getByRole } = render(<HitsPerPage {...props} />);

    expect(
      (getByRole('option', { name: '10' }) as HTMLOptionElement).selected
    ).toBe(false);
    expect(
      (getByRole('option', { name: '20' }) as HTMLOptionElement).selected
    ).toBe(true);
    expect(
      (getByRole('option', { name: '30' }) as HTMLOptionElement).selected
    ).toBe(false);
  });

  test('calls an `onChange` callback when selecting an option', () => {
    const props = createProps();
    const { getByRole } = render(<HitsPerPage {...props} />);

    userEvent.selectOptions(getByRole('combobox'), ['10']);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(10);

    userEvent.selectOptions(getByRole('combobox'), ['20']);

    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenLastCalledWith(20);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomHitsPerPage',
      classNames: {
        root: 'ROOT',
        select: 'SELECT',
        option: 'OPTION',
      },
    });
    const { container } = render(<HitsPerPage {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HitsPerPage ROOT MyCustomHitsPerPage"
        >
          <select
            class="ais-HitsPerPage-select SELECT"
          >
            <option
              class="ais-HitsPerPage-option OPTION"
              value="10"
            >
              10
            </option>
            <option
              class="ais-HitsPerPage-option OPTION"
              value="20"
            >
              20
            </option>
            <option
              class="ais-HitsPerPage-option OPTION"
              value="30"
            >
              30
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({
      title: 'Some custom title',
    });
    const { container } = render(<HitsPerPage {...props} />);

    expect(container.querySelector('.ais-HitsPerPage')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
