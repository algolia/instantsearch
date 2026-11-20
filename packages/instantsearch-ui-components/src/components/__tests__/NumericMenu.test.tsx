/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createNumericMenuComponent } from '../NumericMenu';

import type { NumericMenuProps } from '../NumericMenu';

describe('NumericMenu', () => {
  const NumericMenu = createNumericMenuComponent({ createElement, Fragment });

  function createProps(
    props: Partial<NumericMenuProps> = {}
  ): NumericMenuProps {
    return {
      attribute: 'price',
      items: [
        { value: '%7B%7D', label: 'All', isRefined: true },
        {
          value: '%7B%22end%22%3A10%7D',
          label: 'Less than 10',
          isRefined: false,
        },
      ],
      onRefine: jest.fn(),
      ...props,
    };
  }

  test('renders the default markup', () => {
    const { container } = render(<NumericMenu {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="ais-NumericMenu"
      >
        <ul
          class="ais-NumericMenu-list"
        >
          <li
            class="ais-NumericMenu-item ais-NumericMenu-item--selected"
          >
            <label
              class="ais-NumericMenu-label"
            >
              <input
                class="ais-NumericMenu-radio"
                name="price"
                type="radio"
                value="%7B%7D"
              />
              <span
                class="ais-NumericMenu-labelText"
              >
                All
              </span>
            </label>
          </li>
          <li
            class="ais-NumericMenu-item"
          >
            <label
              class="ais-NumericMenu-label"
            >
              <input
                class="ais-NumericMenu-radio"
                name="price"
                type="radio"
                value="%7B%22end%22%3A10%7D"
              />
              <span
                class="ais-NumericMenu-labelText"
              >
                Less than 10
              </span>
            </label>
          </li>
        </ul>
      </div>
    `);
  });

  test('checks the selected radio', () => {
    const { container } = render(<NumericMenu {...createProps()} />);
    const radios = container.querySelectorAll<HTMLInputElement>('input');

    expect(radios[0].checked).toBe(true);
    expect(radios[1].checked).toBe(false);
  });

  test('adds the noRefinement modifier without items', () => {
    const { container } = render(
      <NumericMenu {...createProps({ items: [] })} />
    );

    expect(container.firstChild).toHaveClass('ais-NumericMenu--noRefinement');
  });

  test('refines when a radio is selected', () => {
    const props = createProps();
    const { container } = render(<NumericMenu {...props} />);

    fireEvent.click(container.querySelectorAll('input')[1]);

    expect(props.onRefine).toHaveBeenCalledWith(props.items[1]);
  });

  test('renders a custom item component', () => {
    const { container } = render(
      <NumericMenu
        {...createProps({
          itemComponent: ({ item, className }) => (
            <li className={className}>{item.label.toUpperCase()}</li>
          ),
        })}
      />
    );

    expect(container.querySelector('.ais-NumericMenu-item')).toHaveTextContent(
      'ALL'
    );
  });

  test('forwards classNames', () => {
    const { container } = render(
      <NumericMenu
        {...createProps({
          classNames: {
            root: 'ROOT',
            list: 'LIST',
            item: 'ITEM',
            selectedItem: 'SELECTED',
            label: 'LABEL',
            radio: 'RADIO',
            labelText: 'LABELTEXT',
          },
        })}
      />
    );

    expect(container.querySelector('.ais-NumericMenu')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-NumericMenu-list')).toHaveClass(
      'LIST'
    );
    expect(container.querySelector('.ais-NumericMenu-item')).toHaveClass(
      'ITEM',
      'SELECTED'
    );
    expect(container.querySelector('.ais-NumericMenu-label')).toHaveClass(
      'LABEL'
    );
    expect(container.querySelector('.ais-NumericMenu-radio')).toHaveClass(
      'RADIO'
    );
    expect(container.querySelector('.ais-NumericMenu-labelText')).toHaveClass(
      'LABELTEXT'
    );
  });
});
