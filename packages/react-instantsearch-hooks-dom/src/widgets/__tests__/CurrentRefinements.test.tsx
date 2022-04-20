import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useRefinementList } from 'react-instantsearch-hooks';

import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { CurrentRefinements } from '../CurrentRefinements';

import type { UseRefinementListProps } from 'react-instantsearch-hooks';

describe('CurrentRefinements', () => {
  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <VirtualRefinementList attribute="categories" />
        <CurrentRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-category')
    ).toHaveLength(3);
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
                brand
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
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                categories
                :
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Audio
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

  test('renders with a specific set of class names when there are no refinements', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <CurrentRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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

  test('clears a refinement', async () => {
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <VirtualRefinementList attribute="categories" />
        <CurrentRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-category')
    ).toHaveLength(3);
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
                brand
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
            <li
              class="ais-CurrentRefinements-item"
            >
              <span
                class="ais-CurrentRefinements-label"
              >
                categories
                :
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Audio
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

    const [button1, button2, button3] = document.querySelectorAll(
      '.ais-CurrentRefinements-delete'
    );

    userEvent.click(button3);

    await wait(0);

    expect(queryByText('Audio')).toBeNull();
    expect(queryByText('Apple')).not.toBeNull();
    expect(queryByText('Samsung')).not.toBeNull();

    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-category')
    ).toHaveLength(2);

    userEvent.click(button1);

    await wait(0);

    expect(queryByText('Audio')).toBeNull();
    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Samsung')).not.toBeNull();
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-category')
    ).toHaveLength(1);

    userEvent.click(button2);

    await wait(0);

    expect(queryByText('Audio')).toBeNull();
    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Samsung')).toBeNull();
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(0);
    expect(
      document.querySelectorAll('.ais-CurrentRefinements-category')
    ).toHaveLength(0);
  });

  test('does not trigger default event', async () => {
    const onSubmit = jest.fn();

    render(
      <form onSubmit={onSubmit}>
        <InstantSearchHooksTestWrapper
          initialUiState={{
            indexName: {
              refinementList: {
                brand: ['Apple'],
              },
            },
          }}
        >
          <VirtualRefinementList attribute="brand" />
          <CurrentRefinements />
        </InstantSearchHooksTestWrapper>
      </form>
    );

    await wait(0);

    userEvent.click(
      document.querySelector(
        '.ais-CurrentRefinements-delete'
      ) as HTMLButtonElement
    );

    await wait(0);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('does not clear when pressing a modifier key', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <CurrentRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(1);
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
                brand
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

    const button = document.querySelector(
      '.ais-CurrentRefinements-delete'
    ) as HTMLButtonElement;

    userEvent.click(button, { button: 1 });
    userEvent.click(button, { altKey: true });
    userEvent.click(button, { ctrlKey: true });
    userEvent.click(button, { metaKey: true });
    userEvent.click(button, { shiftKey: true });

    await wait(0);

    expect(
      document.querySelectorAll('.ais-CurrentRefinements-item')
    ).toHaveLength(1);
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
                brand
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

  test('inclusively restricts what refinements to display', async () => {
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <VirtualRefinementList attribute="categories" />
        <CurrentRefinements includedAttributes={['categories']} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Audio')).not.toBeNull();
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
                categories
                :
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Audio
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

  test('exclusively restricts what refinements to display', async () => {
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <VirtualRefinementList attribute="categories" />
        <CurrentRefinements excludedAttributes={['brand']} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Audio')).not.toBeNull();
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
                categories
                :
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Audio
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

  test('restricts what refinements to display with custom logic', async () => {
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <VirtualRefinementList attribute="brand" />
        <VirtualRefinementList attribute="categories" />
        <CurrentRefinements
          transformItems={(items) =>
            items.filter((item) => item.attribute !== 'brand')
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryByText('Apple')).toBeNull();
    expect(queryByText('Audio')).not.toBeNull();
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
                categories
                :
              </span>
              <span
                class="ais-CurrentRefinements-category"
              >
                <span
                  class="ais-CurrentRefinements-categoryLabel"
                >
                  Audio
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

  test('accepts custom class names', async () => {
    {
      const { container } = render(
        <InstantSearchHooksTestWrapper>
          <CurrentRefinements
            className="MyCurrentRefinements"
            classNames={{
              root: 'ROOT',
              noRefinementRoot: 'NOREFINEMENTROOT',
              list: 'LIST',
              noRefinementList: 'NOREFINEMENTLIST',
              item: 'ITEM',
              label: 'LABEL',
              category: 'CATEGORY',
              categoryLabel: 'CATEGORYLABEL',
              delete: 'DELETE',
            }}
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT ais-CurrentRefinements--noRefinement NOREFINEMENTROOT MyCurrentRefinements"
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
        <InstantSearchHooksTestWrapper
          initialUiState={{
            indexName: {
              refinementList: {
                brand: ['Apple'],
              },
            },
          }}
        >
          <VirtualRefinementList attribute="brand" />
          <CurrentRefinements
            className="MyCurrentRefinements"
            classNames={{
              root: 'ROOT',
              noRefinementRoot: 'NOREFINEMENTROOT',
              list: 'LIST',
              noRefinementList: 'NOREFINEMENTLIST',
              item: 'ITEM',
              label: 'LABEL',
              category: 'CATEGORY',
              categoryLabel: 'CATEGORYLABEL',
              delete: 'DELETE',
            }}
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-CurrentRefinements ROOT MyCurrentRefinements"
          >
            <ul
              class="ais-CurrentRefinements-list LIST"
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

  test('forwards `div` props to the root element', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <CurrentRefinements
          className="MyCurrentRefinements"
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    const root = document.querySelector('.ais-CurrentRefinements');

    expect(root).toHaveClass('MyCurrentRefinements');
    expect(root).toHaveAttribute('title', 'Some custom title');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-CurrentRefinements ais-CurrentRefinements--noRefinement MyCurrentRefinements"
          title="Some custom title"
        >
          <ul
            class="ais-CurrentRefinements-list ais-CurrentRefinements-list--noRefinement"
          />
        </div>
      </div>
    `);
  });
});

function VirtualRefinementList(props: UseRefinementListProps) {
  useRefinementList(props);

  return null;
}
