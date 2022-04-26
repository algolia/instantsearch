import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { HierarchicalMenu } from '../HierarchicalMenu';

const attributes = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
];
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

describe('HierarchicalMenu', () => {
  test('renders with items', async () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <HierarchicalMenu attributes={attributes} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

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
                  class="ais-HierarchicalMenu-labelText"
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
                  class="ais-HierarchicalMenu-labelText"
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
                  class="ais-HierarchicalMenu-labelText"
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

    await wait(0);

    expect(firstCategory).toHaveClass('ais-HierarchicalMenu-item--selected');

    // Once on load, once on check
    expect(client.search).toHaveBeenCalledTimes(2);
    expect(client.search).toHaveBeenLastCalledWith(
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
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <HierarchicalMenu attributes={attributes} limit={1} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      container.querySelectorAll('.ais-HierarchicalMenu-item')
    ).toHaveLength(1);
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
                  class="ais-HierarchicalMenu-labelText"
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
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <HierarchicalMenu
          attributes={attributes}
          transformItems={(items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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
                  class="ais-HierarchicalMenu-labelText"
                >
                  CAMERAS & CAMCORDERS
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
                  class="ais-HierarchicalMenu-labelText"
                >
                  VIDEO GAMES
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
                  class="ais-HierarchicalMenu-labelText"
                >
                  WEARABLE TECHNOLOGY
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
  });

  test('forwards `div` props to the root element', async () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <HierarchicalMenu
          attributes={attributes}
          className="MyHierarchicalMenu"
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    const rootElement = container.querySelector(
      '.ais-HierarchicalMenu'
    ) as HTMLDivElement;

    expect(rootElement).toHaveClass('MyHierarchicalMenu');
    expect(rootElement).toHaveAttribute('title', 'Some custom title');
  });

  describe('sorting', () => {
    test('sorts the items by ascending name', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu attributes={attributes} sortBy={['name:asc']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual(['Cameras & Camcorders', 'Video Games', 'Wearable Technology']);
    });

    test('sorts the items by descending name', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu attributes={attributes} sortBy={['name:desc']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual(['Wearable Technology', 'Video Games', 'Cameras & Camcorders']);
    });

    test('sorts the items by count', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu attributes={attributes} sortBy={['count']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-count')
        ).map((item) => item.textContent)
      ).toEqual(['1369', '505', '271']);
    });

    test('sorts the items by refinement state', async () => {
      const client = createSearchClient({ search });
      const { container, findByText } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
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

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual([
        'Cameras & Camcorders n',
        'Video Games n',
        'Wearable Technology n',
      ]);

      userEvent.click(await findByText('Video Games n'));

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual([
        'Video Games y',
        'Cameras & Camcorders n',
        'Wearable Technology n',
      ]);

      userEvent.click(await findByText('Wearable Technology n'));

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual([
        'Wearable Technology y',
        'Cameras & Camcorders n',
        'Video Games n',
      ]);
    });

    test('sorts the items using a sorting function', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu
            attributes={attributes}
            sortBy={(a, b) => b.name.localeCompare(a.name)}
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(
          container.querySelectorAll('.ais-HierarchicalMenu-labelText')
        ).map((item) => item.textContent)
      ).toEqual(['Wearable Technology', 'Video Games', 'Cameras & Camcorders']);
    });
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu attributes={attributes} limit={1} showMore={true} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      const showMoreButton = container.querySelector(
        '.ais-HierarchicalMenu-showMore'
      ) as HTMLButtonElement;
      expect(showMoreButton).toHaveTextContent('Show more');

      expect(
        container.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(1);
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
                    class="ais-HierarchicalMenu-labelText"
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

      await wait(0);

      expect(showMoreButton).toHaveTextContent('Show less');
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
                    class="ais-HierarchicalMenu-labelText"
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
                    class="ais-HierarchicalMenu-labelText"
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
                    class="ais-HierarchicalMenu-labelText"
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
            <button
              class="ais-HierarchicalMenu-showMore"
            >
              Show less
            </button>
          </div>
        </div>
      `);
    });

    test('limits the number of items to reveal', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <HierarchicalMenu
            attributes={attributes}
            limit={1}
            showMore={true}
            showMoreLimit={2}
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      const showMoreButton = container.querySelector(
        '.ais-HierarchicalMenu-showMore'
      ) as HTMLButtonElement;

      expect(
        container.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(1);
      expect(showMoreButton).toBeInTheDocument();
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
                    class="ais-HierarchicalMenu-labelText"
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

      await wait(0);

      expect(
        container.querySelectorAll('.ais-HierarchicalMenu-item')
      ).toHaveLength(2);
      expect(showMoreButton).toBeInTheDocument();
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
                    class="ais-HierarchicalMenu-labelText"
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
                    class="ais-HierarchicalMenu-labelText"
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
            </ul>
            <button
              class="ais-HierarchicalMenu-showMore"
            >
              Show less
            </button>
          </div>
        </div>
      `);
    });
  });
});
