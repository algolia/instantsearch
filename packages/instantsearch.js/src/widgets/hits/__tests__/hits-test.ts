/**
 * @jest-environment jsdom
 */

import { createSingleSearchResponse } from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import hits from '../hits';

import type { HitsProps } from '../../../components/Hits/Hits';
import type { SearchClient } from '../../../types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { VNode } from 'preact';

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
      {
        "bindEvent": [Function],
        "cssClasses": {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits root cx",
        },
        "hits": [
          {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": [
            {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": [
                {
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
            "disjunctiveFacets": [],
            "disjunctiveFacetsRefinements": {},
            "facets": [],
            "facetsExcludes": {},
            "facetsRefinements": {},
            "hierarchicalFacets": [],
            "hierarchicalFacetsRefinements": {},
            "index": "",
            "numericRefinements": {},
            "tagRefinements": [],
          },
          "disjunctiveFacets": [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": [],
          "hierarchicalFacets": [],
          "hits": [
            {
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
        "templateProps": {
          "templates": {
            "empty": [Function],
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": {
            "empty": false,
            "item": false,
          },
        },
      }
    `);
    expect(firstContainer).toEqual(container);
    expect(secondRender.props).toMatchInlineSnapshot(`
      {
        "bindEvent": [Function],
        "cssClasses": {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits root cx",
        },
        "hits": [
          {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": [
            {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": [
                {
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
            "disjunctiveFacets": [],
            "disjunctiveFacetsRefinements": {},
            "facets": [],
            "facetsExcludes": {},
            "facetsRefinements": {},
            "hierarchicalFacets": [],
            "hierarchicalFacetsRefinements": {},
            "index": "",
            "numericRefinements": {},
            "tagRefinements": [],
          },
          "disjunctiveFacets": [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": [],
          "hierarchicalFacets": [],
          "hits": [
            {
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
        "templateProps": {
          "templates": {
            "empty": [Function],
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": {
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
      transformItems: (items) =>
        items.map((item) => ({ ...item, transformed: true })),
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
      {
        "bindEvent": [Function],
        "cssClasses": {
          "emptyRoot": "ais-Hits--empty",
          "item": "ais-Hits-item",
          "list": "ais-Hits-list",
          "root": "ais-Hits",
        },
        "hits": [
          {
            "__position": 9,
            "hit": "first",
            "objectID": "1",
            "transformed": true,
          },
        ],
        "insights": [Function],
        "results": SearchResults {
          "_rawResults": [
            {
              "exhaustiveFacetsCount": true,
              "exhaustiveNbHits": true,
              "hits": [
                {
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
            "disjunctiveFacets": [],
            "disjunctiveFacetsRefinements": {},
            "facets": [],
            "facetsExcludes": {},
            "facetsRefinements": {},
            "hierarchicalFacets": [],
            "hierarchicalFacetsRefinements": {},
            "index": "",
            "numericRefinements": {},
            "tagRefinements": [],
          },
          "disjunctiveFacets": [],
          "exhaustiveFacetsCount": true,
          "exhaustiveNbHits": true,
          "facets": [],
          "hierarchicalFacets": [],
          "hits": [
            {
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
        "templateProps": {
          "templates": {
            "empty": [Function],
            "item": [Function],
          },
          "templatesConfig": undefined,
          "useCustomCompileOptions": {
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

    expect(render).toHaveBeenCalledTimes(1);
    const firstRender = render.mock.calls[0][0] as VNode<HitsProps>;
    const props = firstRender.props as HitsProps;

    expect(props.hits[0].__position).toEqual(41);
  });
});
