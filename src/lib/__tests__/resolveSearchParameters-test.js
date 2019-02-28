import { SearchParameters } from 'algoliasearch-helper';
import * as connectors from '../../connectors';
import { resolveSingleLeafWidgetDriven } from '../resolveSearchParametersWidgetDriven';

const configure = widgetParams => ({
  getWidgetState(uiState) {
    return {
      ...uiState,
      configure: widgetParams,
    };
  },
  getWidgetSearchParameters(searchParameters, { uiState }) {
    return Object.entries(uiState.configure).reduce(
      (acc, [key, value]) => acc.setQueryParameter(key, value),
      searchParameters
    );
  },
});

const searchBox = connectors.connectSearchBox(() => {});
const hits = connectors.connectHits(() => {});
const refinementList = connectors.connectRefinementList(() => {});
const refinementListWithSearchParameters = connectors.connectRefinementListWithSearchParameters(
  () => {}
);

[resolveSingleLeafWidgetDriven].forEach(resolver => {
  const innerRefinementList =
    resolver === resolveSingleLeafWidgetDriven
      ? refinementListWithSearchParameters
      : refinementList;

  it('correctly resolve a new instance of SP', () => {
    const level0 = {
      widgets: [searchBox()],
      state: new SearchParameters(),
    };

    const level1 = {
      widgets: [hits()],
      state: new SearchParameters(),
    };

    const actual = resolver(level0, level1);

    expect(actual).toEqual(expect.any(SearchParameters));
  });

  it('correctly merge SP without default value', () => {
    const level0 = {
      widgets: [configure({ hitsPerPage: 5 }), searchBox()],
      state: new SearchParameters(),
    };

    const level1 = {
      widgets: [configure({ hitsPerPage: 10 }), hits()],
      state: new SearchParameters(),
    };

    const level2 = {
      widgets: [configure({ hitsPerPage: 15 }), hits()],
      state: new SearchParameters(),
    };

    const actual = resolver(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParameters({
        hitsPerPage: 15,
      })
    );
  });

  if (resolver === resolveSingleLeafWidgetDriven) {
    // Test case for the widget driven approach
    it('ignores SP sets directly with the helper', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters({
          hitsPerPage: 5,
        }),
      };

      const level1 = {
        widgets: [hits()],
        state: new SearchParameters({
          hitsPerPage: 10,
        }),
      };

      const level2 = {
        widgets: [hits()],
        state: new SearchParameters({
          hitsPerPage: 15,
        }),
      };

      const actual = resolver(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          hitsPerPage: undefined,
        })
      );
    });
  }

  // if () {

  // }

  describe('correctly merge SP with default value', () => {
    it('with value inherit from the top level', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters().setQuery('Hello world'),
      };

      const level1 = {
        widgets: [hits()],
        state: new SearchParameters(),
      };

      const level2 = {
        widgets: [hits()],
        state: new SearchParameters(),
      };

      const actual = resolver(level0, level1, level2);

      expect(actual).toEqual(new SearchParameters().setQuery('Hello world'));
    });

    it('with value override by the sub level', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters().setQuery('Hello'),
      };

      const level1 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters().setQuery('Hello world'),
      };

      const level2 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters().setQuery('Hello world !!!'),
      };

      const actual = resolver(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters().setQuery('Hello world !!!')
      );
    });
  });

  describe('correctly merge SP with complex structure', () => {
    it('with value inherit from the top level', () => {
      const categories = innerRefinementList({ attribute: 'categories' });
      const brands = innerRefinementList({ attribute: 'brands' });

      const level0 = {
        widgets: [searchBox(), categories],
        state: new SearchParameters({
          query: 'Hello world',
          // maxValuesPerFacet: 10,
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [hits()],
        state: new SearchParameters({}),
      };

      const level2 = {
        widgets: [hits(), brands],
        state: new SearchParameters({
          disjunctiveFacets: ['brands'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const actual = resolver(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          query: 'Hello world',
          maxValuesPerFacet: 10,
          disjunctiveFacets: ['categories', 'brands'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
            brands: ['Apple'],
          },
        })
      );
    });

    it('with value override by the sub level', () => {
      const categories = innerRefinementList({ attribute: 'categories' });
      const brands = innerRefinementList({ attribute: 'brands', limit: 50 });
      const colors = innerRefinementList({ attribute: 'colors' });

      const level0 = {
        widgets: [searchBox(), categories],
        state: new SearchParameters({
          query: 'Hello',
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [hits(), brands],
        state: new SearchParameters({
          // maxValuesPerFacet: 50,
          disjunctiveFacets: ['brands'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const level2 = {
        widgets: [searchBox(), hits(), colors],
        state: new SearchParameters({
          query: 'Hello world',
          disjunctiveFacets: ['colors'],
          disjunctiveFacetsRefinements: {
            colors: ['Blue'],
          },
        }),
      };

      const actual = resolver(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          query: 'Hello world',
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands', 'colors'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
            brands: ['Apple'],
            colors: ['Blue'],
          },
        })
      );
    });
  });
});
