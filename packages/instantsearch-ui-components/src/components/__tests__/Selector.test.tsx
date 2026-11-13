/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createHitsPerPageComponent } from '../HitsPerPage';
import { createSelectorComponent } from '../Selector';
import { createSortByComponent } from '../SortBy';

import type { SelectorProps } from '../Selector';

describe('Selector', () => {
  const Selector = createSelectorComponent({ createElement, Fragment });

  function createProps(props: Partial<SelectorProps>) {
    return {
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
      classNames: {
        root: 'ais-Widget',
        select: 'ais-Widget-select',
        option: 'ais-Widget-option',
      },
      value: 'a',
      onChange: jest.fn(),
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});
    const { container } = render(<Selector {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Widget"
        >
          <select
            class="ais-Widget-select"
          >
            <option
              class="ais-Widget-option"
              value="a"
            >
              Alpha
            </option>
            <option
              class="ais-Widget-option"
              value="b"
            >
              Beta
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('renders an `aria-label`', () => {
    const props = createProps({ ariaLabel: 'Sort results by' });
    const { container } = render(<Selector {...props} />);
    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe(
      'Sort results by'
    );
  });

  test('calls `onChange` with the selected value', () => {
    const props = createProps({});
    const { container } = render(<Selector {...props} />);

    fireEvent.change(container.querySelector('select')!, {
      target: { value: 'b' },
    });
    expect(props.onChange).toHaveBeenCalledWith('b');
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ hidden: true });
    const { container } = render(<Selector {...props} />);
    expect(
      (container.querySelector('.ais-Widget') as HTMLDivElement).hidden
    ).toBe(true);
  });

  test('selects the blank option when the value stops matching an option', () => {
    const options = [
      { value: '', label: '' },
      { value: 20, label: 'Twenty' },
    ];
    const { container, rerender } = render(
      <Selector {...createProps({ options, value: 20 })} />
    );
    const select = container.querySelector('select')!;
    expect(select.value).toBe('20');

    // The configured value is absent from `options`, so the connector's blank
    // option is the only one that can be selected. Passing `undefined` here
    // would make the select uncontrolled in React, which keeps displaying
    // the stale "20" after e.g. routing.
    rerender(<Selector {...createProps({ options, value: undefined })} />);
    expect(select.value).toBe('');

    rerender(<Selector {...createProps({ options, value: 7 })} />);
    expect(select.value).toBe('');

    rerender(<Selector {...createProps({ options, value: 20 })} />);
    expect(select.value).toBe('20');
  });

  test('doesn’t add a blank option when the consumer has none', () => {
    const { container, rerender } = render(
      <Selector {...createProps({ value: 'a' })} />
    );
    const select = container.querySelector('select')!;
    expect(select.value).toBe('a');

    rerender(<Selector {...createProps({ value: undefined })} />);
    // The fallback only picks an existing `''` option — it never invents one.
    expect(select.options).toHaveLength(2);
    expect(
      Array.from(select.options).filter((option) => option.value === '')
    ).toHaveLength(0);
  });
});

describe('SortBy', () => {
  const SortBy = createSortByComponent({ createElement, Fragment });

  test('renders with the `ais-SortBy` class names', () => {
    const props = {
      items: [
        { value: 'instant_search', label: 'Most relevant' },
        { value: 'instant_search_price_asc', label: 'Lowest price' },
      ],
      value: 'instant_search_price_asc',
      onChange: jest.fn(),
      classNames: { root: 'ROOT', select: 'SELECT', option: 'OPTION' },
    };
    const { container } = render(<SortBy {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy ROOT"
        >
          <select
            aria-label="Sort results by"
            class="ais-SortBy-select SELECT"
          >
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search"
            >
              Most relevant
            </option>
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search_price_asc"
            >
              Lowest price
            </option>
          </select>
        </div>
      </div>
    `);
    expect((container.querySelector('select') as HTMLSelectElement).value).toBe(
      'instant_search_price_asc'
    );
  });

  test('sets a default `aria-label`', () => {
    const { container } = render(
      <SortBy items={[{ value: 'a', label: 'A' }]} />
    );
    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe(
      'Sort results by'
    );
  });
});

describe('HitsPerPage', () => {
  const HitsPerPage = createHitsPerPageComponent({ createElement, Fragment });

  test('renders with the `ais-HitsPerPage` class names', () => {
    const props = {
      items: [
        { value: 6, label: '6 per page' },
        { value: 12, label: '12 per page' },
      ],
      currentValue: 12,
      onChange: jest.fn(),
      classNames: { root: 'ROOT', select: 'SELECT', option: 'OPTION' },
    };
    const { container } = render(<HitsPerPage {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HitsPerPage ROOT"
        >
          <select
            class="ais-HitsPerPage-select SELECT"
          >
            <option
              class="ais-HitsPerPage-option OPTION"
              value="6"
            >
              6 per page
            </option>
            <option
              class="ais-HitsPerPage-option OPTION"
              value="12"
            >
              12 per page
            </option>
          </select>
        </div>
      </div>
    `);
    expect((container.querySelector('select') as HTMLSelectElement).value).toBe(
      '12'
    );
  });

  test('calls `onChange` with a number', () => {
    const props = {
      items: [
        { value: 6, label: '6 per page' },
        { value: 12, label: '12 per page' },
      ],
      currentValue: 6,
      onChange: jest.fn(),
    };
    const { container } = render(<HitsPerPage {...props} />);

    fireEvent.change(container.querySelector('select')!, {
      target: { value: '12' },
    });
    expect(props.onChange).toHaveBeenCalledWith(12);
  });

  test('passes the blank-option sentinel through to `onChange`', () => {
    const props = {
      items: [
        { value: 6, label: '6 per page' },
        { value: '' as const, label: '' },
      ],
      currentValue: 6,
      onChange: jest.fn(),
    };
    const { container } = render(<HitsPerPage {...props} />);

    fireEvent.change(container.querySelector('select')!, {
      target: { value: '' },
    });
    expect(props.onChange).toHaveBeenCalledWith('');
  });

  test('falls back to the blank option when the current value matches no item', () => {
    const items = [
      { value: '' as const, label: '' },
      { value: 20, label: '20 per page' },
    ];
    const { container, rerender } = render(
      <HitsPerPage items={items} currentValue={20} onChange={jest.fn()} />
    );
    const select = container.querySelector('select')!;
    expect(select.value).toBe('20');

    // e.g. routing back to a configured `hitsPerPage` absent from `items`
    rerender(
      <HitsPerPage
        items={items}
        currentValue={undefined}
        onChange={jest.fn()}
      />
    );
    expect(select.value).toBe('');
  });

  test('supplies a blank option when the current value matches no item', () => {
    // The connector only inserts the blank option at init, so starting from a
    // matching value and routing to an absent one must still keep the select
    // controlled: the factory adds the blank option itself.
    const items = [
      { value: 10, label: '10 per page' },
      { value: 20, label: '20 per page' },
    ];
    const { container, rerender } = render(
      <HitsPerPage items={items} currentValue={10} onChange={jest.fn()} />
    );
    const select = container.querySelector('select')!;
    expect(select.options).toHaveLength(2);
    expect(select.value).toBe('10');

    rerender(
      <HitsPerPage
        items={items}
        currentValue={undefined}
        onChange={jest.fn()}
      />
    );
    expect(select.options).toHaveLength(3);
    expect(select.value).toBe('');
  });
});
