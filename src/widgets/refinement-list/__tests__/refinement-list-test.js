import { render } from 'preact-compat';
import { SearchParameters } from 'algoliasearch-helper';
import refinementList from '../refinement-list';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

const instantSearchInstance = { templatesConfig: {} };

describe('refinementList()', () => {
  let container;
  let options;
  let widget;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
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
          searchableRoot: 'searchableRoot',
          searchableForm: 'searchableForm',
          searchableInput: 'searchableInput',
          searchableSubmit: 'searchableSubmit',
          searchableSubmitIcon: 'searchableSubmitIcon',
          searchableReset: 'searchableReset',
          searchableResetIcon: 'searchableResetIcon',
          searchableLoadingIndicator: 'searchableLoadingIndicator',
          searchableLoadingIcon: 'searchableLoadingIcon',
        };

        renderWidget({ cssClasses });
        const actual = render.mock.calls[0][0].props.cssClasses;

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
        expect(actual.searchable.root).toMatchInlineSnapshot(
          `"ais-SearchBox searchableRoot"`
        );
        expect(actual.searchable.form).toMatchInlineSnapshot(
          `"ais-SearchBox-form searchableForm"`
        );
        expect(actual.searchable.input).toMatchInlineSnapshot(
          `"ais-SearchBox-input searchableInput"`
        );
        expect(actual.searchable.submit).toMatchInlineSnapshot(
          `"ais-SearchBox-submit searchableSubmit"`
        );
        expect(actual.searchable.submitIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-submitIcon searchableSubmitIcon"`
        );
        expect(actual.searchable.reset).toMatchInlineSnapshot(
          `"ais-SearchBox-reset searchableReset"`
        );
        expect(actual.searchable.resetIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-resetIcon searchableResetIcon"`
        );
        expect(actual.searchable.loadingIndicator).toMatchInlineSnapshot(
          `"ais-SearchBox-loadingIndicator searchableLoadingIndicator"`
        );
        expect(actual.searchable.loadingIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-loadingIcon searchableLoadingIcon"`
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

      expect(render.mock.calls[0][0]).toMatchSnapshot();
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
      const partialConfig = wdgt.getConfiguration(new SearchParameters({}));
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
      const partialConfig = wdgt.getConfiguration(new SearchParameters({}));
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
