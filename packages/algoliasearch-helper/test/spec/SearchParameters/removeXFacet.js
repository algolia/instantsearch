'use strict';

var SearchParameters = require('../../../src/SearchParameters');

describe('removeDisjunctiveFacet', function () {
  test('removeDisjunctiveFacet(attribute), multiple refinements', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute', 'other'],
      disjunctiveFacetsRefinements: {
        attribute: ['value'],
        other: ['value'],
      },
    });

    expect(state.removeDisjunctiveFacet('attribute')).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['other'],
        disjunctiveFacetsRefinements: {
          other: ['value'],
        },
      })
    );
  });

  test('removeDisjunctiveFacet(attribute), empty refinements', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
      disjunctiveFacetsRefinements: {
        attribute: [],
      },
    });

    expect(state.removeDisjunctiveFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });

  test('removeDisjunctiveFacet(attribute), no refinements', function () {
    var state = new SearchParameters({
      disjunctiveFacets: ['attribute'],
    });

    expect(state.removeDisjunctiveFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });

  test('removeDisjunctiveFacet(attribute), empty', function () {
    var state = new SearchParameters();

    expect(state.removeDisjunctiveFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });
});

describe('removeFacet', function () {
  test('removeFacet(attribute), multiple refinements', function () {
    var state = new SearchParameters({
      facets: ['attribute', 'other'],
      facetsRefinements: {
        attribute: ['value'],
        other: ['value'],
      },
    });

    expect(state.removeFacet('attribute')).toEqual(
      new SearchParameters({
        facets: ['other'],
        facetsRefinements: {
          other: ['value'],
        },
      })
    );
  });

  test('removeFacet(attribute), empty refinements', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
      facetsRefinements: {
        attribute: [],
      },
    });

    expect(state.removeFacet('attribute')).toEqual(new SearchParameters());
  });

  test('removeFacet(attribute), no refinements', function () {
    var state = new SearchParameters({
      facets: ['attribute'],
    });

    expect(state.removeFacet('attribute')).toEqual(new SearchParameters());
  });

  test('removeFacet(attribute), empty', function () {
    var state = new SearchParameters();

    expect(state.removeFacet('attribute')).toEqual(new SearchParameters());
  });
});

describe('removeHierarchicalFacet', function () {
  test('removeHierarchicalFacet(attribute), multiple refinements', function () {
    var state = new SearchParameters({
      hierarchicalFacets: [
        { name: 'attribute', attributes: ['zip', 'zop'] },
        { name: 'other', attributes: ['zap', 'zep'] },
      ],
      hierarchicalFacetsRefinements: {
        attribute: ['value'],
        other: ['value'],
      },
    });

    expect(state.removeHierarchicalFacet('attribute')).toEqual(
      new SearchParameters({
        hierarchicalFacets: [{ name: 'other', attributes: ['zap', 'zep'] }],
        hierarchicalFacetsRefinements: {
          other: ['value'],
        },
      })
    );
  });

  test('removeHierarchicalFacet(attribute), empty refinements', function () {
    var state = new SearchParameters({
      hierarchicalFacets: [{ name: 'attribute', attributes: ['zip', 'zop'] }],
      hierarchicalFacetsRefinements: {
        attribute: [],
      },
    });

    expect(state.removeHierarchicalFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });

  test('removeHierarchicalFacet(attribute), no refinements', function () {
    var state = new SearchParameters({
      hierarchicalFacets: [{ name: 'attribute', attributes: ['zip', 'zop'] }],
    });

    expect(state.removeHierarchicalFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });

  test('removeHierarchicalFacet(attribute), empty', function () {
    var state = new SearchParameters();

    expect(state.removeHierarchicalFacet('attribute')).toEqual(
      new SearchParameters()
    );
  });
});
