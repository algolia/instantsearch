/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import instantsearch from '../../../index.es';
import menuSelect from '../menu-select';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { VNode } from 'preact';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('menuSelect', () => {
  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        // @ts-expect-error
        menuSelect({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
  "The \`container\` option is required.

  See documentation: https://www.algolia.com/doc/api-reference/widgets/menu-select/js/"
  `);
    });
  });

  let helper: AlgoliaSearchHelper;
  const searchClient = createSearchClient({
    search() {
      return Promise.resolve({
        results: [
          createSingleSearchResponse({
            facets: {
              test: {
                foo: 1,
                bar: 2,
              },
            },
          }),
        ],
      });
    },
  });

  beforeEach(() => {
    helper = algoliasearchHelper(createSearchClient(), 'index_name');
    helper.search = jest.fn();

    render.mockClear();
  });

  describe('render', () => {
    it('renders correctly', async () => {
      const widget = menuSelect({
        container: document.createElement('div'),
        attribute: 'test',
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });

      search.start();

      search.addWidgets([widget]);

      await wait(0);

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(firstRender.props).toMatchInlineSnapshot(`
  {
    "cssClasses": {
      "noRefinementRoot": "ais-MenuSelect--noRefinement",
      "option": "ais-MenuSelect-option",
      "root": "ais-MenuSelect",
      "select": "ais-MenuSelect-select",
    },
    "items": [
      {
        "count": 2,
        "data": null,
        "exhaustive": true,
        "isRefined": false,
        "label": "bar",
        "value": "bar",
      },
      {
        "count": 1,
        "data": null,
        "exhaustive": true,
        "isRefined": false,
        "label": "foo",
        "value": "foo",
      },
    ],
    "refine": [Function],
    "templateProps": {
      "templates": {
        "defaultOption": [Function],
        "item": [Function],
      },
      "templatesConfig": {
        "compileOptions": {},
        "helpers": {
          "formatNumber": [Function],
          "highlight": [Function],
          "insights": [Function],
          "reverseHighlight": [Function],
          "reverseSnippet": [Function],
          "snippet": [Function],
        },
      },
      "useCustomCompileOptions": {
        "defaultOption": false,
        "item": false,
      },
    },
  }
  `);
    });

    it('renders transformed items correctly', async () => {
      const widget = menuSelect({
        container: document.createElement('div'),
        attribute: 'test',
        transformItems: (items) =>
          items.map((item) => ({ ...item, transformed: true })),
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });

      search.start();

      search.addWidgets([widget]);

      await wait(0);

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(firstRender.props).toMatchInlineSnapshot(`
  {
    "cssClasses": {
      "noRefinementRoot": "ais-MenuSelect--noRefinement",
      "option": "ais-MenuSelect-option",
      "root": "ais-MenuSelect",
      "select": "ais-MenuSelect-select",
    },
    "items": [
      {
        "count": 2,
        "data": null,
        "exhaustive": true,
        "isRefined": false,
        "label": "bar",
        "transformed": true,
        "value": "bar",
      },
      {
        "count": 1,
        "data": null,
        "exhaustive": true,
        "isRefined": false,
        "label": "foo",
        "transformed": true,
        "value": "foo",
      },
    ],
    "refine": [Function],
    "templateProps": {
      "templates": {
        "defaultOption": [Function],
        "item": [Function],
      },
      "templatesConfig": {
        "compileOptions": {},
        "helpers": {
          "formatNumber": [Function],
          "highlight": [Function],
          "insights": [Function],
          "reverseHighlight": [Function],
          "reverseSnippet": [Function],
          "snippet": [Function],
        },
      },
      "useCustomCompileOptions": {
        "defaultOption": false,
        "item": false,
      },
    },
  }
  `);
    });
  });

  describe('dispose', () => {
    it('unmounts the component', async () => {
      const container = document.createElement('div');
      const widget = menuSelect({
        container,
        attribute: 'test',
        transformItems: (items) =>
          items.map((item) => ({ ...item, transformed: true })),
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
        initialUiState: {
          test: {
            menu: { amazingBrand: 'Algolia' },
          },
        },
      });

      search.start();

      expect(search.helper!.state).toEqual(
        new SearchParameters({
          index: 'test',
        })
      );

      search.addWidgets([widget]);

      await wait(0);

      expect(search.helper!.state).toEqual(
        new SearchParameters({
          index: 'test',
          hierarchicalFacets: [{ attributes: ['test'], name: 'test' }],
          hierarchicalFacetsRefinements: { test: [] },
          maxValuesPerFacet: 10,
        })
      );

      expect(render).toHaveBeenCalledTimes(1);

      search.removeWidgets([widget]);

      expect(render).toHaveBeenCalledTimes(2);
      expect(render).toHaveBeenLastCalledWith(null, container);
      expect(search.helper!.state).toEqual(
        new SearchParameters({ index: 'test' })
      );
    });
  });
});
