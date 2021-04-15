import { render } from 'preact';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import hierarchicalMenu, {
  HierarchicalMenuWidgetParams,
} from '../hierarchical-menu';
import {
  HierarchicalMenuConnectorParams,
  HierarchicalMenuWidgetDescription,
} from '../../../connectors/hierarchical-menu/connectHierarchicalMenu';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { Widget } from '../../../types';

const mockedRender = render as jest.Mock;

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('hierarchicalMenu()', () => {
  let container: HTMLDivElement;
  let attributes: string[];
  let options: HierarchicalMenuConnectorParams & HierarchicalMenuWidgetParams;
  let widget: Widget<HierarchicalMenuWidgetDescription & {
    widgetParams: HierarchicalMenuConnectorParams;
  }>;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = { container, attributes };

    mockedRender.mockClear();
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
    let results: SearchResults<any>;
    let data: SearchResults.HierarchicalFacet;
    let helper: AlgoliaSearchHelper;
    let state: SearchParameters;

    beforeEach(() => {
      data = {
        name: 'baz',
        count: 3,
        path: '',
        isRefined: false,
        data: [
          { name: 'foo', count: 1, path: '', isRefined: false, data: [] },
          { name: 'bar', count: 2, path: '', isRefined: false, data: [] },
        ],
      };
      helper = algoliasearchHelper(createSearchClient(), '');
      helper.toggleFacetRefinement = jest.fn().mockReturnThis();
      helper.search = jest.fn();
      results = new SearchResults(helper.state, [
        createSingleSearchResponse({}),
      ]);
      results.getFacetValues = jest.fn(() => data);
      state = new SearchParameters();
      options = { container, attributes };
    });

    it('understand provided cssClasses', () => {
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
        label: 'label',
        count: 'count',
        noResults: 'noResults',
        showMore: 'showMore',
        disabledShowMore: 'disabledShowMore',
      };
      widget = hierarchicalMenu({ ...options, cssClasses: userCssClasses });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
    });

    it('calls render', () => {
      widget = hierarchicalMenu(options);

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      expect(mockedRender).toHaveBeenCalledTimes(1);
      expect(firstRender[0].props).toMatchSnapshot();
    });

    it('asks for results.getFacetValues', () => {
      widget = hierarchicalMenu(options);

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      expect(results.getFacetValues).toHaveBeenCalledTimes(1);
      expect(results.getFacetValues).toHaveBeenCalledWith('hello', {
        sortBy: ['name:asc'],
      });
    });

    it('has a sortBy option', () => {
      widget = hierarchicalMenu({ ...options, sortBy: ['name:asc'] });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      expect(results.getFacetValues).toHaveBeenCalledTimes(1);
      expect(results.getFacetValues).toHaveBeenCalledWith('hello', {
        sortBy: ['name:asc'],
      });
    });

    it('has a templates option', () => {
      widget = hierarchicalMenu({
        ...options,
        templates: {
          item: 'item2',
        },
      });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
    });

    it('has a transformItems options', () => {
      widget = hierarchicalMenu({
        ...options,
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
    });

    it('sets facetValues to empty array when no results', () => {
      data = {
        name: 'baz',
        count: 0,
        path: '',
        isRefined: false,
        data: [],
      };
      widget = hierarchicalMenu(options);

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      expect(firstRender[0].props).toMatchSnapshot();
    });

    it('has a toggleRefinement method', () => {
      widget = hierarchicalMenu(options);

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      const elementToggleRefinement = firstRender[0].props.toggleRefinement;
      elementToggleRefinement('mom');

      expect(helper.toggleFacetRefinement).toHaveBeenCalledTimes(1);
      expect(helper.toggleFacetRefinement).toHaveBeenCalledWith('hello', 'mom');
      expect(helper.search).toHaveBeenCalledTimes(1);
    });

    it('has a limit option', () => {
      const secondLevel: SearchResults.HierarchicalFacet[] = [
        { name: 'six', path: 'six', count: 6, isRefined: false, data: [] },
        { name: 'seven', path: 'seven', count: 7, isRefined: false, data: [] },
        { name: 'eight', path: 'eight', count: 8, isRefined: false, data: [] },
        { name: 'nine', path: 'nine', count: 9, isRefined: false, data: [] },
      ];
      const firstLevel: SearchResults.HierarchicalFacet[] = [
        { name: 'one', path: 'one', count: 1, isRefined: false, data: [] },
        {
          name: 'two',
          path: 'two',
          count: 2,
          isRefined: false,
          data: secondLevel,
        },
        { name: 'three', path: 'three', count: 3, isRefined: false, data: [] },
        { name: 'four', path: 'four', count: 4, isRefined: false, data: [] },
        { name: 'five', path: 'five', count: 5, isRefined: false, data: [] },
      ];
      data = {
        name: 'zero',
        path: 'zero',
        count: 0,
        isRefined: false,
        data: firstLevel,
      };
      const expectedFacetValues = [
        { label: 'one', value: 'one', count: 1, isRefined: false, data: [] },
        {
          label: 'two',
          value: 'two',
          count: 2,
          isRefined: false,
          data: [
            {
              label: 'six',
              value: 'six',
              count: 6,
              isRefined: false,
              data: [],
            },
            {
              label: 'seven',
              value: 'seven',
              count: 7,
              isRefined: false,
              data: [],
            },
            {
              label: 'eight',
              value: 'eight',
              count: 8,
              isRefined: false,
              data: [],
            },
          ],
        },
        {
          label: 'three',
          value: 'three',
          count: 3,
          isRefined: false,
          data: [],
        },
      ];
      widget = hierarchicalMenu({ ...options, limit: 3 });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ results, state }));

      const [firstRender] = mockedRender.mock.calls;

      const actualFacetValues = firstRender[0].props.facetValues;
      expect(actualFacetValues).toEqual(expectedFacetValues);
    });
  });
});
