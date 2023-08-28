/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { fireEvent, within } from '@testing-library/dom';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import menu from '../menu';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('menu', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        // @ts-expect-error
        menu({ attribute: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/"
      `);
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            menu: {
              brand: 'Apple',
            },
          },
        },
      });

      search.addWidgets([
        menu({
          container,
          attribute: 'brand',
          limit: 3,
          showMore: true,
        }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Menu"
  >
    <ul
      class="ais-Menu-list"
    >
      <li
        class="ais-Menu-item ais-Menu-item--selected"
      >
        <div>
          <a
            class="ais-Menu-link"
            href="#"
          >
            <span
              class="ais-Menu-label"
            >
              Apple
            </span>
            <span
              class="ais-Menu-count"
            >
              442
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <a
            class="ais-Menu-link"
            href="#"
          >
            <span
              class="ais-Menu-label"
            >
              Canon
            </span>
            <span
              class="ais-Menu-count"
            >
              287
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <a
            class="ais-Menu-link"
            href="#"
          >
            <span
              class="ais-Menu-label"
            >
              Dell
            </span>
            <span
              class="ais-Menu-count"
            >
              174
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-Menu-showMore"
    >
      Show more
    </button>
  </div>
</div>
`);

      const toggleButton = within(container).getByRole('button');

      fireEvent.click(toggleButton);

      expect(toggleButton).toMatchInlineSnapshot(`
<button
  class="ais-Menu-showMore"
>
  Show less
</button>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            menu: {
              brand: 'Apple',
            },
          },
        },
      });

      search.addWidgets([
        menu({
          container,
          attribute: 'brand',
          limit: 3,
          showMore: true,
          templates: {
            item({ label, value, count, isRefined }, { html }) {
              return html`<span
                title="${value}"
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
                >${label} - (${count})</span
              >`;
            },
            showMoreText({ isShowingMore }, { html }) {
              return html`<span
                >${isShowingMore ? 'Show less' : 'Show more'}</span
              >`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Menu"
  >
    <ul
      class="ais-Menu-list"
    >
      <li
        class="ais-Menu-item ais-Menu-item--selected"
      >
        <div>
          <span
            style="font-weight: bold;"
            title="Apple"
          >
            Apple
             - (
            442
            )
          </span>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <span
            style="font-weight: normal;"
            title="Canon"
          >
            Canon
             - (
            287
            )
          </span>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <span
            style="font-weight: normal;"
            title="Dell"
          >
            Dell
             - (
            174
            )
          </span>
        </div>
      </li>
    </ul>
    <button
      class="ais-Menu-showMore"
    >
      <span>
        Show more
      </span>
    </button>
  </div>
</div>
`);

      const toggleButton = within(container).getByRole('button');

      fireEvent.click(toggleButton);

      expect(toggleButton).toMatchInlineSnapshot(`
<button
  class="ais-Menu-showMore"
>
  <span>
    Show less
  </span>
</button>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            menu: {
              brand: 'Apple',
            },
          },
        },
      });

      search.addWidgets([
        menu({
          container,
          attribute: 'brand',
          limit: 3,
          showMore: true,
          templates: {
            item({ label, value, count, isRefined }) {
              return (
                <span
                  title={value}
                  style={{ fontWeight: isRefined ? 'bold' : 'normal' }}
                >
                  {label} - ({count})
                </span>
              );
            },
            showMoreText({ isShowingMore }) {
              return <span>{isShowingMore ? 'Show less' : 'Show more'}</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Menu"
  >
    <ul
      class="ais-Menu-list"
    >
      <li
        class="ais-Menu-item ais-Menu-item--selected"
      >
        <div>
          <span
            style="font-weight: bold;"
            title="Apple"
          >
            Apple
             - (
            442
            )
          </span>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <span
            style="font-weight: normal;"
            title="Canon"
          >
            Canon
             - (
            287
            )
          </span>
        </div>
      </li>
      <li
        class="ais-Menu-item"
      >
        <div>
          <span
            style="font-weight: normal;"
            title="Dell"
          >
            Dell
             - (
            174
            )
          </span>
        </div>
      </li>
    </ul>
    <button
      class="ais-Menu-showMore"
    >
      <span>
        Show more
      </span>
    </button>
  </div>
</div>
`);

      const toggleButton = within(container).getByRole('button');

      fireEvent.click(toggleButton);

      expect(toggleButton).toMatchInlineSnapshot(`
<button
  class="ais-Menu-showMore"
>
  <span>
    Show less
  </span>
</button>
`);
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  facets: {
                    brand: {
                      'Insignia™': 746,
                      Samsung: 633,
                      Metra: 591,
                      HP: 530,
                      Apple: 442,
                      GE: 394,
                      Sony: 350,
                      Incipio: 320,
                      KitchenAid: 318,
                      Whirlpool: 298,
                      LG: 291,
                      Canon: 287,
                      Frigidaire: 275,
                      Speck: 216,
                      OtterBox: 214,
                      Epson: 204,
                      'Dynex™': 184,
                      Dell: 174,
                      'Hamilton Beach': 173,
                      Platinum: 155,
                    },
                  },
                })
              )
            )
          );
        }),
      });
    }
  });
});
