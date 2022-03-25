import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CurrentRefinements } from '../CurrentRefinements';

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
    const onRemove = jest.fn();

    const { container } = render(
      <CurrentRefinements
        items={[
          {
            label: 'Brand',
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
        onRemove={onRemove}
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

    expect(onRemove).toHaveBeenLastCalledWith({
      attribute: 'brand',
      label: 'Apple',
      type: 'facet',
      value: 'Apple',
    });

    userEvent.click(button2);

    expect(onRemove).toHaveBeenLastCalledWith({
      attribute: 'brand',
      label: 'Samsung',
      type: 'facet',
      value: 'Samsung',
    });
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  test('forwards a custom class name to the root element', () => {
    const { container } = render(
      <CurrentRefinements className="MyCurrentRefinements" />
    );

    expect(document.querySelector('.ais-CurrentRefinements')).toHaveClass(
      'MyCurrentRefinements'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-CurrentRefinements ais-CurrentRefinements--noRefinement MyCurrentRefinements"
        >
          <ul
            class="ais-CurrentRefinements-list ais-CurrentRefinements-list--noRefinement"
          />
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <CurrentRefinements title="Some custom title" />
    );

    expect(document.querySelector('.ais-CurrentRefinements')).toHaveAttribute(
      'title',
      'Some custom title'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-CurrentRefinements ais-CurrentRefinements--noRefinement"
          title="Some custom title"
        >
          <ul
            class="ais-CurrentRefinements-list ais-CurrentRefinements-list--noRefinement"
          />
        </div>
      </div>
    `);
  });

  test('allows custom class names', () => {
    {
      const { container } = render(
        <CurrentRefinements
          classNames={{
            root: 'ROOT',
            rootNoRefinement: 'ROOTNOREFINEMENT',
            list: 'LIST',
            listNoRefinement: 'LISTNOREFINEMENT',
            item: 'ITEM',
            label: 'LABEL',
            category: 'CATEGORY',
            categoryLabel: 'CATEGORYLABEL',
            delete: 'DELETE',
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT ais-CurrentRefinements--noRefinement ROOTNOREFINEMENT"
          >
            <ul
              class="ais-CurrentRefinements-list LIST ais-CurrentRefinements-list--noRefinement LISTNOREFINEMENT"
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
          classNames={{
            root: 'ROOT',
            rootNoRefinement: 'ROOTNOREFINEMENT',
            list: 'LIST',
            listNoRefinement: 'LISTNOREFINEMENT',
            item: 'ITEM',
            label: 'LABEL',
            category: 'CATEGORY',
            categoryLabel: 'CATEGORYLABEL',
            delete: 'DELETE',
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT ais-CurrentRefinements--noRefinement ROOTNOREFINEMENT"
          >
            <ul
              class="ais-CurrentRefinements-list LIST ais-CurrentRefinements-list--noRefinement LISTNOREFINEMENT"
            >
              <li
                class="ais-CurrentRefinements-item ITEM"
              >
                <span
                  class="ais-CurrentRefinements-label LABEL"
                >
                  brand
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
});
