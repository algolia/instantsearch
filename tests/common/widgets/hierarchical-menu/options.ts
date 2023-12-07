import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { HierarchicalMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  return (
    commonNormalizeSnapshot(html)
      // InstantSearch.js adds an extra `<div>` around anchors
      .replace(/(<div>.*?<\/div>)/gs, (match) =>
        match.replace('<div>', '').replace('</div>', '')
      )
      // Vue InstantSearch adds extra `--lvl` modifiers classes on lists
      .replace(/ ais-HierarchicalMenu-list--lvl\d/g, '')
      // InstantSearch.js adds an extra `<div>` with the child list modifier
      // class around child lists
      .replace(
        /<div class="ais-HierarchicalMenu-list--child"><ul class="ais-HierarchicalMenu-list">.*?<\/ul><\/div>/g,
        (match) =>
          match
            .replace(
              '<ul class="ais-HierarchicalMenu-list">',
              '<ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child">'
            )
            .replace('<div class="ais-HierarchicalMenu-list--child">', '')
            .replace('</div>', '')
      )
      // InstantSearch.js formats count with `Number.toLocaleString`
      .replace(
        /<span class="ais-HierarchicalMenu-count">(.*?)<\/span>/g,
        (match) => match.replace(',', '')
      )
  );
}

export function createOptionsTests(
  setup: HierarchicalMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with props', async () => {
      const { searchClient, attributes } =
        createMockedSearchClientAndAttributes();

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: { attributes },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(3);

      expect(
        document.querySelector('.ais-HierarchicalMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
      `
      );

      userEvent.click(
        document.querySelector<HTMLAnchorElement>(
          '.ais-HierarchicalMenu-item .ais-HierarchicalMenu-link'
        )!
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector<HTMLAnchorElement>(
          '.ais-HierarchicalMenu-item .ais-HierarchicalMenu-link'
        )
      ).toHaveClass('ais-HierarchicalMenu-link--selected');

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

    test('limits the number of items to display', async () => {
      const { searchClient, attributes } =
        createMockedSearchClientAndAttributes();

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: { attributes, limit: 1 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(1);

      expect(
        document.querySelector('.ais-HierarchicalMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
      `
      );
    });

    test('takes a custom `separator`', async () => {
      const separator = ' / ';
      const { searchClient, attributes } =
        createMockedSearchClientAndAttributes({ separator });

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: { attributes, separator },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(
        document.querySelector<HTMLAnchorElement>(
          '.ais-HierarchicalMenu-item .ais-HierarchicalMenu-link'
        )!
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector<HTMLLIElement>('.ais-HierarchicalMenu-item')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <li
          class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected ais-HierarchicalMenu-item--parent"
        >
          <a
            class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected"
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
          <ul
            class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child"
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
                  Digital Cameras
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  170
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
                  Memory Cards
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  113
                </span>
              </a>
            </li>
          </ul>
        </li>
      `
      );
    });

    test('renders with a custom `rootPath`', async () => {
      const { searchClient, attributes } =
        createMockedSearchClientAndAttributes();

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          attributes,
          rootPath: 'Cameras & Camcorders',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-HierarchicalMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
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
                  Digital Cameras
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  170
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
                  Memory Cards
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  113
                </span>
              </a>
            </li>
          </ul>
        </div>
      `
      );

      userEvent.click(
        document.querySelector<HTMLAnchorElement>('.ais-HierarchicalMenu-link')!
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-HierarchicalMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-HierarchicalMenu"
        >
          <ul
            class="ais-HierarchicalMenu-list"
          >
            <li
              class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected ais-HierarchicalMenu-item--parent"
            >
              <a
                class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected"
                href="#"
              >
                <span
                  class="ais-HierarchicalMenu-label"
                >
                  Digital Cameras
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  170
                </span>
              </a>
              <ul
                class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child"
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
                      Digital SLR Cameras
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count"
                    >
                      23
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
                      Mirrorless Cameras
                    </span>
                    <span
                      class="ais-HierarchicalMenu-count"
                    >
                      37
                    </span>
                  </a>
                </li>
              </ul>
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
                  Memory Cards
                </span>
                <span
                  class="ais-HierarchicalMenu-count"
                >
                  113
                </span>
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('transforms the items', async () => {
      const { searchClient, attributes } =
        createMockedSearchClientAndAttributes();

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          attributes,
          transformItems: (items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() })),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        Array.from(
          document.querySelectorAll('.ais-HierarchicalMenu-label')
        ).map((item) => item.textContent)
      ).toEqual(['CAMERAS & CAMCORDERS', 'VIDEO GAMES', 'WEARABLE TECHNOLOGY']);
    });

    describe('parent level', () => {
      test("shows the current refined value's parent's siblings", async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {
            attributes,
            showParentLevel: true,
          },
        });

        await act(async () => {
          await wait(0);
        });

        userEvent.click(screen.getByText('Cameras & Camcorders'));

        await act(async () => {
          await wait(0);
        });

        expect(screen.getByText('Memory Cards')).not.toBeNull();

        userEvent.click(screen.getByText('Digital Cameras'));

        await act(async () => {
          await wait(0);
        });

        expect(screen.queryByText('Memory Cards')).not.toBeNull();
      });

      test("does not show the current refined value's parent's siblings", async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {
            attributes,
            showParentLevel: false,
          },
        });

        await act(async () => {
          await wait(0);
        });

        userEvent.click(screen.getByText('Cameras & Camcorders'));

        await act(async () => {
          await wait(0);
        });

        expect(screen.getByText('Memory Cards')).not.toBeNull();

        userEvent.click(screen.getByText('Digital Cameras'));

        await act(async () => {
          await wait(0);
        });

        expect(screen.queryByText('Memory Cards')).toBeNull();

        // `showParentLevel` has no impact on the root level
        expect(screen.queryByText('Video Games')).not.toBeNull();
        expect(screen.queryByText('Wearable Technology')).not.toBeNull();
      });
    });

    describe('sorting', () => {
      test('sorts the items by ascending name', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: { attributes, sortBy: ['name:asc'] },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Cameras & Camcorders',
          'Video Games',
          'Wearable Technology',
        ]);
      });

      test('sorts the items by descending name', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: { attributes, sortBy: ['name:desc'] },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology',
          'Video Games',
          'Cameras & Camcorders',
        ]);
      });

      test('sorts the items by count', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: { attributes, sortBy: ['count'] },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-count')
          ).map((item) =>
            item.textContent
              // InstantSearch.js formats count with `Number.toLocaleString`
              ?.replace(',', '')
          )
        ).toEqual(['1369', '505', '271']);
      });

      test('sorts the items by refinement state', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {
            attributes,
            sortBy: ['isRefined', 'name'],
            transformItems: (items) =>
              items.map((item) => ({
                ...item,
                label: `${item.label} ${item.isRefined ? 'y' : 'n'}`,
              })),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Cameras & Camcorders n',
          'Video Games n',
          'Wearable Technology n',
        ]);

        userEvent.click(await screen.findByText('Video Games n'));

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Video Games y',
          'Cameras & Camcorders n',
          'Wearable Technology n',
        ]);

        userEvent.click(await screen.findByText('Wearable Technology n'));

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology y',
          'Cameras & Camcorders n',
          'Video Games n',
        ]);
      });

      test('sorts the items using a sorting function', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {
            attributes,
            // @ts-ignore
            sortBy: (a, b) => b.name.localeCompare(a.name),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-HierarchicalMenu-label')
          ).map((item) => item.textContent)
        ).toEqual([
          'Wearable Technology',
          'Video Games',
          'Cameras & Camcorders',
        ]);
      });
    });

    describe('show more', () => {
      test('displays a "Show more" button', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: { attributes, limit: 1, showMore: true },
        });

        await act(async () => {
          await wait(0);
        });

        const showMoreButton = document.querySelector<HTMLButtonElement>(
          '.ais-HierarchicalMenu-showMore'
        );

        expect(showMoreButton).toHaveTextContent('Show more');
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(1);

        expect(
          document.querySelector('.ais-HierarchicalMenu')
        ).toMatchNormalizedInlineSnapshot(
          normalizeSnapshot,
          `
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
        `
        );

        userEvent.click(showMoreButton);

        await act(async () => {
          await wait(0);
        });

        expect(showMoreButton).toHaveTextContent('Show less');
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(3);
      });

      test('displays a disabled "Show more" button', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes({ levels: 1 });

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: { attributes, showMore: true },
        });

        await act(async () => {
          await wait(0);
        });

        const showMoreButton = document.querySelector<HTMLButtonElement>(
          '.ais-HierarchicalMenu-showMore'
        )!;

        expect(showMoreButton).toHaveClass(
          'ais-HierarchicalMenu-showMore--disabled'
        );

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(3);

        userEvent.click(showMoreButton);

        await act(async () => {
          await wait(0);
        });

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(3);
      });

      test('limits the number of items to reveal', async () => {
        const { searchClient, attributes } =
          createMockedSearchClientAndAttributes();

        await setup({
          instantSearchOptions: {
            indexName: 'instant_search',
            searchClient,
          },
          widgetParams: {
            attributes,
            limit: 1,
            showMore: true,
            showMoreLimit: 2,
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(1);

        const showMoreButton = document.querySelector<HTMLButtonElement>(
          '.ais-HierarchicalMenu-showMore'
        )!;

        userEvent.click(showMoreButton);

        await act(async () => {
          await wait(0);
        });

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(2);
      });
    });
  });
}

function createMockedSearchClientAndAttributes({
  separator = ' > ',
  levels = 3,
} = {}) {
  const facets = Object.fromEntries(
    Object.entries({
      'hierarchicalCategories.lvl0': {
        'Cameras & Camcorders': 1369,
        'Video Games': 505,
        'Wearable Technology': 271,
      },
      'hierarchicalCategories.lvl1': {
        [`Cameras & Camcorders${separator}Digital Cameras`]: 170,
        [`Cameras & Camcorders${separator}Memory Cards`]: 113,
      },
      'hierarchicalCategories.lvl2': {
        [`Cameras & Camcorders${separator}Digital Cameras${separator}Digital SLR Cameras`]: 23,
        [`Cameras & Camcorders${separator}Digital Cameras${separator}Mirrorless Cameras`]: 37,
        [`Cameras & Camcorders${separator}Memory Cards${separator}All Memory Cards`]: 29,
        [`Cameras & Camcorders${separator}Memory Cards${separator}Memory Card Cases`]: 75,
      },
    }).slice(0, levels)
  );

  const search = jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse({ facets }))
      )
    )
  );

  return {
    searchClient: createSearchClient({ search }),
    attributes: Object.keys(facets),
  };
}
