import { SearchParameters } from 'algoliasearch-helper';
import refinementList from '../refinement-list';

const instantSearchInstance = { templatesConfig: {} };

describe('refinementList()', () => {
  let container;
  let options;
  let widget;
  let ReactDOM;

  beforeEach(() => {
    container = document.createElement('div');

    ReactDOM = { render: jest.fn() };
    refinementList.__Rewire__('render', ReactDOM.render);
  });

  describe('instantiated with wrong parameters', () => {
    it('should fail if no container', () => {
      options = { container: undefined, attribute: 'foo' };

      expect(() => {
        refinementList(options);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/"
`);
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
      options = { container, attribute: 'attribute' };
      results = {
        getFacetValues: jest
          .fn()
          .mockReturnValue([{ name: 'foo' }, { name: 'bar' }]),
      };
      state = SearchParameters.make({});
      createURL = () => '#';
    });

    describe('cssClasses', () => {
      it('should call the component with the correct classes', () => {
        // Given
        const cssClasses = {
          root: ['root', 'cx'],
          noRefinementRoot: 'noRefinementRoot',
          list: 'list',
          item: 'item',
          selectedItem: 'selectedItem',
          searchBox: 'searchBox',
          label: 'label',
          checkbox: 'checkbox',
          labelText: 'labelText',
          count: 'count',
          noResults: 'noResults',
          showMore: 'showMore',
          disabledShowMore: 'disabledShowMore',
        };

        // When
        renderWidget({ cssClasses });
        const actual = ReactDOM.render.mock.calls[0][0].props.cssClasses;

        // Then
        expect(actual.root).toMatchInlineSnapshot(
          `"ais-RefinementList root cx"`
        );
        expect(actual.noRefinementRoot).toMatchInlineSnapshot(
          `"ais-RefinementList--noRefinement noRefinementRoot"`
        );
        expect(actual.list).toMatchInlineSnapshot(
          `"ais-RefinementList-list list"`
        );
        expect(actual.item).toMatchInlineSnapshot(
          `"ais-RefinementList-item item"`
        );
        expect(actual.selectedItem).toMatchInlineSnapshot(
          `"ais-RefinementList-item--selected selectedItem"`
        );
        expect(actual.searchBox).toMatchInlineSnapshot(
          `"ais-RefinementList-searchBox searchBox"`
        );
        expect(actual.label).toMatchInlineSnapshot(
          `"ais-RefinementList-label label"`
        );
        expect(actual.checkbox).toMatchInlineSnapshot(
          `"ais-RefinementList-checkbox checkbox"`
        );
        expect(actual.labelText).toMatchInlineSnapshot(
          `"ais-RefinementList-labelText labelText"`
        );
        expect(actual.count).toMatchInlineSnapshot(
          `"ais-RefinementList-count count"`
        );
        expect(actual.noResults).toMatchInlineSnapshot(
          `"ais-RefinementList-noResults noResults"`
        );
        expect(actual.showMore).toMatchInlineSnapshot(
          `"ais-RefinementList-showMore showMore"`
        );
        expect(actual.disabledShowMore).toMatchInlineSnapshot(
          `"ais-RefinementList-showMore--disabled disabledShowMore"`
        );
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

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('show more', () => {
    it('should return a configuration with the same top-level limit value (default value)', () => {
      const opts = {
        container,
        attribute: 'attribute',
        limit: 1,
      };
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(1);
    });

    it('should return a configuration with the highest limit value (custom value)', () => {
      const opts = {
        container,
        attribute: 'attribute',
        limit: 1,
        showMore: true,
        showMoreLimit: 99,
      };
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(opts.showMoreLimit);
    });

    it('should not accept a show more limit that is < limit', () => {
      const opts = {
        container,
        attribute: 'attribute',
        limit: 100,
        showMore: true,
        showMoreLimit: 1,
      };
      expect(() => refinementList(opts)).toThrow();
    });
  });
});
