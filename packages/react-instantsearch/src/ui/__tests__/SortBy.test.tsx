/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SortBy } from '../SortBy';

import type { SortByProps } from '../SortBy';

describe('SortBy', () => {
  function createProps(props: Partial<SortByProps>) {
    return {
      items: [
        { label: 'Featured', value: 'instant_search' },
        { label: 'Price (asc)', value: 'instant_search_price_asc' },
        { label: 'Price (desc)', value: 'instant_search_price_desc' },
      ],
      ...props,
    };
  }

  test('renders with props', () => {
    const props = createProps({});
    const { container } = render(<SortBy {...props} />);

    expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
      'instant_search'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy"
        >
          <select
            aria-label="Sort results by"
            class="ais-SortBy-select"
          >
            <option
              class="ais-SortBy-option"
              value="instant_search"
            >
              Featured
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_asc"
            >
              Price (asc)
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_desc"
            >
              Price (desc)
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('sets the value', () => {
    const props = createProps({});

    render(<SortBy {...props} value="instant_search_price_asc" />);

    expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
      'instant_search_price_asc'
    );
  });

  test('calls an `onChange` callback when selecting an option', () => {
    const props = createProps({});

    const onChange = jest.fn();
    const { getByRole } = render(<SortBy {...props} onChange={onChange} />);

    userEvent.selectOptions(
      document.querySelector('.ais-SortBy-select') as HTMLSelectElement,
      getByRole('option', { name: 'Price (asc)' })
    );

    expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
      'instant_search_price_asc'
    );
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomSortBy',
      classNames: {
        root: 'ROOT',
        select: 'SELECT',
        option: 'OPTION',
      },
    });
    const { container } = render(<SortBy {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy ROOT MyCustomSortBy"
        >
          <select
            aria-label="Sort results by"
            class="ais-SortBy-select SELECT"
          >
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search"
            >
              Featured
            </option>
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search_price_asc"
            >
              Price (asc)
            </option>
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search_price_desc"
            >
              Price (desc)
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<SortBy {...props} />);

    expect(container.querySelector('.ais-SortBy')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
