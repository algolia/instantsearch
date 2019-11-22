import { Response } from 'algoliasearch';

import connectRelatedHits from '../connectRelatedHits';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createSingleSearchResponse,
  createMultiSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import instantsearch from '../../../lib/main';
import { warning } from '../../../lib/utils';

const createSearchClientWithResponse = (response: Partial<Response>) => {
  return createSearchClient({
    search: jest.fn(requests =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() => createSingleSearchResponse(response))
        )
      )
    ),
  });
};

describe('connectRelatedHits', () => {
  describe('usage', () => {
    test('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectRelatedHits()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/related-hits/js/#connector"
`);
    });

    test('does not throw without unmount function', () => {
      expect(() => {
        connectRelatedHits(() => {})({
          hit: {},
        });
      }).not.toThrow();
    });

    test('throws without the `hit` option', () => {
      expect(() => {
        // @ts-ignore
        connectRelatedHits(jest.fn())({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`hit\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/related-hits/js/#connector"
`);
    });

    test('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customQueryRules = connectRelatedHits(render, unmount);
      const widget = customQueryRules({
        hit: {},
      });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.relatedHits',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });

    test('warns about being an experimental widget', () => {
      warning.cache = {};

      expect(() => {
        connectRelatedHits(() => {});
      }).toWarnDev(
        '[InstantSearch.js]: RelatedHits is an experimental widget that is subject to change in next minor versions.'
      );
    });
  });

  describe('lifecycle', () => {
    test('calls the renderer with the rendering options', done => {
      const search = instantsearch({
        searchClient: createSearchClient(),
        indexName: 'indexName',
      });
      const hit = {};
      const relatedHits = connectRelatedHits(
        (
          {
            items,
            isFirstPage,
            isLastPage,
            showPrevious,
            showNext,
            widgetParams,
          },
          isFirstRender
        ) => {
          if (isFirstRender) {
            expect(isFirstRender).toEqual(true);
          } else {
            expect(isFirstRender).toEqual(false);
          }

          expect(items).toEqual([]);
          expect(isFirstPage).toEqual(true);
          expect(isLastPage).toEqual(true);
          expect(showPrevious).toBeInstanceOf(Function);
          expect(showNext).toBeInstanceOf(Function);
          expect(widgetParams).toEqual({
            hit,
          });

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
        }),
      ]);
      search.start();
    });

    test('forwards hits to the renderer', done => {
      const hit = {};
      const hits = [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }];
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClientWithResponse({
          hits,
        }),
      });

      const relatedHits = connectRelatedHits(
        ({ items, isFirstPage, isLastPage }, isFirstRender) => {
          if (isFirstRender) {
            return;
          }

          expect(items).toEqual(hits);
          expect(isFirstPage).toEqual(true);
          expect(isLastPage).toEqual(true);

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
        }),
      ]);
      search.start();
    });

    test('forwards transformed hits to the renderer', done => {
      const hit = {};
      const hits = [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }];
      const transformItems = items =>
        items.map(item => ({ ...item, transformed: true }));
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClientWithResponse({
          hits,
        }),
      });

      const relatedHits = connectRelatedHits(
        ({ items, isFirstPage, isLastPage }, isFirstRender) => {
          if (isFirstRender) {
            return;
          }

          expect(items).toEqual(transformItems(hits));
          expect(isFirstPage).toEqual(true);
          expect(isLastPage).toEqual(true);

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
          transformItems,
        }),
      ]);
      search.start();
    });

    test('sets isLastPage to false on first page', done => {
      const hit = {};
      const hits = [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }];
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClientWithResponse({
          hits,
          hitsPerPage: 1,
        }),
      });

      const relatedHits = connectRelatedHits(
        ({ items, isFirstPage, isLastPage }, isFirstRender) => {
          if (isFirstRender) {
            return;
          }

          expect(items).toEqual(hits);
          expect(isFirstPage).toEqual(true);
          expect(isLastPage).toEqual(false);

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
        }),
      ]);
      search.start();
    });

    test('sets isFirstPage and isLastPage to false on middle page', done => {
      const hit = {};
      const hits = [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }];
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClientWithResponse({
          hits,
          page: 1,
          hitsPerPage: 1,
        }),
      });

      const relatedHits = connectRelatedHits(
        ({ instantSearchInstance, isFirstPage, isLastPage }, isFirstRender) => {
          if (isFirstRender) {
            return;
          }

          expect(instantSearchInstance.helper!.state.page).toEqual(1);
          expect(isFirstPage).toEqual(false);
          expect(isLastPage).toEqual(false);

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
        }),
      ]);
      search.start();
      search.helper!.setPage(1);
    });

    test('sets isLastPage to true on last page', done => {
      const hit = {};
      const hits = [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }];
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClientWithResponse({
          hits,
          page: 2,
          hitsPerPage: 1,
        }),
      });

      const relatedHits = connectRelatedHits(
        ({ instantSearchInstance, isFirstPage, isLastPage }, isFirstRender) => {
          if (isFirstRender) {
            return;
          }

          expect(instantSearchInstance.helper!.state.page).toEqual(2);
          expect(isFirstPage).toEqual(false);
          expect(isLastPage).toEqual(true);

          done();
        }
      );

      search.addWidgets([
        relatedHits({
          hit,
        }),
      ]);
      search.start();
      search.helper!.setPage(2);
    });
  });
});
