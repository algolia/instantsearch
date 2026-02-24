/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
import searchBox from '../../search-box/search-box';
import stats from '../stats';

import type { SearchResponse } from '../../../../src/types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('stats', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        // @ts-expect-error
        stats({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/stats/js/"
      `);
    });

    test('add custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        stats({
          container,
          cssClasses: {
            root: 'ROOT',
            text: 'TEXT',
          },
        }),
      ]);

      search.start();
      await wait(0);

      expect(container.querySelector('.ais-Stats')).toHaveClass('ROOT');
      expect(container.querySelector('.ais-Stats-text')).toHaveClass('TEXT');
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        stats({ container }),
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
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              2 results found in 0ms
            </span>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              No results found in 0ms
            </span>
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        stats({
          container,
          templates: {
            text({ query, nbHits, processingTimeMS }, { html }) {
              if (nbHits === 0) {
                return html`<span>No results</span>`;
              }

              return html`<span
                ><strong>${query}</strong> returned ${nbHits}
                result${nbHits > 1 ? 's' : ''} found in
                ${processingTimeMS}ms</span
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
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              <span>
                <strong>
                  
                </strong>
                 returned 
                2
                result
                s
                 found in
                0
                ms
              </span>
            </span>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              <span>
                No results
              </span>
            </span>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        stats({
          container,
          templates: {
            text({ query, nbHits, processingTimeMS }) {
              if (nbHits === 0) {
                return <span>No results</span>;
              }

              return (
                <span>
                  <strong>{query}</strong> returned {nbHits}
                  result{nbHits > 1 ? 's' : ''} found in
                  {processingTimeMS}ms
                </span>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              <span>
                <strong>
                  
                </strong>
                 returned 
                2
                result
                s
                 found in
                0
                ms
              </span>
            </span>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Stats"
          >
            <span
              class="ais-Stats-text"
            >
              <span>
                No results
              </span>
            </span>
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
                            objectID: '1',
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
