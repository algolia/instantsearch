import { mergeSearchParameters } from '../merge-search-parameters';
import { SearchParameters, QueryParameters } from 'algoliasearch-helper';

it('overrides basic parameters', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        page: 1,
      }),
      new SearchParameters({
        page: 2,
      }),
      new SearchParameters({
        page: 3,
      })
    )
  ).toEqual(
    new SearchParameters({
      page: 3,
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        page: 1,
      }),
      new SearchParameters({
        page: 2,
      }),
      new SearchParameters({
        page: 3,
      }),
      new SearchParameters({
        page: 2,
      })
    )
  ).toEqual(
    new SearchParameters({
      page: 2,
    })
  );
});

it('merges basic parameters', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        page: 1,
      }),
      new SearchParameters({
        filters: 'zingo',
      }),
      new SearchParameters({
        getRankingInfo: false,
      })
    )
  ).toEqual(
    new SearchParameters({
      page: 1,
      filters: 'zingo',
      getRankingInfo: false,
    })
  );
});

it('overrides simple controlled parameters', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({ index: 'one' }),
      new SearchParameters({ index: 'two' })
    )
  ).toEqual(new SearchParameters({ index: 'two' }));
});

it('merges facets', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['dog'],
      }),
      new SearchParameters({
        facets: ['cat'],
      }),
      new SearchParameters({
        facets: ['hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['dog', 'cat', 'hound'],
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['dog'],
      }),
      new SearchParameters({
        facets: ['cat'],
      }),
      new SearchParameters({
        facets: ['dog', 'hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['dog', 'cat', 'hound'],
    })
  );
});

it('merges disjunctiveFacetsRefinements', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['color'],
        facetsRefinements: { color: ['red'] },
      }),
      new SearchParameters({
        facets: ['file'],
        facetsRefinements: { file: [] },
      }),
      new SearchParameters({
        facets: ['size'],
        facetsRefinements: { size: ['0'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['color', 'file', 'size'],
      facetsRefinements: { color: ['red'], size: ['0'] },
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['animal'],
        facetsRefinements: { animal: ['dog'] },
      }),
      new SearchParameters({
        facets: ['animal'],
        facetsRefinements: { animal: ['cat'] },
      }),
      new SearchParameters({
        facets: ['animal'],
        facetsRefinements: { animal: ['dog', 'hound'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['animal'],
      facetsRefinements: { animal: ['dog', 'cat', 'hound'] },
    })
  );
});

it('merges disjunctiveFacets', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        disjunctiveFacets: ['dog'],
      }),
      new SearchParameters({
        disjunctiveFacets: ['cat'],
      }),
      new SearchParameters({
        disjunctiveFacets: ['hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      disjunctiveFacets: ['dog', 'cat', 'hound'],
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        disjunctiveFacets: ['dog'],
      }),
      new SearchParameters({
        disjunctiveFacets: ['cat'],
      }),
      new SearchParameters({
        disjunctiveFacets: ['dog', 'hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      disjunctiveFacets: ['dog', 'cat', 'hound'],
    })
  );
});

it('merges disjunctiveFacetsRefinements', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        disjunctiveFacets: ['color'],
        disjunctiveFacetsRefinements: { color: ['red'] },
      }),
      new SearchParameters({
        disjunctiveFacets: ['file'],
        disjunctiveFacetsRefinements: { file: [] },
      }),
      new SearchParameters({
        disjunctiveFacets: ['size'],
        disjunctiveFacetsRefinements: { size: ['0'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      disjunctiveFacets: ['color', 'file', 'size'],
      disjunctiveFacetsRefinements: { color: ['red'], size: ['0'] },
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        disjunctiveFacets: ['animal'],
        disjunctiveFacetsRefinements: { animal: ['dog'] },
      }),
      new SearchParameters({
        disjunctiveFacets: ['animal'],
        disjunctiveFacetsRefinements: { animal: ['cat'] },
      }),
      new SearchParameters({
        disjunctiveFacets: ['animal'],
        disjunctiveFacetsRefinements: { animal: ['dog', 'hound'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      disjunctiveFacets: ['animal'],
      disjunctiveFacetsRefinements: { animal: ['dog', 'cat', 'hound'] },
    })
  );
});

// todo: duplicate hierarchical
it('merges hierarchicalFacets', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
              'hierarchicalCategories.lvl3',
            ],
          },
        ],
      }),
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories2',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
              'hierarchicalCategories.lvl3',
            ],
          },
        ],
      })
    )
  ).toEqual(
    new SearchParameters({
      hierarchicalFacets: [
        {
          name: 'hierarchicalCategories',
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
        },
        {
          name: 'hierarchicalCategories2',
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
        },
      ],
    })
  );
});

it('merges hierarchicalFacetsRefinements', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
              'hierarchicalCategories.lvl3',
            ],
          },
        ],
        hierarchicalFacetsRefinements: {
          hierarchicalCategories: ['lol', 'refined'],
        },
      }),
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
              'hierarchicalCategories.lvl3',
            ],
          },
        ],
        hierarchicalFacetsRefinements: {
          hierarchicalCategories: ['lol', 'duplicate'],
        },
      }),
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories2',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
              'hierarchicalCategories.lvl3',
            ],
          },
        ],
        hierarchicalFacetsRefinements: {
          hierarchicalCategories: ['leveley'],
        },
      })
    )
  ).toEqual(
    new SearchParameters({
      hierarchicalFacets: [
        {
          name: 'hierarchicalCategories',
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
        },
        {
          name: 'hierarchicalCategories2',
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
        },
      ],
      hierarchicalFacetsRefinements: {
        hierarchicalCategories: ['lol', 'duplicate'],
        hierarchicalCategories2: ['leveley'],
      },
    })
  );
});

it('merges facetsExcludes', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['color'],
        facetsExcludes: { color: ['red'] },
      }),
      new SearchParameters({
        facets: ['file'],
        facetsExcludes: { file: [] },
      }),
      new SearchParameters({
        facets: ['size'],
        facetsExcludes: { size: ['0'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['color', 'file', 'size'],
      facetsExcludes: { color: ['red'], size: ['0'] },
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        facets: ['animal'],
        facetsExcludes: { animal: ['dog'] },
      }),
      new SearchParameters({
        facets: ['animal'],
        facetsExcludes: { animal: ['cat'] },
      }),
      new SearchParameters({
        facets: ['animal'],
        facetsExcludes: { animal: ['dog', 'hound'] },
      })
    )
  ).toEqual(
    new SearchParameters({
      facets: ['animal'],
      facetsExcludes: { animal: ['dog', 'cat', 'hound'] },
    })
  );
});

it('merges numericRefinements', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        numericRefinements: { rating: {} },
      }),
      new SearchParameters({
        numericRefinements: { number: { '=': [2] } },
      }),
      new SearchParameters({
        numericRefinements: { powerLevel: { '>': [9000, 9001] } },
      }),
      new SearchParameters({
        numericRefinements: { superNumbers: { '>': [42, 25, 58, [27, 70]] } },
      })
    )
  ).toEqual(
    new SearchParameters({
      numericRefinements: {
        number: { '=': [2] },
        powerLevel: { '>': [9000, 9001] },
        superNumbers: { '>': [42, 25, 58, [27, 70]] },
      },
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        numericRefinements: { rating: [1] },
      }),
      new SearchParameters({
        numericRefinements: { rating: [1, 3] },
      }),
      new SearchParameters({
        numericRefinements: { rating: [20, 30, [40, 50]] },
      })
    )
  ).toEqual(
    new SearchParameters({
      // is this what it should be?
      numericRefinements: { rating: [1, 3, 20, 30, [40, 50]] },
    })
  );
});

it('merges tagRefinements', () => {
  expect(
    mergeSearchParameters(
      new SearchParameters({
        tagRefinements: ['dog'],
      }),
      new SearchParameters({
        tagRefinements: ['cat'],
      }),
      new SearchParameters({
        tagRefinements: ['hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      tagRefinements: ['dog', 'cat', 'hound'],
    })
  );

  expect(
    mergeSearchParameters(
      new SearchParameters({
        tagRefinements: ['dog'],
      }),
      new SearchParameters({
        tagRefinements: ['cat'],
      }),
      new SearchParameters({
        tagRefinements: ['dog', 'hound'],
      })
    )
  ).toEqual(
    new SearchParameters({
      tagRefinements: ['dog', 'cat', 'hound'],
    })
  );
});
