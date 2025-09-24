/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CurrentRefinements } from '../CurrentRefinements';

import type { CurrentRefinementsProps } from '../CurrentRefinements';

describe('CurrentRefinements', () => {
  test('renders with default props', () => {
    const { container } = render(<CurrentRefinements />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-CurrentRefinements ais-CurrentRefinements--noRefinement"
        >
          <ul
            class="ais-CurrentRefinements-list ais-CurrentRefinements-list--noRefinement"
          />
        </div>
      </div>
    `);
  });

  test('renders with clickable refinements', () => {
    const refine = jest.fn();

    const { container } = render(
      <CurrentRefinements
        items={[
          {
            label: 'Brand',
            refine,
            refinements: [
              {
                label: 'Apple',
                attribute: 'brand',
                type: 'facet',
                value: 'Apple',
              },
              {
                label: 'Samsung',
                attribute: 'brand',
                type: 'facet',
                value: 'Samsung',
              },
            ],
          },
        ]}
        hasRefinements={true}
      />
    );

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
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Samsung
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

    const [button1, button2] = document.querySelectorAll(
      '.ais-CurrentRefinements-delete'
    );

    userEvent.click(button1);

    expect(refine).toHaveBeenLastCalledWith({
      attribute: 'brand',
      label: 'Apple',
      type: 'facet',
      value: 'Apple',
    });

    userEvent.click(button2);

    expect(refine).toHaveBeenLastCalledWith({
      attribute: 'brand',
      label: 'Samsung',
      type: 'facet',
      value: 'Samsung',
    });
    expect(refine).toHaveBeenCalledTimes(2);
  });

  test('accepts custom class names', () => {
    const props: Partial<CurrentRefinementsProps> = {
      className: 'MyCustomCurrentRefinements',
      classNames: {
        root: 'ROOT',
        noRefinementRoot: 'NOREFINEMENTROOT',
        list: 'LIST',
        noRefinementList: 'NOREFINEMENTLIST',
        item: 'ITEM',
        label: 'LABEL',
        category: 'CATEGORY',
        categoryLabel: 'CATEGORYLABEL',
        delete: 'DELETE',
      },
    };

    {
      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT ais-CurrentRefinements--noRefinement NOREFINEMENTROOT MyCustomCurrentRefinements"
          >
            <ul
              class="ais-CurrentRefinements-list LIST ais-CurrentRefinements-list--noRefinement NOREFINEMENTLIST"
            />
          </div>
        </div>
      `);
    }

    {
      const { container } = render(
        <CurrentRefinements
          items={[
            {
              label: 'brand',
              refine: jest.fn(),
              refinements: [
                {
                  attribute: 'brand',
                  label: 'Apple',
                  value: 'Apple',
                  type: 'disjunctive',
                },
              ],
            },
          ]}
          {...props}
        />
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT ais-CurrentRefinements--noRefinement NOREFINEMENTROOT MyCustomCurrentRefinements"
          >
            <ul
              class="ais-CurrentRefinements-list LIST ais-CurrentRefinements-list--noRefinement NOREFINEMENTLIST"
            >
              <li
                class="ais-CurrentRefinements-item ITEM"
              >
                <span
                  class="ais-CurrentRefinements-label LABEL"
                >
                  Brand
                  :

                </span>
                <span
                  class="ais-CurrentRefinements-category CATEGORY"
                >
                  <span
                    class="ais-CurrentRefinements-categoryLabel CATEGORYLABEL"
                  >
                    Apple
                  </span>
                  <button
                    class="ais-CurrentRefinements-delete DELETE"
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
    }
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <CurrentRefinements title="Some custom title" />
    );

    expect(container.querySelector('.ais-CurrentRefinements')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
