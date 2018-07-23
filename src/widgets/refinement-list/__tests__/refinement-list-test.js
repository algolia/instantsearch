import sinon from 'sinon';

import algoliasearchHelper from 'algoliasearch-helper';
const SearchParameters = algoliasearchHelper.SearchParameters;
import refinementList from '../refinement-list.js';
const instantSearchInstance = { templatesConfig: {} };

describe('refinementList()', () => {
  let autoHideContainer;
  let container;
  let headerFooter;
  let options;
  let widget;
  let ReactDOM;

  beforeEach(() => {
    container = document.createElement('div');

    ReactDOM = { render: sinon.spy() };
    refinementList.__Rewire__('render', ReactDOM.render);
    autoHideContainer = sinon.stub().returnsArg(0);
    refinementList.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returnsArg(0);
    refinementList.__Rewire__('headerFooterHOC', headerFooter);
  });

  describe('instantiated with wrong parameters', () => {
    it('should fail if no container', () => {
      // Given
      options = { container: undefined, attributeName: 'foo' };

      // Then
      expect(() => {
        // When
        refinementList(options);
      }).toThrow(/^Usage:/);
    });
  });

  describe('render', () => {
    const helper = {};
    let results;
    let state;
    let createURL;

    function renderWidget(userOptions) {
      widget = refinementList({ ...options, ...userOptions });
      widget.init({ helper, createURL, instantSearchInstance });
      return widget.render({ results, helper, state });
    }

    beforeEach(() => {
      options = { container, attributeName: 'attributeName' };
      results = {
        getFacetValues: sinon
          .stub()
          .returns([{ name: 'foo' }, { name: 'bar' }]),
      };
      state = SearchParameters.make({});
      createURL = () => '#';
    });

    describe('cssClasses', () => {
      it('should call the component with the correct classes', () => {
        // Given
        const cssClasses = {
          root: ['root', 'cx'],
          header: 'header',
          body: 'body',
          footer: 'footer',
          list: 'list',
          item: 'item',
          active: 'active',
          label: 'label',
          checkbox: 'checkbox',
          count: 'count',
        };

        // When
        renderWidget({ cssClasses });
        const actual = ReactDOM.render.firstCall.args[0].props.cssClasses;

        // Then
        expect(actual.root).toBe('ais-refinement-list root cx');
        expect(actual.header).toBe('ais-refinement-list--header header');
        expect(actual.body).toBe('ais-refinement-list--body body');
        expect(actual.footer).toBe('ais-refinement-list--footer footer');
        expect(actual.list).toBe('ais-refinement-list--list list');
        expect(actual.item).toBe('ais-refinement-list--item item');
        expect(actual.active).toBe('ais-refinement-list--item__active active');
        expect(actual.label).toBe('ais-refinement-list--label label');
        expect(actual.checkbox).toBe('ais-refinement-list--checkbox checkbox');
        expect(actual.count).toBe('ais-refinement-list--count count');
      });
    });

    describe('autoHideContainer', () => {
      it('should set shouldAutoHideContainer to false if there are facetValues', () => {
        // Given
        results.getFacetValues = sinon
          .stub()
          .returns([{ name: 'foo' }, { name: 'bar' }]);

        // When
        renderWidget();
        const actual =
          ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        expect(actual).toBe(false);
      });
      it('should set shouldAutoHideContainer to true if no facet values', () => {
        // Given
        results.getFacetValues = sinon.stub().returns([]);

        // When
        renderWidget();
        const actual =
          ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        expect(actual).toBe(true);
      });
    });

    describe('header', () => {
      it('should pass the refined count to the header data', () => {
        // Given
        const facetValues = [
          {
            name: 'foo',
            isRefined: true,
          },
          {
            name: 'bar',
            isRefined: true,
          },
          {
            name: 'baz',
            isRefined: false,
          },
        ];
        results.getFacetValues = sinon.stub().returns(facetValues);

        // When
        renderWidget();
        const props = ReactDOM.render.firstCall.args[0].props;

        // Then
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });

      it('should dynamically update the header template on subsequent renders', () => {
        // Given
        const widgetOptions = { container, attributeName: 'type' };
        const initOptions = { helper, createURL, instantSearchInstance };
        const facetValues = [
          {
            name: 'foo',
            isRefined: true,
          },
          {
            name: 'bar',
            isRefined: false,
          },
        ];
        results.getFacetValues = sinon.stub().returns(facetValues);
        const renderOptions = { results, helper, state };

        // When
        widget = refinementList(widgetOptions);
        widget.init(initOptions);
        widget.render(renderOptions);

        // Then
        let props = ReactDOM.render.firstCall.args[0].props;
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(1);

        // When... second render call
        facetValues[1].isRefined = true;
        widget.render(renderOptions);

        // Then
        props = ReactDOM.render.secondCall.args[0].props;
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });
    });

    it('renders transformed items correctly', () => {
      widget = refinementList({
        ...options,
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({
        helper,
        createURL,
        instantSearchInstance,
      });
      widget.render({ results, helper, state });

      expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
    });
  });

  describe('show more', () => {
    it('should return a configuration with the highest limit value (default value)', () => {
      const opts = {
        container,
        attributeName: 'attributeName',
        limit: 1,
        showMore: {},
      };
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(100);
    });

    it('should return a configuration with the highest limit value (custom value)', () => {
      const opts = {
        container,
        attributeName: 'attributeName',
        limit: 1,
        showMore: { limit: 99 },
      };
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(opts.showMore.limit);
    });

    it('should not accept a show more limit that is < limit', () => {
      const opts = {
        container,
        attributeName: 'attributeName',
        limit: 100,
        showMore: { limit: 1 },
      };
      expect(() => refinementList(opts)).toThrow();
    });
  });
});
