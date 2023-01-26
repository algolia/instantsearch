/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useRefinementList } from 'react-instantsearch-hooks';

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

    await waitFor(() => {
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(2);
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(3);
    });

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
    const searchClient = createSearchClient({});
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <CurrentRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

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

    await waitFor(() => {
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(2);
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(3);
    });

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

    await waitFor(() => {
      expect(queryByText('Audio')).toBeNull();
      expect(queryByText('Apple')).not.toBeNull();
      expect(queryByText('Samsung')).not.toBeNull();

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(2);
    });

    userEvent.click(button1);

    await waitFor(() => {
      expect(queryByText('Audio')).toBeNull();
      expect(queryByText('Apple')).toBeNull();
      expect(queryByText('Samsung')).not.toBeNull();

      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1);
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-category')
      ).toHaveLength(1);
    });

    userEvent.click(button2);

    await waitFor(() => {
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
  });

  test('does not trigger default event', async () => {
    const searchClient = createSearchClient({});
    const onSubmit = jest.fn();

    render(
      <form onSubmit={onSubmit}>
        <InstantSearchHooksTestWrapper
          searchClient={searchClient}
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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    userEvent.click(
      document.querySelector(
        '.ais-CurrentRefinements-delete'
      ) as HTMLButtonElement
    );

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  test('does not clear when pressing a modifier key', async () => {
    const searchClient = createSearchClient({});
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

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

    await waitFor(() =>
      expect(
        document.querySelectorAll('.ais-CurrentRefinements-item')
      ).toHaveLength(1)
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
    const searchClient = createSearchClient({});
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

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
    const searchClient = createSearchClient({});
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

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
    const searchClient = createSearchClient({});
    const { container, queryByText } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

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

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <CurrentRefinements
          className="MyCurrentRefinements"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyCurrentRefinements', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});

function VirtualRefinementList(props: UseRefinementListProps) {
  useRefinementList(props);

  return null;
}
