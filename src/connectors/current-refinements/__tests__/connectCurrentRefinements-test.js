import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectCurrentRefinements from '../connectCurrentRefinements.js';

describe('connectCurrentRefinements', () => {
  describe('Usage', () => {
    it('throws if given both `includedAttributes` and `excludedAttributes`', () => {
      const customCurrentRefinements = connectCurrentRefinements(() => {});

      expect(
        customCurrentRefinements.bind(null, {
          includedAttributes: ['query'],
          excludedAttributes: ['brand'],
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`includedAttributes\` and \`excludedAttributes\` cannot be used together."`
      );
    });
  });

  describe('Lifecycle', () => {
    it('renders during init and render', () => {
      const helper = jsHelper({});
      helper.search = () => {};
      // test that the dummyRendering is called with the isFirstRendering
      // flag set accordingly
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({
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
      expect(firstRenderingOptions.refinements).toEqual([]);
      expect(firstRenderingOptions.widgetParams).toEqual({
        foo: 'bar',
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

      const secondRenderingOptions = rendering.mock.calls[0][0];
      expect(secondRenderingOptions.refinements).toEqual([]);
      expect(secondRenderingOptions.widgetParams).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('Widget options', () => {
    let helper;

    beforeEach(() => {
      helper = jsHelper({}, '', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = () => {};
    });

    it('includes all attributes by default except the query', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({});

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .addFacetRefinement('facet3', 'facetValue3')
        .setQuery('query');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });
      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'facet2',
        }),
        expect.objectContaining({
          attribute: 'facet3',
        }),
      ]);
    });

    it('includes only the `includedAttributes`', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['facet1', 'query'],
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .setQuery('query');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });
      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'query',
        }),
      ]);
    });

    it('does not include query if empty', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['query'],
      });

      helper.setQuery('');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });
      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([]);
    });

    it('does not include query if whitespaces', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['query'],
      });

      helper.setQuery(' ');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });
      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([]);
    });

    it('excludes the `excludedAttributes` (and overrides the default ["query"])', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        excludedAttributes: ['facet2'],
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .setQuery('query');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });
      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'query',
        }),
      ]);
    });

    it('transformItems is applied', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        transformItems: items =>
          items.map(item => ({
            ...item,
            transformed: true,
          })),
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .addFacetRefinement('facet3', 'facetValue3');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
          transformed: true,
        }),
        expect.objectContaining({
          attribute: 'facet2',
          transformed: true,
        }),
        expect.objectContaining({
          attribute: 'facet3',
          transformed: true,
        }),
      ]);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      expect(rendering.mock.calls[0][0].refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
          transformed: true,
        }),
        expect.objectContaining({
          attribute: 'facet2',
          transformed: true,
        }),
        expect.objectContaining({
          attribute: 'facet3',
          transformed: true,
        }),
      ]);
    });
  });

  describe('Rendering options', () => {
    let helper;

    beforeEach(() => {
      helper = jsHelper({}, '', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = () => {};
    });

    it('provides a `refine` function', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements();

      helper.addFacetRefinement('facet1', 'facetValue');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const firstRenderingOptions = rendering.mock.calls[0][0];
      const [refinement] = firstRenderingOptions.refinements;
      expect(typeof firstRenderingOptions.refine).toBe('function');

      firstRenderingOptions.refine(refinement.items[0]);
      expect(helper.hasRefinements('facet1')).toBe(false);

      helper.addFacetRefinement('facet1', 'facetValue');

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const secondRenderingOptions = rendering.mock.calls[1][0];
      const [otherRefinement] = secondRenderingOptions.refinements;
      expect(typeof secondRenderingOptions.refine).toBe('function');

      secondRenderingOptions.refine(otherRefinement.items[0]);
      expect(helper.hasRefinements('facet1')).toBe(false);
    });

    it('provides a `createURL` function', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({});

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const firstRenderingOptions = rendering.mock.calls[0][0];
      expect(typeof firstRenderingOptions.createURL).toBe('function');

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const secondRenderingOptions = rendering.mock.calls[1][0];
      expect(typeof secondRenderingOptions.createURL).toBe('function');
    });

    it('provides the refinements', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({});

      helper.addFacetRefinement('facet1', 'facetValue');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const firstRenderingOptions = rendering.mock.calls[0][0];
      expect(firstRenderingOptions.refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
      ]);

      helper
        .addFacetRefinement('facet1', 'facetValue')
        .addFacetRefinement('facet2', 'facetValue2');

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const secondRenderingOptions = rendering.mock.calls[1][0];
      expect(secondRenderingOptions.refinements).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'facet2',
        }),
      ]);
    });
  });
});
