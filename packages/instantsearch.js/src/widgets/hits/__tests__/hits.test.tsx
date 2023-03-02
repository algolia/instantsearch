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
import { within, fireEvent } from '@testing-library/dom';
import { Fragment, h } from 'preact';

import instantsearch from '../../../index.es';
import searchBox from '../../search-box/search-box';
import hits from '../hits';

import type { SearchResponse } from '../../../../src/types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('hits', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({ container }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();
        // prevent warning from insights view event because insightsClient isn't yet loaded
        // @ts-ignore
        search.helper!.state.userToken = 'userToken';

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits"
    >
      <ol
        class="ais-Hits-list"
      >
        <li
          class="ais-Hits-item"
        >
          {
  "objectID": "1",
  "name": "Apple iPhone smartphone",
  "description": "A smartphone by Apple.",
  "_highlightResult": {
    "name": {
      "value": "Apple iPhone &lt;mark&gt;smartphone&lt;/mark&gt;",
      "matchLevel": "full",
      "matchedWords": [
        "smartphone"
      ]
    }
  },
  "_snippetResult": {
    "name": {
      "value": "Apple iPhone &lt;mark&gt;smartphone&lt;/mark&gt;",
      "matchLevel": "full"
    },
    "description": {
      "value": "A &lt;mark&gt;smartphone&lt;/mark&gt; by Apple.",
      "matchLevel": "full"
    }
  },
  "__position": 1
}
        </li>
        <li
          class="ais-Hits-item"
        >
          {
  "objectID": "2",
  "name": "Samsung Galaxy smartphone",
  "description": "A smartphone by Samsung.",
  "_highlightResult": {
    "name": {
      "value": "Samsung Galaxy &lt;mark&gt;smartphone&lt;/mark&gt;",
      "matchLevel": "full",
      "matchedWords": [
        "smartphone"
      ]
    }
  },
  "_snippetResult": {
    "name": {
      "value": "Samsung Galaxy &lt;mark&gt;smartphone&lt;/mark&gt;",
      "matchLevel": "full"
    },
    "description": {
      "value": "A &lt;mark&gt;smartphone&lt;/mark&gt; by Samsung.",
      "matchLevel": "full"
    }
  },
  "__position": 2
}
        </li>
      </ol>
    </div>
  </div>
</div>
`);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits ais-Hits--empty"
    >
      No results
    </div>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({
          container,
          templates: {
            item(hit, { html, components }) {
              return html`
                <h2>${components.Highlight({ hit, attribute: 'name' })}</h2>
                <h3>
                  ${components.ReverseHighlight({ hit, attribute: 'name' })}
                </h3>
                <p>${components.Snippet({ hit, attribute: 'description' })}</p>
                <p>
                  ${components.ReverseSnippet({
                    hit,
                    attribute: 'description',
                  })}
                </p>
              `;
            },
            empty({ query }, { html }) {
              return html`<p>No results for <q>${query}</q></p>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits"
    >
      <ol
        class="ais-Hits-list"
      >
        <li
          class="ais-Hits-item"
        >
          <h2>
            <span
              class="ais-Highlight"
            >
              <span
                class="ais-Highlight-nonHighlighted"
              >
                Apple iPhone 
              </span>
              <mark
                class="ais-Highlight-highlighted"
              >
                smartphone
              </mark>
            </span>
          </h2>
          <h3>
            <span
              class="ais-ReverseHighlight"
            >
              <mark
                class="ais-ReverseHighlight-highlighted"
              >
                Apple iPhone 
              </mark>
              <span
                class="ais-ReverseHighlight-nonHighlighted"
              >
                smartphone
              </span>
            </span>
          </h3>
          <p>
            <span
              class="ais-Snippet"
            >
              <span
                class="ais-Snippet-nonHighlighted"
              >
                A 
              </span>
              <mark
                class="ais-Snippet-highlighted"
              >
                smartphone
              </mark>
              <span
                class="ais-Snippet-nonHighlighted"
              >
                 by Apple.
              </span>
            </span>
          </p>
          <p>
            <span
              class="ais-ReverseSnippet"
            >
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                A 
              </mark>
              <span
                class="ais-ReverseSnippet-nonHighlighted"
              >
                smartphone
              </span>
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                 by Apple.
              </mark>
            </span>
          </p>
        </li>
        <li
          class="ais-Hits-item"
        >
          <h2>
            <span
              class="ais-Highlight"
            >
              <span
                class="ais-Highlight-nonHighlighted"
              >
                Samsung Galaxy 
              </span>
              <mark
                class="ais-Highlight-highlighted"
              >
                smartphone
              </mark>
            </span>
          </h2>
          <h3>
            <span
              class="ais-ReverseHighlight"
            >
              <mark
                class="ais-ReverseHighlight-highlighted"
              >
                Samsung Galaxy 
              </mark>
              <span
                class="ais-ReverseHighlight-nonHighlighted"
              >
                smartphone
              </span>
            </span>
          </h3>
          <p>
            <span
              class="ais-Snippet"
            >
              <span
                class="ais-Snippet-nonHighlighted"
              >
                A 
              </span>
              <mark
                class="ais-Snippet-highlighted"
              >
                smartphone
              </mark>
              <span
                class="ais-Snippet-nonHighlighted"
              >
                 by Samsung.
              </span>
            </span>
          </p>
          <p>
            <span
              class="ais-ReverseSnippet"
            >
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                A 
              </mark>
              <span
                class="ais-ReverseSnippet-nonHighlighted"
              >
                smartphone
              </span>
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                 by Samsung.
              </mark>
            </span>
          </p>
        </li>
      </ol>
    </div>
  </div>
</div>
`);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits ais-Hits--empty"
    >
      <p>
        No results for 
        <q>
          query with no results
        </q>
      </p>
    </div>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({
          container,
          templates: {
            item(hit, { components }) {
              return (
                <Fragment>
                  <h2>
                    <components.Highlight hit={hit} attribute="name" />
                  </h2>
                  <h3>
                    <components.ReverseHighlight hit={hit} attribute="name" />
                  </h3>
                  <p>
                    <components.Snippet hit={hit} attribute="description" />
                  </p>
                  <p>
                    <components.ReverseSnippet
                      hit={hit}
                      attribute="description"
                    />
                  </p>
                </Fragment>
              );
            },
            empty({ query }) {
              return (
                <p>
                  No results for <q>{query}</q>
                </p>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits"
    >
      <ol
        class="ais-Hits-list"
      >
        <li
          class="ais-Hits-item"
        >
          <h2>
            <span
              class="ais-Highlight"
            >
              <span
                class="ais-Highlight-nonHighlighted"
              >
                Apple iPhone 
              </span>
              <mark
                class="ais-Highlight-highlighted"
              >
                smartphone
              </mark>
            </span>
          </h2>
          <h3>
            <span
              class="ais-ReverseHighlight"
            >
              <mark
                class="ais-ReverseHighlight-highlighted"
              >
                Apple iPhone 
              </mark>
              <span
                class="ais-ReverseHighlight-nonHighlighted"
              >
                smartphone
              </span>
            </span>
          </h3>
          <p>
            <span
              class="ais-Snippet"
            >
              <span
                class="ais-Snippet-nonHighlighted"
              >
                A 
              </span>
              <mark
                class="ais-Snippet-highlighted"
              >
                smartphone
              </mark>
              <span
                class="ais-Snippet-nonHighlighted"
              >
                 by Apple.
              </span>
            </span>
          </p>
          <p>
            <span
              class="ais-ReverseSnippet"
            >
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                A 
              </mark>
              <span
                class="ais-ReverseSnippet-nonHighlighted"
              >
                smartphone
              </span>
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                 by Apple.
              </mark>
            </span>
          </p>
        </li>
        <li
          class="ais-Hits-item"
        >
          <h2>
            <span
              class="ais-Highlight"
            >
              <span
                class="ais-Highlight-nonHighlighted"
              >
                Samsung Galaxy 
              </span>
              <mark
                class="ais-Highlight-highlighted"
              >
                smartphone
              </mark>
            </span>
          </h2>
          <h3>
            <span
              class="ais-ReverseHighlight"
            >
              <mark
                class="ais-ReverseHighlight-highlighted"
              >
                Samsung Galaxy 
              </mark>
              <span
                class="ais-ReverseHighlight-nonHighlighted"
              >
                smartphone
              </span>
            </span>
          </h3>
          <p>
            <span
              class="ais-Snippet"
            >
              <span
                class="ais-Snippet-nonHighlighted"
              >
                A 
              </span>
              <mark
                class="ais-Snippet-highlighted"
              >
                smartphone
              </mark>
              <span
                class="ais-Snippet-nonHighlighted"
              >
                 by Samsung.
              </span>
            </span>
          </p>
          <p>
            <span
              class="ais-ReverseSnippet"
            >
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                A 
              </mark>
              <span
                class="ais-ReverseSnippet-nonHighlighted"
              >
                smartphone
              </span>
              <mark
                class="ais-ReverseSnippet-highlighted"
              >
                 by Samsung.
              </mark>
            </span>
          </p>
        </li>
      </ol>
    </div>
  </div>
</div>
`);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="ais-Hits ais-Hits--empty"
    >
      <p>
        No results for 
        <q>
          query with no results
        </q>
      </p>
    </div>
  </div>
</div>
`);
    });

    type CustomHit = { name: string; description: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits:
                    request.params?.query === 'query with no results'
                      ? []
                      : [
                          {
                            objectID: '1',
                            name: 'Apple iPhone smartphone',
                            description: 'A smartphone by Apple.',
                            _highlightResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Apple.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                          {
                            objectID: '2',
                            name: 'Samsung Galaxy smartphone',
                            description: 'A smartphone by Samsung.',
                            _highlightResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Samsung.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                        ],
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });
});
