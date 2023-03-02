/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { wait } from '@instantsearch/testutils/wait';
import { render as originalRender } from 'preact';

import instantsearch from '../../../index.es';
import hierarchicalMenu from '../hierarchical-menu';

import type { RefinementListProps } from '../../../components/RefinementList/RefinementList';
import type { HierarchicalMenuConnectorParams } from '../../../connectors/hierarchical-menu/connectHierarchicalMenu';
import type {
  HierarchicalMenuComponentTemplates,
  HierarchicalMenuWidgetParams,
} from '../hierarchical-menu';
import type { VNode } from 'preact';

const render = castToJestMock(originalRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('hierarchicalMenu()', () => {
  let container: HTMLDivElement;
  const attributes = ['hierarchy.1', 'hierarchy.2', 'hierarchy.3'];
  let options: HierarchicalMenuConnectorParams & HierarchicalMenuWidgetParams;
  const singleResults = createSingleSearchResponse({
    facets: {
      'hierarchy.1': {
        zero: 0,
      },
      'hierarchy.2': {
        'zero > one': 1,
        'zero > two': 2,
        'zero > three': 3,
        'zero > four': 4,
        'zero > five': 5,
      },
      'hierarchy.3': {
        'zero > one > six': 6,
        'zero > one > seven': 7,
        'zero > one > eight': 8,
        'zero > one > nine': 9,
      },
    },
  });
  const searchClient = createSearchClient({
    search: jest.fn(() =>
      Promise.resolve({
        results: [singleResults, singleResults, singleResults],
      })
    ),
  });

  beforeEach(() => {
    container = document.createElement('div');
    options = { container, attributes };
    render.mockClear();
    castToJestMock(searchClient.search).mockClear();
  });

  describe('Usage', () => {
    it('throws without container', () => {
      // @ts-expect-error
      options = { container: undefined, attributes };
      expect(() => hierarchicalMenu(options))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/"
`);
    });
  });

  describe('render', () => {
    it('understand provided cssClasses', async () => {
      const userCssClasses = {
        root: 'root',
        noRefinementRoot: 'noRefinementRoot',
        searchBox: 'searchBox',
        list: 'list',
        childList: 'childList',
        item: 'item',
        selectedItem: 'selectedItem',
        parentItem: 'parentItem',
        link: 'link',
        selectedItemLink: 'selectedItemLink',
        label: 'label',
        count: 'count',
        noResults: 'noResults',
        showMore: 'showMore',
        disabledShowMore: 'disabledShowMore',
      };
      const widget = hierarchicalMenu({
        ...options,
        cssClasses: userCssClasses,
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);
      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      expect(props.cssClasses).toEqual({
        childList: 'ais-HierarchicalMenu-list--child childList',
        count: 'ais-HierarchicalMenu-count count',
        disabledShowMore:
          'ais-HierarchicalMenu-showMore--disabled disabledShowMore',
        item: 'ais-HierarchicalMenu-item item',
        label: 'ais-HierarchicalMenu-label label',
        link: 'ais-HierarchicalMenu-link link',
        selectedItemLink:
          'ais-HierarchicalMenu-link--selected selectedItemLink',
        list: 'ais-HierarchicalMenu-list list',
        noRefinementRoot: 'ais-HierarchicalMenu--noRefinement noRefinementRoot',
        parentItem: 'ais-HierarchicalMenu-item--parent parentItem',
        root: 'ais-HierarchicalMenu root',
        selectedItem: 'ais-HierarchicalMenu-item--selected selectedItem',
        showMore: 'ais-HierarchicalMenu-showMore showMore',
      });
    });

    it('calls render', async () => {
      const widget = hierarchicalMenu(options);

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      expect(render).toHaveBeenCalledTimes(1);
    });

    it('has a sortBy option', async () => {
      const resultsWithOrdering = createSingleSearchResponse({
        ...singleResults,
        renderingContent: {
          facetOrdering: {
            values: {
              'hierarchy.2': { order: ['zero > two', 'zero > one'] },
            },
          },
        },
      });
      castToJestMock(searchClient.search).mockResolvedValueOnce({
        results: [resultsWithOrdering, resultsWithOrdering],
      });

      const widget = hierarchicalMenu({ ...options, sortBy: ['name:desc'] });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
        initialUiState: {
          test: {
            hierarchicalMenu: {
              'hierarchy.1': ['zero'],
            },
          },
        },
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      // not ordered via count or facet ordering, via label descending
      expect(props.facetValues![0].data).toEqual([
        {
          count: 2,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'two',
          value: 'zero > two',
        },
        {
          count: 3,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'three',
          value: 'zero > three',
        },
        {
          count: 1,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'one',
          value: 'zero > one',
        },
        {
          count: 4,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'four',
          value: 'zero > four',
        },
        {
          count: 5,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'five',
          value: 'zero > five',
        },
      ]);
    });

    it('has a templates option', async () => {
      const widget = hierarchicalMenu({
        ...options,
        templates: {
          item: 'item2',
        },
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      expect(props.templateProps).toMatchInlineSnapshot(`
{
  "templates": {
    "item": "item2",
    "showMoreText": [Function],
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
    "item": true,
    "showMoreText": false,
  },
}
`);
    });

    it('has a transformItems options', async () => {
      const widget = hierarchicalMenu({
        ...options,
        transformItems: (items) =>
          items.map((item) => ({ ...item, transformed: true })),
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      expect(props.facetValues).toEqual([
        {
          count: 0,
          data: null,
          exhaustive: true,
          isRefined: false,
          label: 'zero',
          transformed: true,
          value: 'zero',
        },
      ]);
    });

    it('sets facetValues to empty array when no results', async () => {
      castToJestMock(searchClient.search).mockResolvedValueOnce({
        results: [createSingleSearchResponse()],
      });
      const widget = hierarchicalMenu(options);

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      expect(props.facetValues).toEqual([]);
    });

    it('has a toggleRefinement method', async () => {
      const widget = hierarchicalMenu(options);

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(castToJestMock(searchClient.search).mock.calls[0][0]).toEqual([
        {
          indexName: 'test',
          params: {
            clickAnalytics: true,
            facets: ['hierarchy.1'],
            maxValuesPerFacet: 10,
            tagFilters: '',
          },
        },
      ]);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      const elementToggleRefinement = props.toggleRefinement;
      elementToggleRefinement('zero');

      expect(searchClient.search).toHaveBeenCalledTimes(2);

      expect(castToJestMock(searchClient.search).mock.calls[1][0]).toEqual([
        {
          indexName: 'test',
          params: {
            clickAnalytics: true,
            facetFilters: [['hierarchy.1:zero']],
            facets: ['hierarchy.1', 'hierarchy.2'],
            maxValuesPerFacet: 10,
            tagFilters: '',
          },
        },
        {
          indexName: 'test',
          params: {
            analytics: false,
            clickAnalytics: false,
            facets: ['hierarchy.1'],
            hitsPerPage: 0,
            maxValuesPerFacet: 10,
            page: 0,
          },
        },
      ]);
    });

    it('has a limit option', async () => {
      const widget = hierarchicalMenu({ ...options, limit: 3 });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
        initialUiState: {
          test: {
            hierarchicalMenu: {
              'hierarchy.1': ['zero', 'one'],
            },
          },
        },
      });
      search.addWidgets([widget]);
      search.start();
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<HierarchicalMenuComponentTemplates>
      >;

      expect(props.facetValues![0].data).toHaveLength(3);
      expect(props.facetValues![0].data![2].data).toHaveLength(3);

      expect(props.facetValues).toEqual([
        {
          count: 0,
          isRefined: true,
          exhaustive: true,
          value: 'zero',
          label: 'zero',
          data: [
            {
              count: 5,
              isRefined: false,
              exhaustive: true,
              value: 'zero > five',
              label: 'five',
              data: null,
            },
            {
              count: 4,
              isRefined: false,
              exhaustive: true,
              value: 'zero > four',
              label: 'four',
              data: null,
            },
            {
              count: 1,
              isRefined: true,
              exhaustive: true,
              value: 'zero > one',
              label: 'one',
              data: [
                {
                  count: 8,
                  isRefined: false,
                  exhaustive: true,
                  value: 'zero > one > eight',
                  label: 'eight',
                  data: null,
                },
                {
                  count: 9,
                  isRefined: false,
                  exhaustive: true,
                  value: 'zero > one > nine',
                  label: 'nine',
                  data: null,
                },
                {
                  count: 7,
                  isRefined: false,
                  exhaustive: true,
                  value: 'zero > one > seven',
                  label: 'seven',
                  data: null,
                },
              ],
            },
          ],
        },
      ]);
    });
  });
});
