/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HierarchicalMenu } from '../HierarchicalMenu';

const attributes = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
];

function createMockedSearchClient() {
  const search = jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() =>
          createSingleSearchResponse({
            facets: {
              'hierarchicalCategories.lvl0': {
                'Cameras & Camcorders': 1369,
                'Video Games': 505,
                'Wearable Technology': 271,
              },
              'hierarchicalCategories.lvl1': {
                'Cameras & Camcorders > Digital Cameras': 170,
                'Cameras & Camcorders > Memory Cards': 113,
              },
            },
          })
        )
      )
    )
  );

  return createSearchClient({ search });
}

describe('HierarchicalMenu', () => {
  test('renders with props', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HierarchicalMenu attributes={attributes} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    expect(
      container.querySelectorAll('.ais-HierarchicalMenu-item')
    ).toHaveLength(3);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HierarchicalMenu"
        >
          <ul
            class="ais-HierarchicalMenu-list"
          >
            <li
              class="ais-HierarchicalMenu-item"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#"
              >
                <span
                  class="ais-HierarchicalMenu-label"
                >
                  Cameras & Camcorders
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  1369
                </span>
              </a>
            </li>
            <li
              class="ais-HierarchicalMenu-item"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#"
              >
                <span
                  class="ais-HierarchicalMenu-label"
                >
                  Video Games
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  505
                </span>
              </a>
            </li>
            <li
              class="ais-HierarchicalMenu-item"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#"
              >
                <span
                  class="ais-HierarchicalMenu-label"
                >
                  Wearable Technology
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  271
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    const firstCategory = container.querySelector(
      '.ais-HierarchicalMenu-item'
    ) as HTMLLIElement;

    userEvent.click(
      firstCategory.querySelector(
        '.ais-HierarchicalMenu-link'
      ) as HTMLAnchorElement
    );

    await waitFor(() => {
      expect(firstCategory).toHaveClass('ais-HierarchicalMenu-item--selected');

      // Once on load, once on check
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [
                ['hierarchicalCategories.lvl0:Cameras & Camcorders'],
              ],
            }),
          }),
        ])
      );
    });
  });

  test('limits the number of items to display', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HierarchicalMenu attributes={attributes} limit={1} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() =>
      expect(
        container.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(1)
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HierarchicalMenu"
        >
          <ul
            class="ais-HierarchicalMenu-list"
          >
            <li
              class="ais-HierarchicalMenu-item"
            >
              <a
                class="ais-HierarchicalMenu-link"
                href="#"
              >
                <span
                  class="ais-HierarchicalMenu-label"
                >
                  Cameras & Camcorders
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  1369
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('transforms the items', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HierarchicalMenu
          attributes={attributes}
          transformItems={(items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-item')
        ).map((item) => item.textContent)
      ).toEqual([
        'CAMERAS & CAMCORDERS1369',
        'VIDEO GAMES505',
        'WEARABLE TECHNOLOGY271',
      ]);
    });
  });

  describe('sorting', () => {
    test('sorts the items by ascending name', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu attributes={attributes} sortBy={['name:asc']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Cameras & Camcorders',
          'Video Games',
          'Wearable Technology',
        ])
      );
    });

    test('sorts the items by descending name', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu attributes={attributes} sortBy={['name:desc']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology',
          'Video Games',
          'Cameras & Camcorders',
        ])
      );
    });

    test('sorts the items by count', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu attributes={attributes} sortBy={['count']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-count')
          ).map((item) => item.textContent)
        ).toEqual(['1369', '505', '271'])
      );
    });

    test('sorts the items by refinement state', async () => {
      const searchClient = createMockedSearchClient();
      const { container, findByText } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu
            attributes={attributes}
            sortBy={['isRefined', 'name']}
            transformItems={(items) =>
              items.map((item) => ({
                ...item,
                label: `${item.label} ${item.isRefined ? 'y' : 'n'}`,
              }))
            }
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Cameras & Camcorders n',
          'Video Games n',
          'Wearable Technology n',
        ])
      );

      userEvent.click(await findByText('Video Games n'));

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Video Games y',
          'Cameras & Camcorders n',
          'Wearable Technology n',
        ]);
      });

      userEvent.click(await findByText('Wearable Technology n'));

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology y',
          'Cameras & Camcorders n',
          'Video Games n',
        ]);
      });
    });

    test('sorts the items using a sorting function', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu
            attributes={attributes}
            sortBy={(a, b) => b.name.localeCompare(a.name)}
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          Array.from(
            container.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology',
          'Video Games',
          'Cameras & Camcorders',
        ])
      );
    });
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu attributes={attributes} limit={1} showMore={true} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          container.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(1)
      );

      const showMoreButton = container.querySelector(
        '.ais-HierarchicalMenu-showMore'
      ) as HTMLButtonElement;
      expect(showMoreButton).toHaveTextContent('Show more');

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-HierarchicalMenu"
          >
            <ul
              class="ais-HierarchicalMenu-list"
            >
              <li
                class="ais-HierarchicalMenu-item"
              >
                <a
                  class="ais-HierarchicalMenu-link"
                  href="#"
                >
                  <span
                    class="ais-HierarchicalMenu-label"
                  >
                    Cameras & Camcorders
                  </span>
                  <span
                    class="ais-HierarchicalMenu-count"
                  >
                    1369
                  </span>
                </a>
              </li>
            </ul>
            <button
              class="ais-HierarchicalMenu-showMore"
            >
              Show more
            </button>
          </div>
        </div>
      `);

      userEvent.click(showMoreButton);

      await waitFor(() => {
        expect(showMoreButton).toHaveTextContent('Show less');
        expect(
          container.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(3);
      });
    });

    test('limits the number of items to reveal', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <HierarchicalMenu
            attributes={attributes}
            limit={1}
            showMore={true}
            showMoreLimit={2}
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          container.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(1)
      );

      const showMoreButton = container.querySelector(
        '.ais-HierarchicalMenu-showMore'
      ) as HTMLButtonElement;

      expect(showMoreButton).toBeInTheDocument();

      userEvent.click(showMoreButton);

      await waitFor(() =>
        expect(
          container.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(2)
      );
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HierarchicalMenu
          attributes={attributes}
          className="MyHierarchicalMenu"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHierarchicalMenu', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { getByRole } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HierarchicalMenu
          attributes={attributes}
          limit={1}
          translations={{
            showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
              return isShowingMore
                ? 'Show less categories'
                : 'Show more categories';
            },
          }}
          showMore
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    const button = getByRole('button', { name: 'Show more categories' });

    expect(button).toBeInTheDocument();

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('Show less categories');
    });
  });
});
