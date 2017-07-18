import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectToggle from '../connectToggle.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectToggle', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectToggle(rendering);

    const attributeName = 'isShippingFree';
    const label = 'Free shipping?';
    const widget = makeWidget({
      attributeName,
      label,
    });

    const config = widget.getConfiguration();
    expect(config).toEqual({
      disjunctiveFacets: [attributeName],
    });

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { value, widgetParams } = rendering.lastCall.args[0];
      expect(value).toEqual({
        name: label,
        count: null,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 0,
        },
      });

      expect(widgetParams).toEqual({
        attributeName,
        label,
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { value } = rendering.lastCall.args[0];
      expect(value).toEqual({
        name: label,
        count: 45,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 85,
        },
      });
    }
  });

  it('Provides a function to add/remove a facet value', () => {
    const rendering = sinon.stub();
    const makeWidget = connectToggle(rendering);

    const attributeName = 'isShippingFree';
    const label = 'Free shipping?';
    const widget = makeWidget({
      attributeName,
      label,
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration());
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual(
        undefined
      );
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: label,
        count: null,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual(
        undefined
      );
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual(
        undefined
      );
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: label,
        count: 45,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 85,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: label,
        count: 85,
        isRefined: true,
        onFacetValue: {
          name: label,
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 85,
        },
      });
      refine(value);
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual(
        undefined
      );
    }
  });

  it('Provides a function to toggle between two values', () => {
    const rendering = sinon.stub();
    const makeWidget = connectToggle(rendering);

    const attributeName = 'isShippingFree';
    const label = 'Free shipping?';
    const widget = makeWidget({
      attributeName,
      label,
      values: {
        on: 'true',
        off: 'false',
      },
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration());
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'false',
      ]);
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;

      expect(value).toEqual({
        name: label,
        count: null,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          name: label,
          isRefined: true,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'false',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 40,
        },
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'false',
      ]);
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: label,
        // the value is the one that is not selected
        count: 45,
        isRefined: false,
        onFacetValue: {
          name: label,
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          name: label,
          isRefined: true,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
        {
          facets: {
            isShippingFree: {
            'true': 45, // eslint-disable-line
            'false': 40, // eslint-disable-line
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'true',
      ]);
      const renderOptions = rendering.lastCall.args[0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: label,
        count: 40,
        isRefined: true,
        onFacetValue: {
          name: label,
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          name: label,
          isRefined: false,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attributeName]).toEqual([
        'false',
      ]);
    }
  });
});
