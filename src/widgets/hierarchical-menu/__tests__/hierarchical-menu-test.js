import hierarchicalMenu from '../hierarchical-menu';
import jsHelper from 'algoliasearch-helper';
const SearchParameters = jsHelper.SearchParameters;

describe('hierarchicalMenu()', () => {
  let container;
  let attributes;
  let options;
  let widget;
  let ReactDOM;

  beforeEach(() => {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = {};
    ReactDOM = { render: jest.fn() };
    hierarchicalMenu.__Rewire__('render', ReactDOM.render);
  });

  describe('instantiated with wrong parameters', () => {
    it('should fail if no attributes', () => {
      options = { container, attributes: undefined };
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
    });

    it('should fail if attributes empty', () => {
      options = { container, attributes: [] };
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
    });

    it('should fail if no container', () => {
      options = { container: undefined, attributes };
      expect(() => hierarchicalMenu(options)).toThrow(/^Usage:/);
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
        root: ['root', 'cx'],
        header: 'header',
        body: 'body',
        footer: 'footer',
        list: 'list',
        item: 'item',
        active: 'active',
        link: 'link',
        count: 'count',
      };

      widget = hierarchicalMenu({ ...options, cssClasses: userCssClasses });
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('calls ReactDOM.render', () => {
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
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
          header: 'header2',
          item: 'item2',
          footer: 'footer2',
        },
      });
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('has a transformItems options', () => {
      widget = hierarchicalMenu({
        ...options,
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('sets shouldAutoHideContainer to true when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('sets facetValues to empty array when no results', () => {
      data = {};
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('has a toggleRefinement method', () => {
      widget = hierarchicalMenu(options);
      widget.init({ helper, createURL, instantSearchInstance: {} });
      widget.render({ results, state });
      const elementToggleRefinement =
        ReactDOM.render.mock.calls[0][0].props.toggleRefinement;
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
      const actualFacetValues =
        ReactDOM.render.mock.calls[0][0].props.facetValues;
      expect(actualFacetValues).toEqual(expectedFacetValues);
    });

    afterEach(() => {
      hierarchicalMenu.__ResetDependency__('defaultTemplates');
    });
  });

  afterEach(() => {
    hierarchicalMenu.__ResetDependency__('render');
    hierarchicalMenu.__ResetDependency__('autoHideContainerHOC');
    hierarchicalMenu.__ResetDependency__('headerFooterHOC');
  });
});
