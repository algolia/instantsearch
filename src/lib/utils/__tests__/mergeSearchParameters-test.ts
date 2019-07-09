import algoliasearchHelper from 'algoliasearch-helper';
import merge from '../mergeSearchParameters';

describe('mergeSearchParameters', () => {
  it('overrides non-managed parameters', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        // Inherit
        hitsPerPage: 2,
        attributesToSnippet: ['description'],
        // Overridden
        query: 'Samsung',
        attributesToHighlight: ['name'],
      }),
      algoliasearchHelper.SearchParameters.make({
        // hitsPerPage: 2,
        // attributesToSnippet: ['description'],
        query: 'Apple',
        attributesToHighlight: ['name', 'author'],
      }),
      algoliasearchHelper.SearchParameters.make({
        // hitsPerPage: 2,
        // attributesToSnippet: ['description'],
        // attributesToHighlight: ['name', 'author'],
        query: 'Apple iPhone',
        distinct: true,
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        hitsPerPage: 2,
        attributesToSnippet: ['description'],
        attributesToHighlight: ['name', 'author'],
        query: 'Apple iPhone',
        distinct: true,
      })
    );
  });

  it('merges `facets` parameters', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand'],
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['categories'],
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'colors'],
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'categories', 'colors'],
      })
    );
  });

  it('merges `disjunctiveFacets` parameters', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand'],
      }),
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['categories'],
      }),
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand', 'colors'],
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand', 'categories', 'colors'],
      })
    );
  });

  it('merges `facetsRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand'],
        facetsRefinements: {
          brand: ['Samsung'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['categories'],
        facetsRefinements: {
          categories: ['TVs'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'colors'],
        facetsRefinements: {
          brand: ['Apple'],
          colors: ['Red'],
        },
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'categories', 'colors'],
        facetsRefinements: {
          brand: ['Apple'],
          categories: ['TVs'],
          colors: ['Red'],
        },
      })
    );
  });

  it('merges `facetsExcludes` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand'],
        facetsExcludes: {
          brand: ['Samsung'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['categories'],
        facetsExcludes: {
          categories: ['TVs'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'colors'],
        facetsExcludes: {
          brand: ['Apple'],
          colors: ['Red'],
        },
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        facets: ['brand', 'categories', 'colors'],
        facetsExcludes: {
          brand: ['Apple'],
          categories: ['TVs'],
          colors: ['Red'],
        },
      })
    );
  });

  it('merges `disjunctiveFacetsRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Samsung'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['categories'],
        disjunctiveFacetsRefinements: {
          categories: ['TVs'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand', 'colors'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple'],
          colors: ['Red'],
        },
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        disjunctiveFacets: ['brand', 'categories', 'colors'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple'],
          categories: ['TVs'],
          colors: ['Red'],
        },
      })
    );
  });

  it('merges `numericRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        numericRefinements: {
          price: {
            '>=': [10],
            '<=': [100],
          },
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        numericRefinements: {
          rating: {
            '>=': [3],
          },
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        numericRefinements: {
          price: {
            '>': [100],
          },
          vote: {
            '>=': [50],
          },
        },
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        numericRefinements: {
          price: {
            '>': [100],
          },
          rating: {
            '>=': [3],
          },
          vote: {
            '>=': [50],
          },
        },
      })
    );
  });

  it('merges `tagRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        tagRefinements: ['brand'],
      }),
      algoliasearchHelper.SearchParameters.make({
        tagRefinements: ['categories'],
      }),
      algoliasearchHelper.SearchParameters.make({
        tagRefinements: ['brand', 'colors'],
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        tagRefinements: ['brand', 'categories', 'colors'],
      })
    );
  });

  it('merges `hierarchicalFacets` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['categories.lvl0', 'categories.lvl1'],
          },
        ],
      }),
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'department',
            attributes: ['department.lvl0', 'department.lvl1'],
          },
        ],
      }),
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['topLevelCategories', 'subLevelCategories'],
          },
          {
            name: 'folders',
            attributes: ['folders.lvl0', 'folders.lvl1'],
          },
        ],
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['topLevelCategories', 'subLevelCategories'],
          },
          {
            name: 'department',
            attributes: ['department.lvl0', 'department.lvl1'],
          },
          {
            name: 'folders',
            attributes: ['folders.lvl0', 'folders.lvl1'],
          },
        ],
      })
    );
  });

  it('merges `hierarchicalFacetsRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['categories.lvl0', 'categories.lvl1'],
          },
        ],
        hierarchicalFacetsRefinements: {
          categories: ['Appliances > Fans'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'department',
            attributes: ['department.lvl0', 'department.lvl1'],
          },
        ],
        hierarchicalFacetsRefinements: {
          department: ['Engineering > Squad'],
        },
      }),
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['topLevelCategories', 'subLevelCategories'],
          },
          {
            name: 'folders',
            attributes: ['folders.lvl0', 'folders.lvl1'],
          },
        ],
        hierarchicalFacetsRefinements: {
          categories: ['Cell Phones > Prepaid Phones'],
          folders: ['Music > Artist > Mike Miller'],
        },
      })
    );

    expect(actual).toEqual(
      algoliasearchHelper.SearchParameters.make({
        hierarchicalFacets: [
          {
            name: 'categories',
            attributes: ['topLevelCategories', 'subLevelCategories'],
          },
          {
            name: 'department',
            attributes: ['department.lvl0', 'department.lvl1'],
          },
          {
            name: 'folders',
            attributes: ['folders.lvl0', 'folders.lvl1'],
          },
        ],
        hierarchicalFacetsRefinements: {
          categories: ['Cell Phones > Prepaid Phones'],
          department: ['Engineering > Squad'],
          folders: ['Music > Artist > Mike Miller'],
        },
      })
    );
  });
});
