'use strict';

var SearchParameters = require('../../../src/SearchParameters');

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
