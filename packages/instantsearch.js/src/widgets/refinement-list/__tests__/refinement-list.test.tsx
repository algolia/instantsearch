/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSFFVResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { fireEvent, within } from '@testing-library/dom';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import refinementList from '../refinement-list';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('refinementList', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
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
            <svg
              aria-hidden="true"
              class="ais-SearchBox-submitIcon"
              height="10"
              viewBox="0 0 40 40"
              width="10"
            >
              <path
                d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
              />
            </svg>
          </button>
          <button
            class="ais-SearchBox-reset"
            hidden=""
            title="Clear the search query."
            type="reset"
          >
            <svg
              aria-hidden="true"
              class="ais-SearchBox-resetIcon"
              height="10"
              viewBox="0 0 20 20"
              width="10"
            >
              <path
                d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
              />
            </svg>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <svg
              aria-hidden="true"
              class="ais-SearchBox-loadingIcon"
              height="16"
              stroke="#444"
              viewBox="0 0 38 38"
              width="16"
            >
              <g
                fill="none"
                fillRule="evenodd"
              >
                <g
                  strokeWidth="2"
                  transform="translate(1 1)"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="18"
                    strokeOpacity=".5"
                  />
                  <path
                    d="M36 18c0-9.94-8.06-18-18-18"
                  >
                    <animatetransform
                      attributeName="transform"
                      dur="1s"
                      from="0 18 18"
                      repeatCount="indefinite"
                      to="360 18 18"
                      type="rotate"
                    />
                  </path>
                </g>
              </g>
            </svg>
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
          <label
            class="ais-RefinementList-label"
          >
            <input
              checked=""
              class="ais-RefinementList-checkbox"
              type="checkbox"
              value="Apple"
            />
            <span
              class="ais-RefinementList-labelText"
            >
              Apple
            </span>
            <span
              class="ais-RefinementList-count"
            >
              746
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-RefinementList-item"
      >
        <div>
          <label
            class="ais-RefinementList-label"
          >
            <input
              class="ais-RefinementList-checkbox"
              type="checkbox"
              value="Samsung"
            />
            <span
              class="ais-RefinementList-labelText"
            >
              Samsung
            </span>
            <span
              class="ais-RefinementList-count"
            >
              633
            </span>
          </label>
        </div>
      </li>
    </ul>
    <button
      class="ais-RefinementList-showMore"
    >
      Show more
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
            <svg
              aria-hidden="true"
              class="ais-SearchBox-submitIcon"
              height="10"
              viewBox="0 0 40 40"
              width="10"
            >
              <path
                d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
              />
            </svg>
          </button>
          <button
            class="ais-SearchBox-reset"
            title="Clear the search query."
            type="reset"
          >
            <svg
              aria-hidden="true"
              class="ais-SearchBox-resetIcon"
              height="10"
              viewBox="0 0 20 20"
              width="10"
            >
              <path
                d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
              />
            </svg>
          </button>
          <span
            class="ais-SearchBox-loadingIndicator"
            hidden=""
          >
            <svg
              aria-hidden="true"
              class="ais-SearchBox-loadingIcon"
              height="16"
              stroke="#444"
              viewBox="0 0 38 38"
              width="16"
            >
              <g
                fill="none"
                fillRule="evenodd"
              >
                <g
                  strokeWidth="2"
                  transform="translate(1 1)"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="18"
                    strokeOpacity=".5"
                  />
                  <path
                    d="M36 18c0-9.94-8.06-18-18-18"
                  >
                    <animatetransform
                      attributeName="transform"
                      dur="1s"
                      from="0 18 18"
                      repeatCount="indefinite"
                      to="360 18 18"
                      type="rotate"
                    />
                  </path>
                </g>
              </g>
            </svg>
          </span>
        </form>
      </div>
    </div>
    <div
      class="ais-RefinementList-noResults"
    >
      No results
    </div>
  </div>
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
