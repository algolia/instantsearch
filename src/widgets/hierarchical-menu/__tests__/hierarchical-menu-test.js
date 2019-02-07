import { render } from 'preact-compat';
import { SearchParameters } from 'algoliasearch-helper';
import hierarchicalMenu from '../hierarchical-menu';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('hierarchicalMenu()', () => {
  let container;
  let attributes;
  let options;
  let widget;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = {};

    render.mockClear();
  });

  describe('Usage', () => {
    it('throws without container', () => {
      options = { container: undefined, attributes };
      expect(() => hierarchicalMenu(options))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/"
`);
    });
  });

  describe('getConfiguration', () => {
    beforeEach(() => {
      options = { container, attributes };
    });

    it('has defaults', () => {
      expect(hierarchicalMenu(options).getConfiguration({})).toEqual({
        hierarchicalFacets: [
          {
            name: 'hello',
            rootPath: null,
            attributes: ['hello', 'world'],
            separator: ' > ',
            showParentLevel: true,
          },
        ],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the separator option', () => {
      expect(
        hierarchicalMenu({ separator: ' ? ', ...options }).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [
          {
            name: 'hello',
            rootPath: null,
            attributes: ['hello', 'world'],
            separator: ' ? ',
            showParentLevel: true,
          },
        ],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the showParentLevel option', () => {
      expect(
        hierarchicalMenu({
          showParentLevel: false,
          ...options,
        }).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [
          {
            name: 'hello',
            rootPath: null,
            attributes: ['hello', 'world'],
            separator: ' > ',
            showParentLevel: false,
          },
        ],
        maxValuesPerFacet: 10,
      });
    });

    it('understand the rootPath option', () => {
      expect(
        hierarchicalMenu({ rootPath: 'Beer', ...options }).getConfiguration({})
      ).toEqual({
        hierarchicalFacets: [
          {
            name: 'hello',
            rootPath: 'Beer',
            attributes: ['hello', 'world'],
            separator: ' > ',
            showParentLevel: true,
          },
        ],
        maxValuesPerFacet: 10,
      });
    });

    describe('limit option', () => {
      it('configures maxValuesPerFacet', () =>
        expect(
          hierarchicalMenu({ limit: 20, ...options }).getConfiguration({})
            .maxValuesPerFacet
        ).toBe(20));

      it('uses provided maxValuesPerFacet when higher', () =>
        expect(
          hierarchicalMenu({ limit: 20, ...options }).getConfiguration({
            maxValuesPerFacet: 30,
          }).maxValuesPerFacet
        ).toBe(30));

      it('ignores provided maxValuesPerFacet when lower', () =>
        expect(
          hierarchicalMenu({ limit: 10, ...options }).getConfiguration({
            maxValuesPerFacet: 3,
          }).maxValuesPerFacet
        ).toBe(10));
    });
  });

  describe('render', () => {
    let results;
    let data;
    let helper;
    let state;
    let createURL;

    beforeEach(() => {
      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: jest.fn(() => data) };
      helper = {
        toggleRefinement: jest.fn().mockReturnThis(),
        search: jest.fn(),
      };
      state = new SearchParameters();
      state.toggleRefinement = jest.fn();
      options = { container, attributes };
      createURL = () => '#';
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
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('calls render', () => {
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('asks for results.getFacetValues', () => {
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(results.getFacetValues).toHaveBeenCalledTimes(1);
      expect(results.getFacetValues).toHaveBeenCalledWith('hello', {
        sortBy: ['name:asc'],
      });
    });

    it('has a sortBy option', () => {
      widget = hierarchicalMenu({ ...options, sortBy: ['count:asc'] });
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(results.getFacetValues).toHaveBeenCalledTimes(1);
      expect(results.getFacetValues).toHaveBeenCalledWith('hello', {
        sortBy: ['count:asc'],
      });
    });

    it('has a templates option', () => {
      widget = hierarchicalMenu({
        ...options,
        templates: {
          item: 'item2',
        },
      });
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('has a transformItems options', () => {
      widget = hierarchicalMenu({
        ...options,
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });

      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('sets facetValues to empty array when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('has a toggleRefinement method', () => {
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      const elementToggleRefinement =
        render.mock.calls[0][0].props.toggleRefinement;
      elementToggleRefinement('mom');
      expect(helper.toggleRefinement).toHaveBeenCalledTimes(1);
      expect(helper.toggleRefinement).toHaveBeenCalledWith('hello', 'mom');
      expect(helper.search).toHaveBeenCalledTimes(1);
    });

    it('has a limit option', () => {
      const secondLevel = [
        { name: 'six', path: 'six' },
        { name: 'seven', path: 'seven' },
        { name: 'eight', path: 'eight' },
        { name: 'nine', path: 'nine' },
      ];

      const firstLevel = [
        { name: 'one', path: 'one' },
        { name: 'two', path: 'two', data: secondLevel },
        { name: 'three', path: 'three' },
        { name: 'four', path: 'four' },
        { name: 'five', path: 'five' },
      ];

      data = { data: firstLevel };
      const expectedFacetValues = [
        { label: 'one', value: 'one' },
        {
          label: 'two',
          value: 'two',
          data: [
            { label: 'six', value: 'six' },
            { label: 'seven', value: 'seven' },
            { label: 'eight', value: 'eight' },
          ],
        },
        { label: 'three', value: 'three' },
      ];
      widget = hierarchicalMenu({ ...options, limit: 3 });
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      const actualFacetValues = render.mock.calls[0][0].props.facetValues;
      expect(actualFacetValues).toEqual(expectedFacetValues);
    });
  });
});
