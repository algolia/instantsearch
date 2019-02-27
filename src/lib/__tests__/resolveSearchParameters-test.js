import { SearchParameters } from 'algoliasearch-helper';
import * as connectors from '../../connectors';
import { resolveSingleLeaf } from '../resolveSearchParameters';

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
const refinementList = connectors.connectRefinementList(() => {});
const hits = connectors.connectHits(() => {});

it('correctly resolve a new instance of SP', () => {
  const level0 = {
    widgets: [searchBox()],
    state: new SearchParameters(),
  };

  const level1 = {
    widgets: [hits()],
    state: new SearchParameters(),
  };

  const actual = resolveSingleLeaf(level0, level1);

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

  const actual = resolveSingleLeaf(level0, level1, level2);

  expect(actual).toEqual(
    new SearchParameters({
      hitsPerPage: 15,
    })
  );
});

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

    const actual = resolveSingleLeaf(level0, level1, level2);

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

    const actual = resolveSingleLeaf(level0, level1, level2);

    expect(actual).toEqual(new SearchParameters().setQuery('Hello world !!!'));
  });
});

describe('correctly merge SP with complex structure', () => {
  it('with value inherit from the top level', () => {
    const categories = refinementList({ attribute: 'categories' });
    const brands = refinementList({ attribute: 'brands' });

    const level0 = {
      widgets: [searchBox(), categories],
      state: new SearchParameters()
        .setQuery('Hello world')
        .addDisjunctiveFacet('categories')
        .addDisjunctiveFacetRefinement('categories', 'iPhone'),
    };

    const level1 = {
      widgets: [hits()],
      state: new SearchParameters({}),
    };

    const level2 = {
      widgets: [hits(), brands],
      state: new SearchParameters()
        .addDisjunctiveFacet('brands')
        .addDisjunctiveFacetRefinement('brands', 'Apple'),
    };

    const actual = resolveSingleLeaf(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParameters()
        .setQuery('Hello world')
        .addDisjunctiveFacet('categories')
        .addDisjunctiveFacetRefinement('categories', 'iPhone')
        .addDisjunctiveFacet('brands')
        .addDisjunctiveFacetRefinement('brands', 'Apple')
        .setQueryParameter('maxValuesPerFacet', 10)
    );
  });

  it('with value override by the sub level', () => {
    const categories = refinementList({ attribute: 'categories' });
    const brands = refinementList({ attribute: 'brands', limit: 50 });
    const colors = refinementList({ attribute: 'colors' });

    const level0 = {
      widgets: [searchBox(), categories],
      state: new SearchParameters()
        .setQuery('Hello')
        .addDisjunctiveFacet('categories')
        .addDisjunctiveFacetRefinement('categories', 'iPhone'),
    };

    const level1 = {
      widgets: [hits(), brands],
      state: new SearchParameters()
        .addDisjunctiveFacet('brands')
        .addDisjunctiveFacetRefinement('brands', 'Apple'),
    };

    const level2 = {
      widgets: [searchBox(), hits(), colors],
      state: new SearchParameters()
        .setQuery('Hello world !!!')
        .addDisjunctiveFacet('colors')
        .addDisjunctiveFacetRefinement('colors', 'Blue'),
    };

    const actual = resolveSingleLeaf(level0, level1, level2);

    expect(actual).toEqual(
      new SearchParameters()
        .setQuery('Hello world !!!')
        .addDisjunctiveFacet('categories')
        .addDisjunctiveFacetRefinement('categories', 'iPhone')
        .addDisjunctiveFacet('brands')
        .addDisjunctiveFacetRefinement('brands', 'Apple')
        .addDisjunctiveFacet('colors')
        .addDisjunctiveFacetRefinement('colors', 'Blue')
        .setQueryParameter('maxValuesPerFacet', 50)
    );
  });

  // it('with value deduplicate', () => {
  //   const level0 = new SearchParameters({
  //     disjunctiveFacets: ['categories'],
  //   });

  //   const level1 = new SearchParameters({
  //     disjunctiveFacets: ['categories'],
  //   });

  //   const actual = merge(level0, level1);

  //   expect(actual).toEqual(
  //     new SearchParameters({
  //       disjunctiveFacets: ['categories'],
  //     })
  //   );
  // });
});
