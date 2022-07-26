/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import refinementList from '../refinement-list';
import {
  createMultiSearchResponse,
  createSFFVResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import { fireEvent, within } from '@testing-library/dom';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('refinementList', () => {
  describe('templates', () => {
    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      });

      search.addWidgets([
        refinementList({
          container,
          attribute: 'brand',
          showMore: true,
          searchable: true,
          limit: 2,
          templates: {
            item({ url, label, count, isRefined }, { html }) {
              return html`<a
                href="${url}"
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
              >
                <span>${label} (${count})</span>
              </a>`;
            },
            showMoreText({ isShowingMore }, { html }) {
              return html`<span
                >${isShowingMore ? 'Show less' : 'Show more'}</span
              >`;
            },
            searchableNoResults(_, { html }) {
              return html`<span>No results</span>`;
            },
            searchableSubmit(_, { html }) {
              return html`<span>Submit</span>`;
            },
            searchableReset(_, { html }) {
              return html`<span>Reset</span>`;
            },
            searchableLoadingIndicator(_, { html }) {
              return html`<span>Loading</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RefinementList"
  >
    <div
      class="ais-RefinementList-searchBox"
    >
      <div
        class="ais-SearchBox"
      >
        <form
          action=""
          class="ais-SearchBox-form"
          novalidate=""
          role="search"
        >
          <input
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            class="ais-SearchBox-input"
            maxlength="512"
            placeholder="Search..."
            spellcheck="false"
            type="search"
          />
          <button
            class="ais-SearchBox-submit"
            title="Submit the search query."
            type="submit"
          >
            <span>
              Submit
            </span>
          </button>
          <button
            class="ais-SearchBox-reset"
            hidden=""
            title="Clear the search query."
            type="reset"
          >
            <span>
              Reset
            </span>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <span>
              Loading
            </span>
          </span>
        </form>
      </div>
    </div>
    <ul
      class="ais-RefinementList-list"
    >
      <li
        class="ais-RefinementList-item ais-RefinementList-item--selected"
      >
        <div>
          <a
            href="#"
            style="font-weight: bold;"
          >
            <span>
              Apple
               (
              746
              )
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RefinementList-item"
      >
        <div>
          <a
            href="#"
            style="font-weight: normal;"
          >
            <span>
              Samsung
               (
              633
              )
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-RefinementList-showMore"
    >
      <span>
        Show more
      </span>
    </button>
  </div>
</div>
`);

      const showMoreButton = container.querySelector(
        '.ais-RefinementList-showMore'
      )!;

      fireEvent.click(showMoreButton);

      expect(showMoreButton).toHaveTextContent('Show less');

      fireEvent.input(within(container).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RefinementList ais-RefinementList--noRefinement"
  >
    <div
      class="ais-RefinementList-searchBox"
    >
      <div
        class="ais-SearchBox"
      >
        <form
          action=""
          class="ais-SearchBox-form"
          novalidate=""
          role="search"
        >
          <input
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            class="ais-SearchBox-input"
            maxlength="512"
            placeholder="Search..."
            spellcheck="false"
            type="search"
          />
          <button
            class="ais-SearchBox-submit"
            title="Submit the search query."
            type="submit"
          >
            <span>
              Submit
            </span>
          </button>
          <button
            class="ais-SearchBox-reset"
            title="Clear the search query."
            type="reset"
          >
            <span>
              Reset
            </span>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <span>
              Loading
            </span>
          </span>
        </form>
      </div>
    </div>
    <div
      class="ais-RefinementList-noResults"
    >
      <span>
        No results
      </span>
    </div>
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
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      });

      search.addWidgets([
        refinementList({
          container,
          attribute: 'brand',
          showMore: true,
          searchable: true,
          limit: 2,
          templates: {
            item({ url, label, count, isRefined }) {
              return (
                <a
                  href={url}
                  style={{ fontWeight: isRefined ? 'bold' : 'normal' }}
                >
                  <span>
                    {label} ({count})
                  </span>
                </a>
              );
            },
            showMoreText({ isShowingMore }) {
              return <span>{isShowingMore ? 'Show less' : 'Show more'}</span>;
            },
            searchableNoResults() {
              return <span>No results</span>;
            },
            searchableSubmit() {
              return <span>Submit</span>;
            },
            searchableReset() {
              return <span>Reset</span>;
            },
            searchableLoadingIndicator() {
              return <span>Loading</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RefinementList"
  >
    <div
      class="ais-RefinementList-searchBox"
    >
      <div
        class="ais-SearchBox"
      >
        <form
          action=""
          class="ais-SearchBox-form"
          novalidate=""
          role="search"
        >
          <input
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            class="ais-SearchBox-input"
            maxlength="512"
            placeholder="Search..."
            spellcheck="false"
            type="search"
          />
          <button
            class="ais-SearchBox-submit"
            title="Submit the search query."
            type="submit"
          >
            <span>
              Submit
            </span>
          </button>
          <button
            class="ais-SearchBox-reset"
            hidden=""
            title="Clear the search query."
            type="reset"
          >
            <span>
              Reset
            </span>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <span>
              Loading
            </span>
          </span>
        </form>
      </div>
    </div>
    <ul
      class="ais-RefinementList-list"
    >
      <li
        class="ais-RefinementList-item ais-RefinementList-item--selected"
      >
        <div>
          <a
            href="#"
            style="font-weight: bold;"
          >
            <span>
              Apple
               (
              746
              )
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RefinementList-item"
      >
        <div>
          <a
            href="#"
            style="font-weight: normal;"
          >
            <span>
              Samsung
               (
              633
              )
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-RefinementList-showMore"
    >
      <span>
        Show more
      </span>
    </button>
  </div>
</div>
`);

      const showMoreButton = container.querySelector(
        '.ais-RefinementList-showMore'
      )!;

      fireEvent.click(showMoreButton);

      expect(showMoreButton).toHaveTextContent('Show less');

      fireEvent.input(within(container).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RefinementList ais-RefinementList--noRefinement"
  >
    <div
      class="ais-RefinementList-searchBox"
    >
      <div
        class="ais-SearchBox"
      >
        <form
          action=""
          class="ais-SearchBox-form"
          novalidate=""
          role="search"
        >
          <input
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            class="ais-SearchBox-input"
            maxlength="512"
            placeholder="Search..."
            spellcheck="false"
            type="search"
          />
          <button
            class="ais-SearchBox-submit"
            title="Submit the search query."
            type="submit"
          >
            <span>
              Submit
            </span>
          </button>
          <button
            class="ais-SearchBox-reset"
            title="Clear the search query."
            type="reset"
          >
            <span>
              Reset
            </span>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <span>
              Loading
            </span>
          </span>
        </form>
      </div>
    </div>
    <div
      class="ais-RefinementList-noResults"
    >
      <span>
        No results
      </span>
    </div>
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
                      Apple: 746,
                      Samsung: 633,
                      Metra: 591,
                    },
                  },
                })
              )
            )
          );
        }),
        searchForFacetValues: jest.fn((requests) => {
          return Promise.resolve([
            createSFFVResponse({
              facetHits:
                requests[0].params.facetQuery === 'query with no results'
                  ? []
                  : [
                      {
                        value: 'Apple',
                        highlighted: '__ais-highlight__App__/ais-highlight__le',
                        count: 442,
                      },
                      {
                        value: 'Alpine',
                        highlighted:
                          '__ais-highlight__Alp__/ais-highlight__ine',
                        count: 30,
                      },
                      {
                        value: 'APC',
                        highlighted: '__ais-highlight__AP__/ais-highlight__C',
                        count: 24,
                      },
                      {
                        value: 'Amped Wireless',
                        highlighted:
                          '__ais-highlight__Amp__/ais-highlight__ed Wireless',
                        count: 4,
                      },
                      {
                        value: "Applebee's",
                        highlighted:
                          "__ais-highlight__App__/ais-highlight__lebee's",
                        count: 2,
                      },
                      {
                        value: 'Amplicom',
                        highlighted:
                          '__ais-highlight__Amp__/ais-highlight__licom',
                        count: 1,
                      },
                      {
                        value: 'Apollo Enclosures',
                        highlighted:
                          '__ais-highlight__Ap__/ais-highlight__ollo Enclosures',
                        count: 1,
                      },
                      {
                        value: 'Apple®',
                        highlighted:
                          '__ais-highlight__App__/ais-highlight__le®',
                        count: 1,
                      },
                      {
                        value: 'Applica',
                        highlighted:
                          '__ais-highlight__App__/ais-highlight__lica',
                        count: 1,
                      },
                      {
                        value: 'Apricorn',
                        highlighted:
                          '__ais-highlight__Ap__/ais-highlight__ricorn',
                        count: 1,
                      },
                    ],
            }),
          ]);
        }),
      });
    }
  });
});
