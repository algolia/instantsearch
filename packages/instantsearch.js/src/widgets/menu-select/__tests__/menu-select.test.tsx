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
import { h } from 'preact';

import instantsearch from '../../../index.es';
import menuSelect from '../menu-select';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('menuSelect', () => {
  describe('templates', () => {
    test('sets provided CSS classes', async () => {
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
        menuSelect({
          container,
          attribute: 'brand',
          limit: 0,
          cssClasses: {
            noRefinementRoot: 'noRefinementRoot',
            root: 'root',
            option: 'option',
            select: 'select',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class="ais-MenuSelect root ais-MenuSelect--noRefinement noRefinementRoot"
        >
          <select
            class="ais-MenuSelect-select select"
          >
            <option
              class="ais-MenuSelect-option option"
              value=""
            >
              See all
            </option>
          </select>
        </div>
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
        menuSelect({
          container,
          attribute: 'brand',
          limit: 3,
          templates: {
            item({ label, value, count, isRefined }, { html }) {
              return html`<span
                title="${value}"
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
                >${label} - (${count})</span
              >`;
            },
            defaultOption(_, { html }) {
              return html`<span>See all</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-MenuSelect"
          >
            <select
              class="ais-MenuSelect-select"
            >
              <option
                class="ais-MenuSelect-option"
                value=""
              >
                <span>
                  See all
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Apple"
              >
                <span
                  style="font-weight: bold;"
                  title="Apple"
                >
                  Apple
                   - (
                  442
                  )
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Canon"
              >
                <span
                  style="font-weight: normal;"
                  title="Canon"
                >
                  Canon
                   - (
                  287
                  )
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Dell"
              >
                <span
                  style="font-weight: normal;"
                  title="Dell"
                >
                  Dell
                   - (
                  174
                  )
                </span>
              </option>
            </select>
          </div>
        </div>
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
        menuSelect({
          container,
          attribute: 'brand',
          limit: 3,
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
            defaultOption() {
              return <span>See all</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-MenuSelect"
          >
            <select
              class="ais-MenuSelect-select"
            >
              <option
                class="ais-MenuSelect-option"
                value=""
              >
                <span>
                  See all
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Apple"
              >
                <span
                  style="font-weight: bold;"
                  title="Apple"
                >
                  Apple
                   - (
                  442
                  )
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Canon"
              >
                <span
                  style="font-weight: normal;"
                  title="Canon"
                >
                  Canon
                   - (
                  287
                  )
                </span>
              </option>
              <option
                class="ais-MenuSelect-option"
                value="Dell"
              >
                <span
                  style="font-weight: normal;"
                  title="Dell"
                >
                  Dell
                   - (
                  174
                  )
                </span>
              </option>
            </select>
          </div>
        </div>
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
