import { SearchParameters } from 'algoliasearch-helper';
import * as connectors from '../../connectors';
import { SearchParametersWithoutDefaults } from '../stateManager';
import { resolveSingleLeafWidgetDriven } from '../resolveSearchParametersWidgetDriven';
import { resolveSingleLeafMerge } from '../resolveSearchParametersWithMerge';

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
const refinementListWithSearchParameters = connectors.connectRefinementListWithSearchParameters(
  () => {}
);

describe('- WidgetDriven', () => {
  it('correctly resolve a new instance of SP', () => {
    const level0 = {
      widgets: [searchBox()],
      state: new SearchParameters(),
    };

    const level1 = {
      widgets: [hits()],
      state: new SearchParameters(),
    };

    const actual = resolveSingleLeafWidgetDriven(level0, level1);

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

    const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParameters({
        hitsPerPage: 15,
      })
    );
  });

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

    const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParameters({
        hitsPerPage: undefined,
      })
    );
  });

  describe('correctly merge SP with default value', () => {
    it('with value inherit from the top level', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters({
          query: 'Hello world',
        }),
      };

      const level1 = {
        widgets: [hits()],
        state: new SearchParameters(),
      };

      const level2 = {
        widgets: [hits()],
        state: new SearchParameters(),
      };

      const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

      expect(actual).toEqual(new SearchParameters().setQuery('Hello world'));
    });

    it('with refined value override by the sub level', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters({
          query: 'Hello',
        }),
      };

      const level1 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters({
          query: 'Hello world',
        }),
      };

      const level2 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters({
          query: 'Hello world !!!',
        }),
      };

      const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters().setQuery('Hello world !!!')
      );
    });

    it('with default value override by the sub level', () => {
      const level0 = {
        widgets: [searchBox()],
        state: new SearchParameters({
          query: 'Hello',
        }),
      };

      const level1 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters(),
      };

      const level2 = {
        widgets: [searchBox(), hits()],
        state: new SearchParameters(),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          query: '',
        })
      );
    });
  });

  describe('correctly merge SP with complex structure', () => {
    it('with value inherit from the top level', () => {
      const categories = refinementListWithSearchParameters({
        attribute: 'categories',
      });

      const brands = refinementListWithSearchParameters({
        attribute: 'brands',
      });

      const level0 = {
        widgets: [searchBox(), categories],
        state: new SearchParameters({
          query: 'Hello world',
          // Simulate the `getConfiguration`
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
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['brands'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

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

    it('with refined value override by the sub level', () => {
      const categories = refinementListWithSearchParameters({
        attribute: 'categories',
      });

      const brands = refinementListWithSearchParameters({
        attribute: 'brands',
        limit: 50,
      });

      const colors = refinementListWithSearchParameters({
        attribute: 'colors',
      });

      const level0 = {
        widgets: [searchBox(), categories],
        state: new SearchParameters({
          query: 'Hello',
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [hits(), categories, brands],
        state: new SearchParameters({
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['categories', 'brands'],
          disjunctiveFacetsRefinements: {
            categories: ['iPad'],
            brands: ['Apple'],
          },
        }),
      };

      const level2 = {
        widgets: [searchBox(), hits(), colors],
        state: new SearchParameters({
          query: 'Hello world',
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['colors'],
          disjunctiveFacetsRefinements: {
            colors: ['Blue'],
          },
        }),
      };

      const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          query: 'Hello world',
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands', 'colors'],
          disjunctiveFacetsRefinements: {
            categories: ['iPad'],
            brands: ['Apple'],
            colors: ['Blue'],
          },
        })
      );
    });

    it('with default value override by the sub level', () => {
      const categories = refinementListWithSearchParameters({
        attribute: 'categories',
      });

      const brands = refinementListWithSearchParameters({
        attribute: 'brands',
        limit: 50,
      });

      const colors = refinementListWithSearchParameters({
        attribute: 'colors',
      });

      const level0 = {
        widgets: [searchBox(), categories],
        state: new SearchParameters({
          query: 'Hello',
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [hits(), brands, categories],
        state: new SearchParameters({
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['brands', 'categories'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const level2 = {
        widgets: [searchBox(), hits(), colors],
        state: new SearchParameters({
          query: 'Hello world',
          // Simulate the `getConfiguration`
          disjunctiveFacets: ['colors'],
          disjunctiveFacetsRefinements: {
            colors: ['Blue'],
          },
        }),
      };

      const actual = resolveSingleLeafWidgetDriven(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParameters({
          query: 'Hello world',
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands', 'colors'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
            colors: ['Blue'],
          },
        })
      );
    });
  });
});

describe('- Merge', () => {
  it('correctly resolve a new instance of SP', () => {
    const level0 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults(),
    };

    const level1 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults(),
    };

    const actual = resolveSingleLeafMerge(level0, level1);

    expect(actual).toEqual(expect.any(SearchParametersWithoutDefaults));
  });

  it('correctly merge SP without default value', () => {
    const level0 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({ hitsPerPage: 5 }),
    };

    const level1 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({ hitsPerPage: 10 }),
    };

    const level2 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({ hitsPerPage: 15 }),
    };

    const actual = resolveSingleLeafMerge(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParametersWithoutDefaults({
        hitsPerPage: 15,
      })
    );
  });

  it('correctly sets SP directly with the helper', () => {
    const level0 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({
        hitsPerPage: 5,
      }),
    };

    const level1 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({
        hitsPerPage: 10,
      }),
    };

    const level2 = {
      widgets: [],
      state: new SearchParametersWithoutDefaults({
        hitsPerPage: 15,
      }),
    };

    const actual = resolveSingleLeafMerge(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParametersWithoutDefaults({
        hitsPerPage: 15,
      })
    );
  });

  describe('correctly merge SP with default value', () => {
    it('with value inherit from the top level', () => {
      const level0 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world',
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults(),
      };

      const level2 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults(),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
          query: 'Hello world',
        })
      );
    });

    it('with refined value override by the sub level', () => {
      const level0 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello',
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world',
        }),
      };

      const level2 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world !!!',
        }),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
          query: 'Hello world !!!',
        })
      );
    });

    it('with default value override by the sub level', () => {
      const level0 = {
        widgets: [], // SearchBox with value
        state: new SearchParametersWithoutDefaults({
          // Does it breaks? Not sure.
          query: 'Hello',
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults(),
      };

      const level2 = {
        widgets: [], // SearchBox without value
        state: new SearchParametersWithoutDefaults({
          // Simulate the `getConfiguration` to fill a default value
          query: '',
        }),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
          query: '',
        })
      );
    });
  });

  describe('correctly merge SP with complex structure', () => {
    it('with value inherit from the top level', () => {
      const level0 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world',
          maxValuesPerFacet: 10,
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({}),
      };

      const level2 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          disjunctiveFacets: ['brands'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
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

    it('with refined value override by the sub level', () => {
      const level0 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello',
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands'],
          disjunctiveFacetsRefinements: {
            categories: ['iPad'],
            brands: ['Apple'],
          },
        }),
      };

      const level2 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world',
          disjunctiveFacets: ['colors'],
          disjunctiveFacetsRefinements: {
            colors: ['Blue'],
          },
        }),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
          query: 'Hello world',
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands', 'colors'],
          disjunctiveFacetsRefinements: {
            categories: ['iPad'],
            brands: ['Apple'],
            colors: ['Blue'],
          },
        })
      );
    });

    it('with default value override by the sub level', () => {
      const level0 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello',
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['iPhone'],
          },
        }),
      };

      const level1 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
          },
        }),
      };

      const level2 = {
        widgets: [],
        state: new SearchParametersWithoutDefaults({
          query: 'Hello world',
          disjunctiveFacets: ['colors'],
          disjunctiveFacetsRefinements: {
            colors: ['Blue'],
          },
        }),
      };

      const actual = resolveSingleLeafMerge(level0, level1, level2);

      expect(actual).toEqual(
        new SearchParametersWithoutDefaults({
          query: 'Hello world',
          maxValuesPerFacet: 50,
          disjunctiveFacets: ['categories', 'brands', 'colors'],
          disjunctiveFacetsRefinements: {
            brands: ['Apple'],
            colors: ['Blue'],
          },
        })
      );
    });
  });
});
