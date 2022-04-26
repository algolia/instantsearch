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
  test('renders with items', () => {
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

  test('forwards props to the root element', () => {
    const props = createProps({
      title: 'Some custom title',
      className: 'MyHitsPerPage',
    });
    const { container } = render(<HitsPerPage {...props} />);
    const root = container.firstChild;

    expect(root).toHaveClass('ais-HitsPerPage', 'MyHitsPerPage');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('allows custom class names', () => {
    const props = createProps({});
    const { container } = render(
      <HitsPerPage
        {...props}
        classNames={{
          root: 'ROOT',
          select: 'SELECT',
          option: 'OPTION',
        }}
      />
    );

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

  test('calls `onChange` when selecting an option', () => {
    const props = createProps();
    const { getByRole } = render(<HitsPerPage {...props} />);

    userEvent.selectOptions(getByRole('combobox'), ['10']);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(10);

    userEvent.selectOptions(getByRole('combobox'), ['20']);

    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenLastCalledWith(20);
  });
});
