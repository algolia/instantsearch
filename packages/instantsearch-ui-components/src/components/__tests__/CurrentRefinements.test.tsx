/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createCurrentRefinementsComponent } from '../CurrentRefinements';

import type {
  CurrentRefinementsItem,
  CurrentRefinementsProps,
} from '../CurrentRefinements';

function createItem(
  props: Partial<CurrentRefinementsItem> = {}
): CurrentRefinementsItem {
  return {
    indexName: 'instant_search',
    attribute: 'brand',
    label: 'brand',
    refinements: [
      { type: 'facet', attribute: 'brand', value: 'Apple', label: 'Apple' },
    ],
    refine: jest.fn(),
    ...props,
  };
}

describe('CurrentRefinements', () => {
  const CurrentRefinements = createCurrentRefinementsComponent({
    createElement,
    Fragment,
  });

  function createProps(props: Partial<CurrentRefinementsProps>) {
    return {
      items: [createItem()],
      canRefine: true,
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});
    const { container } = render(<CurrentRefinements {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-CurrentRefinements"
        >
          <ul
            class="ais-CurrentRefinements-list"
          >
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                Brand
                :
                 
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Apple
                </span>
                <button
                  class="ais-CurrentRefinements-delete"
                  type="button"
                >
                  ✕
                </button>
              </span>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('renders a `noRefinement` root when there are no refinements', () => {
    const props = createProps({ items: [], canRefine: false });
    const { container } = render(<CurrentRefinements {...props} />);
    expect(container.querySelector('.ais-CurrentRefinements')).toHaveClass(
      'ais-CurrentRefinements--noRefinement'
    );
  });

  test('renders query refinements in a `q` element', () => {
    const props = createProps({
      items: [
        createItem({
          attribute: 'query',
          label: 'query',
          refinements: [
            {
              type: 'query',
              attribute: 'query',
              value: 'apple',
              label: 'apple',
            },
          ],
        }),
      ],
    });
    const { container } = render(<CurrentRefinements {...props} />);
    expect(container.querySelector('.ais-CurrentRefinements-categoryLabel'))
      .toMatchInlineSnapshot(`
      <span
        class="ais-CurrentRefinements-categoryLabel"
      >
        <q>
          apple
        </q>
      </span>
    `);
  });

  test('calls `refine` when clicking the delete button', () => {
    const props = createProps({});
    const { container } = render(<CurrentRefinements {...props} />);

    fireEvent.click(container.querySelector('.ais-CurrentRefinements-delete')!);
    expect(props.items[0].refine).toHaveBeenCalledWith(
      props.items[0].refinements[0]
    );
  });

  test('does not call `refine` on a modifier click', () => {
    const props = createProps({});
    const { container } = render(<CurrentRefinements {...props} />);

    fireEvent.click(
      container.querySelector('.ais-CurrentRefinements-delete')!,
      { ctrlKey: true }
    );
    expect(props.items[0].refine).not.toHaveBeenCalled();
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyRefinements',
      classNames: {
        root: 'ROOT',
        noRefinementRoot: 'NOROOT',
        list: 'LIST',
        item: 'ITEM',
        label: 'LABEL',
        category: 'CATEGORY',
        categoryLabel: 'CATEGORYLABEL',
        delete: 'DELETE',
      },
    });
    const { container } = render(<CurrentRefinements {...props} />);
    expect(container.querySelector('.ais-CurrentRefinements')).toHaveClass(
      'ais-CurrentRefinements',
      'ROOT',
      'MyRefinements'
    );
    expect(container.querySelector('.ais-CurrentRefinements-item')).toHaveClass(
      'ais-CurrentRefinements-item',
      'ITEM'
    );
    expect(
      container.querySelector('.ais-CurrentRefinements-category')
    ).toHaveClass('ais-CurrentRefinements-category', 'CATEGORY');
    expect(
      container.querySelector('.ais-CurrentRefinements-delete')
    ).toHaveClass('ais-CurrentRefinements-delete', 'DELETE');
  });

  test('renders a custom `itemComponent`', () => {
    const itemComponent = jest.fn(({ item, className }) => (
      <li className={className}>{item.label}</li>
    ));
    const props = createProps({ itemComponent });
    const { container } = render(<CurrentRefinements {...props} />);

    expect(container.querySelector('li')).toHaveClass(
      'ais-CurrentRefinements-item'
    );
    expect(container.querySelector('li')).toHaveTextContent('brand');
    expect(itemComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        item: props.items[0],
        className: 'ais-CurrentRefinements-item',
      }),
      {}
    );
  });

  test('renders a custom `refinementComponent`', () => {
    const refinementComponent = jest.fn(({ refinement, className }) => (
      <span className={className}>{refinement.label}</span>
    ));
    const props = createProps({ refinementComponent });
    const { container } = render(<CurrentRefinements {...props} />);

    expect(
      container.querySelector('.ais-CurrentRefinements-category')
    ).toHaveTextContent('Apple');
    expect(
      container.querySelector('.ais-CurrentRefinements-delete')
    ).toBeNull();
    expect(refinementComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        refinement: props.items[0].refinements[0],
        className: 'ais-CurrentRefinements-category',
      }),
      {}
    );
  });
});
