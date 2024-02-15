'use strict';

var SearchParameters = require('../../../src/SearchParameters');

describe('removeDisjunctiveFacetRefinement', function () {
  test('removeDisjunctiveFacetRefinement(attribute)', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value'],
      },
    });

    expect(state.removeDisjunctiveFacetRefinement('attribute')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: [],
        },
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(attribute, value)', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value', 'value2'],
      },
    });

    expect(
      state.removeDisjunctiveFacetRefinement('attribute', 'value')
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: ['value2'],
        },
      })
    );
  });

  test('removeDisjunctiveFacetRefinement(attribute, lastValue)', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: ['value'],
      },
    });

    expect(
      state.removeDisjunctiveFacetRefinement('attribute', 'value')
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attribute'],
        disjunctiveFacetsRefinements: {
          attribute: [],
        },
      })
    );
  });
});

describe('removeFacetRefinement', function () {
  test('removeFacetRefinement(attribute)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value'],
      },
    });

    expect(state.removeFacetRefinement('attribute')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: [],
        },
      })
    );
  });

  test('removeFacetRefinement(attribute, value)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value', 'value2'],
      },
    });

    expect(state.removeFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: ['value2'],
        },
      })
    );
  });

  test('removeFacetRefinement(attribute, lastValue)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: ['value'],
      },
    });

    expect(state.removeFacetRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsRefinements: {
          attribute: [],
        },
      })
    );
  });
});

describe('removeExcludeRefinement', function () {
  test('removeExcludeRefinement(attribute)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value'],
      },
    });

    expect(state.removeExcludeRefinement('attribute')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: [],
        },
      })
    );
  });

  test('removeExcludeRefinement(attribute, value)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value', 'value2'],
      },
    });

    expect(state.removeExcludeRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: ['value2'],
        },
      })
    );
  });

  test('removeExcludeRefinement(attribute, lastValue)', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsExcludes: {
        attribute: ['value'],
      },
    });

    expect(state.removeExcludeRefinement('attribute', 'value')).toEqual(
      new SearchParameters({
        facets: ['attribute'],
        facetsExcludes: {
          attribute: [],
        },
      })
    );
  });
});

describe('removeTagRefinement', function () {
  test('removeTagRefinement(tag)', function () {
    var state = new SearchParameters({
      tagRefinements: ['tag', 'tag2'],
    });

    expect(state.removeTagRefinement('tag')).toEqual(
      new SearchParameters({
        tagRefinements: ['tag2'],
      })
    );
  });

  test('removeTagRefinement(lastTag)', function () {
    var state = new SearchParameters({
      tagRefinements: ['lastTag'],
    });

    expect(state.removeTagRefinement('lastTag')).toEqual(
      new SearchParameters({
        tagRefinements: [],
      })
    );
  });
});

describe('removeHierarchicalFacetRefinement', function () {
  // NOTE: removeHierarchicalFacetRefinement only allows to remove a whole attribute
  test('removeHierarchicalFacetRefinement(attribute)', function () {
    var state = new SearchParameters({
      hierarchicalFacets: [{ name: 'attribute' }],
      hierarchicalFacetsRefinements: {
        attribute: ['value', 'value2'],
      },
    });

    expect(state.removeHierarchicalFacetRefinement('attribute')).toEqual(
      new SearchParameters({
        hierarchicalFacets: [{ name: 'attribute' }],
        hierarchicalFacetsRefinements: {
          attribute: [],
        },
      })
    );
  });
});

describe('removeNumericRefinement', function () {
  test('removeNumericRefinement(attribute)', function () {
    var state = new SearchParameters({
      numericRefinements: {
        attribute: {
          '>=': [100],
        },
      },
    });

    expect(state.removeNumericRefinement('attribute')).toEqual(
      new SearchParameters({
        numericRefinements: {
          attribute: {
            '>=': [],
          },
        },
      })
    );
  });

  test('removeNumericRefinement(attribute, operator)', function () {
    var state = new SearchParameters({
      numericRefinements: {
        attribute: {
          '>=': [100],
        },
      },
    });

    expect(state.removeNumericRefinement('attribute', '>=')).toEqual(
      new SearchParameters({
        numericRefinements: {
          attribute: {
            '>=': [],
          },
        },
      })
    );
  });

  test('removeNumericRefinement(attribute, operator, value)', function () {
    var state = new SearchParameters({
      numericRefinements: {
        attribute: {
          '<': [100],
          '>=': [100, 200],
        },
      },
    });

    expect(state.removeNumericRefinement('attribute', '>=', 100)).toEqual(
      new SearchParameters({
        numericRefinements: {
          attribute: {
            '<': [100],
            '>=': [200],
          },
        },
      })
    );
  });

  test('removeNumericRefinement(attribute, operator, lastValue)', function () {
    var state = new SearchParameters({
      numericRefinements: {
        attribute: {
          '<': [100],
          '>=': [100, 200],
        },
      },
    });

    expect(state.removeNumericRefinement('attribute', '<', 100)).toEqual(
      new SearchParameters({
        numericRefinements: {
          attribute: {
            '<': [],
            '>=': [100, 200],
          },
        },
      })
    );
  });
});
