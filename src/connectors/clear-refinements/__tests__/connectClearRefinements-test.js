import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectClearRefinements from '../connectClearRefinements';

describe('connectClearRefinements', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectClearRefinements()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/clear-refinements/js/#connector"
`);
    });

    it('throws with both `includedAttributes` and `excludedAttributes`', () => {
      const customClearRefinements = connectClearRefinements(() => {});

      expect(() => {
        customClearRefinements({
          includedAttributes: ['query'],
          excludedAttributes: ['brand'],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The options \`includedAttributes\` and \`excludedAttributes\` cannot be used together.

See documentation: https://www.algolia.com/doc/api-reference/widgets/clear-refinements/js/#connector"
`);
    });
  });

  describe('Lifecycle', () => {
    it('renders during init and render', () => {
      const helper = jsHelper({});
      helper.search = () => {};
      // test that the dummyRendering is called with the isFirstRendering
      // flag set accordingly
      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        foo: 'bar', // dummy param to test `widgetParams`
      });

      expect(widget.getConfiguration).toBe(undefined);
      // test if widget is not rendered yet at this point
      expect(rendering).toHaveBeenCalledTimes(0);

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      // test that rendering has been called during init with isFirstRendering = true
      expect(rendering).toHaveBeenCalledTimes(1);
      // test if isFirstRendering is true during init
      expect(rendering.mock.calls[0][1]).toBe(true);

      const firstRenderingOptions = rendering.mock.calls[0][0];
      expect(firstRenderingOptions.hasRefinements).toBe(false);
      expect(firstRenderingOptions.widgetParams).toEqual({
        foo: 'bar', // dummy param to test `widgetParams`
      });

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // test that rendering has been called during init with isFirstRendering = false
      expect(rendering).toHaveBeenCalledTimes(2);
      expect(rendering.mock.calls[1][1]).toBe(false);

      const secondRenderingOptions = rendering.mock.calls[1][0];
      expect(secondRenderingOptions.hasRefinements).toBe(false);
    });
  });

  describe('Instance options', () => {
    it('provides a function to clear the refinements', () => {
      const helper = jsHelper({}, '', {
        facets: ['myFacet'],
      });
      helper.search = () => {};
      helper.setQuery('not empty');
      helper.toggleRefinement('myFacet', 'myValue');

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('not empty');
      const initClearMethod = rendering.mock.calls[0][0].refine;
      initClearMethod();

      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('not empty');

      helper.toggleRefinement('myFacet', 'someOtherValue');

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('not empty');
      const renderClearMethod = rendering.mock.calls[1][0].refine;
      renderClearMethod();
      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('not empty');
    });

    it('provides a function to clear the refinements and the query', () => {
      const helper = jsHelper({}, '', {
        facets: ['myFacet'],
      });
      helper.search = () => {};
      helper.setQuery('a query');
      helper.toggleRefinement('myFacet', 'myValue');

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ excludedAttributes: [] });

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('a query');
      const initClearMethod = rendering.mock.calls[0][0].refine;
      initClearMethod();

      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('');

      helper.toggleRefinement('myFacet', 'someOtherValue');
      helper.setQuery('another query');

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('another query');
      const renderClearMethod = rendering.mock.calls[1][0].refine;
      renderClearMethod();
      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('');
    });

    it('gets refinements from results', () => {
      const helper = jsHelper({}, undefined, {
        facets: ['aFacet'],
      });
      helper.toggleRefinement('aFacet', 'some value');
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(true);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
    });

    it('with query not excluded and not empty has refinements', () => {
      // test if the values sent to the rendering function
      // are consistent with the search state
      const helper = jsHelper({}, undefined, {
        facets: ['aFacet'],
      });
      helper.setQuery('no empty');
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: [],
      });

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(true);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
    });

    it('with query not excluded and empty has no refinements', () => {
      const helper = jsHelper({}, undefined, {
        facets: ['aFacet'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: [],
      });

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    });

    it('without includedAttributes or excludedAttributes and with a query has no refinements', () => {
      const helper = jsHelper({});
      helper.setQuery('not empty');
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    });

    it('includes only includedAttributes', () => {
      const helper = jsHelper({}, '', {
        facets: ['facet1', 'facet2'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ includedAttributes: ['facet1'] });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value')
        .setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);

      const refine = rendering.mock.calls[0][0].refine;
      refine();
      widget.render({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(false);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    });

    it('includes only includedAttributes (with query)', () => {
      const helper = jsHelper({}, '', {
        facets: ['facet1'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ includedAttributes: ['facet1', 'query'] });

      helper.toggleRefinement('facet1', 'value').setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.getState().query).toBe('not empty');

      const refine = rendering.mock.calls[0][0].refine;
      refine();
      widget.render({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(false);
      expect(helper.getState().query).toBe('');
      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    });

    it('excludes excludedAttributes', () => {
      const helper = jsHelper({}, '', {
        facets: ['facet1', 'facet2'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: ['facet2'],
      });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value');

      {
        helper.setQuery('not empty');

        widget.init({
          helper,
          state: helper.state,
          createURL: () => '#',
        });

        expect(helper.hasRefinements('facet1')).toBe(true);
        expect(helper.hasRefinements('facet2')).toBe(true);

        const refine = rendering.mock.calls[0][0].refine;
        refine();

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);

        expect(rendering.mock.calls[0][0].hasRefinements).toBe(true);
      }

      {
        // facet has not been cleared and it is still refined with value
        helper.setQuery('not empty');

        widget.render({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [{}]),
          createURL: () => '#',
        });

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);

        const refine = rendering.mock.calls[1][0].refine;
        refine();

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);
      }
    });

    describe('transformItems is called', () => {
      const helper = jsHelper({}, '', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = () => {};

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        includedAttributes: ['facet2', 'facet3', 'query'],
        transformItems: items =>
          items.filter(
            attribute => attribute === 'query' || attribute === 'facet3'
          ),
      });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value')
        .toggleRefinement('facet3', 'value')
        .setQuery('not empty');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(helper.hasRefinements('facet3')).toBe(true);
      expect(helper.getState().query).toBe('not empty');

      const refine = rendering.mock.calls[0][0].refine;
      refine();
      widget.render({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(helper.hasRefinements('facet3')).toBe(false);
      expect(helper.getState().query).toBe('');
      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
    });

    describe('createURL', () => {
      it('consistent with the list of excludedAttributes', () => {
        const helper = jsHelper({}, '', {
          facets: ['facet', 'otherFacet'],
        });
        helper.search = () => {};

        const rendering = jest.fn();
        const makeWidget = connectClearRefinements(rendering);
        const widget = makeWidget({
          excludedAttributes: ['facet'],
        });

        helper.toggleRefinement('facet', 'value');
        helper.toggleRefinement('otherFacet', 'value');

        {
          helper.setQuery('not empty');

          widget.init({
            helper,
            state: helper.state,
            createURL: opts => opts,
          });

          const { createURL, refine } = rendering.mock.calls[0][0];

          // The state represented by the URL should be equal to a state
          // after refining.
          const createURLState = createURL();
          refine();
          const stateAfterRefine = helper.state;

          expect(createURLState).toEqual(stateAfterRefine);
        }

        {
          widget.render({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [{}]),
            createURL: () => '#',
          });

          const { createURL, refine } = rendering.mock.calls[1][0];

          const createURLState = createURL();
          refine();
          const stateAfterRefine = helper.state;

          expect(createURLState).toEqual(stateAfterRefine);
        }
      });
    });
  });
});
