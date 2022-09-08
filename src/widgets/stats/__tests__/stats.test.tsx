/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import stats from '../stats';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import type { SearchResponse } from '../../../../src/types';
import searchBox from '../../search-box/search-box';
import { fireEvent, within } from '@testing-library/dom';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('stats', () => {
  describe('templates', () => {
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
