import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { SearchClient } from '../../../types';
import hits from '../hits';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { HitsProps } from '../../../components/Hits/Hits';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      hits({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/"
`);
  });
});

describe('hits()', () => {
  let container: HTMLElement;
  let widget: ReturnType<typeof hits>;
  let results: SearchResults;
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({} as SearchClient, '', {});
    container = document.createElement('div');
    widget = hits({ container, cssClasses: { root: ['root', 'cx'] } });
    widget.init!(
      createInitOptions({
        helper,
        instantSearchInstance: createInstantSearch({
          templatesConfig: undefined,
        }),
      })
    );
    results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [{ objectID: '1', hit: 'first' }],
        hitsPerPage: 4,
        page: 2,
      }),
    ]);
  });

  it('calls twice render(<Hits props />, container)', () => {
    widget.render!(createRenderOptions({ results }));
    widget.render!(createRenderOptions({ results }));

    const firstRender = render.mock.calls[0][0] as VNode<HitsProps>;
    const secondRender = render.mock.calls[1][0] as VNode<HitsProps>;
    const firstContainer = render.mock.calls[0][1];
    const secondContainer = render.mock.calls[1][1];

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender.props).toMatchInlineSnapshot(`
      Object {
        "bindEvent": [Function],
        "cssClasses": Object {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits root cx",
        },
        "hits": Array [
          Object {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": Array [
            Object {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": Array [
                Object {
                  "hit": "first",
                  "objectID": "1",
                },
              ],
              "hitsPerPage": 4,
              "nbHits": 1,
              "nbPages": 1,
              "page": 2,
              "params": "",
              "processingTimeMS": 0,
              "query": "",
            },
          ],
          "_state": SearchParameters {
            "disjunctiveFacets": Array [],
            "disjunctiveFacetsRefinements": Object {},
            "facets": Array [],
            "facetsExcludes": Object {},
            "facetsRefinements": Object {},
            "hierarchicalFacets": Array [],
            "hierarchicalFacetsRefinements": Object {},
            "index": "",
            "numericRefinements": Object {},
            "tagRefinements": Array [],
          },
          "disjunctiveFacets": Array [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": Array [],
          "hierarchicalFacets": Array [],
          "hits": Array [
            Object {
              "__position": 9,
              "hit": "first",
              "objectID": "1",
            },
          ],
          "hitsPerPage": 4,
          "nbHits": 1,
          "nbPages": 1,
          "page": 2,
          "params": "",
          "processingTimeMS": 0,
          "query": "",
        },
        "sendEvent": [Function],
        "templateProps": Object {
          "templates": Object {
            "empty": "No results",
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": Object {
            "empty": false,
            "item": false,
          },
        },
      }
    `);
    expect(firstContainer).toEqual(container);
    expect(secondRender.props).toMatchInlineSnapshot(`
      Object {
        "bindEvent": [Function],
        "cssClasses": Object {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits root cx",
        },
        "hits": Array [
          Object {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": Array [
            Object {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": Array [
                Object {
                  "hit": "first",
                  "objectID": "1",
                },
              ],
              "hitsPerPage": 4,
              "nbHits": 1,
              "nbPages": 1,
              "page": 2,
              "params": "",
              "processingTimeMS": 0,
              "query": "",
            },
          ],
          "_state": SearchParameters {
            "disjunctiveFacets": Array [],
            "disjunctiveFacetsRefinements": Object {},
            "facets": Array [],
            "facetsExcludes": Object {},
            "facetsRefinements": Object {},
            "hierarchicalFacets": Array [],
            "hierarchicalFacetsRefinements": Object {},
            "index": "",
            "numericRefinements": Object {},
            "tagRefinements": Array [],
          },
          "disjunctiveFacets": Array [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": Array [],
          "hierarchicalFacets": Array [],
          "hits": Array [
            Object {
              "__position": 9,
              "hit": "first",
              "objectID": "1",
            },
          ],
          "hitsPerPage": 4,
          "nbHits": 1,
          "nbPages": 1,
          "page": 2,
          "params": "",
          "processingTimeMS": 0,
          "query": "",
        },
        "sendEvent": [Function],
        "templateProps": Object {
          "templates": Object {
            "empty": "No results",
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": Object {
            "empty": false,
            "item": false,
          },
        },
      }
    `);
    expect(secondContainer).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = hits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init!(
      createInitOptions({
        helper,
        instantSearchInstance: createInstantSearch({
          templatesConfig: undefined,
        }),
      })
    );
    widget.render!(createRenderOptions({ results }));

    const firstRender = render.mock.calls[0][0] as VNode<HitsProps>;

    expect(firstRender.props).toMatchInlineSnapshot(`
      Object {
        "bindEvent": [Function],
        "cssClasses": Object {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits",
        },
        "hits": Array [
          Object {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
            "transformed": true,
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": Array [
            Object {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": Array [
                Object {
                  "hit": "first",
                  "objectID": "1",
                },
              ],
              "hitsPerPage": 4,
              "nbHits": 1,
              "nbPages": 1,
              "page": 2,
              "params": "",
              "processingTimeMS": 0,
              "query": "",
            },
          ],
          "_state": SearchParameters {
            "disjunctiveFacets": Array [],
            "disjunctiveFacetsRefinements": Object {},
            "facets": Array [],
            "facetsExcludes": Object {},
            "facetsRefinements": Object {},
            "hierarchicalFacets": Array [],
            "hierarchicalFacetsRefinements": Object {},
            "index": "",
            "numericRefinements": Object {},
            "tagRefinements": Array [],
          },
          "disjunctiveFacets": Array [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": Array [],
          "hierarchicalFacets": Array [],
          "hits": Array [
            Object {
              "__position": 9,
              "hit": "first",
              "objectID": "1",
              "transformed": true,
            },
          ],
          "hitsPerPage": 4,
          "nbHits": 1,
          "nbPages": 1,
          "page": 2,
          "params": "",
          "processingTimeMS": 0,
          "query": "",
        },
        "sendEvent": [Function],
        "templateProps": Object {
          "templates": Object {
            "empty": "No results",
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": Object {
            "empty": false,
            "item": false,
          },
        },
      }
    `);
  });

  it('should add __position key with absolute position', () => {
    results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [{ objectID: '1', hit: 'first' }],
        hitsPerPage: 10,
        page: 4,
      }),
    ]);
    const state = new SearchParameters({ page: results.page });

    widget.render!(createRenderOptions({ results, state }));

    expect(results.hits[0].__position).toEqual(41);
  });
});
