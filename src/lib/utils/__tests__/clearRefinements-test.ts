import clearRefinements from '../clearRefinements';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import { SearchClient } from '../../../types';

const initHelperWithRefinements = () => {
  const helper = algoliasearchHelper({} as SearchClient, 'index', {
    facets: ['conjFacet'],
    disjunctiveFacets: ['disjFacet'],
  });

  helper.toggleRefinement('conjFacet', 'value');
  helper.toggleRefinement('disjFacet', 'otherValue');
  helper.toggleTag('taG');

  helper.setQuery('a query');

  return helper;
};

describe('clearRefinements', () => {
  test('with hierarchical refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          hierarchicalFacets: [
            { name: 'attr', attributes: ['attr'], separator: '>' },
          ],
          hierarchicalFacetsRefinements: {
            attr: ['text'],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          { name: 'attr', attributes: ['attr'], separator: '>' },
        ],
        hierarchicalFacetsRefinements: { attr: [] },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty hierarchical refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          hierarchicalFacets: [
            { name: 'attr', attributes: ['attr'], separator: '>' },
          ],
          hierarchicalFacetsRefinements: {
            attr: [],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          { name: 'attr', attributes: ['attr'], separator: '>' },
        ],
        hierarchicalFacetsRefinements: { attr: [] },
        index: '',
        page: 0,
      })
    );
  });

  test('with disjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          disjunctiveFacets: ['attr'],
          disjunctiveFacetsRefinements: {
            attr: ['text'],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        disjunctiveFacetsRefinements: { attr: [] },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty disjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          disjunctiveFacets: ['attr'],
          disjunctiveFacetsRefinements: {
            attr: [],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        disjunctiveFacetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with conjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          facets: ['attr'],
          facetsRefinements: {
            attr: ['text'],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        facets: ['attr'],
        facetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty conjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          facets: ['attr'],
          facetsRefinements: {
            attr: [],
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        facets: ['attr'],
        facetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with numeric refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          disjunctiveFacets: ['attr'],
          numericRefinements: {
            attr: {
              '=': [42],
            },
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        numericRefinements: {
          attr: {
            '=': [],
          },
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty numeric refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          disjunctiveFacets: ['attr'],
          numericRefinements: {
            attr: {
              '=': [],
            },
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        numericRefinements: {
          attr: {
            '=': [],
          },
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with multiple numeric refinements', () => {
    expect(
      clearRefinements({
        helper: algoliasearchHelper({} as SearchClient, '', {
          disjunctiveFacets: ['attr'],
          numericRefinements: {
            attr: {
              '=': [42],
              '>=': [100, 150],
            },
          },
        }),
        attributesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        numericRefinements: {
          attr: {
            '=': [],
            '>=': [],
          },
        },
        index: '',
        page: 0,
      })
    );
  });

  test('does not clear anything without attributes', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });

  test('can clear all the parameters defined in the list', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
      attributesToClear: ['conjFacet'],
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual({
      conjFacet: [],
    });
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });

  test('can clear the query alone', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
      attributesToClear: ['query'],
    });

    expect(finalState.query).toBe('');
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });
});
