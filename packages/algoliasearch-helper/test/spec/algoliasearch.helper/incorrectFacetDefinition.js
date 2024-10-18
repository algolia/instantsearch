'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('Conjunctive facet should be declared to be refined', function () {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(h.addRefine.bind(h, 'undeclaredFacet', 'value')).toThrow();
  expect(h.removeRefine.bind(h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjunctive facet should be declared to be excluded', function () {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(h.addExclude.bind(h, 'undeclaredFacet', 'value')).toThrow();
  expect(h.removeExclude.bind(h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjuctive facet should be declared to be refine', function () {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(
    h.addDisjunctiveFacetRefinement.bind(h, 'undeclaredFacet', 'value')
  ).toThrow();
  expect(
    h.removeDisjunctiveRefine.bind(h, 'undeclaredFacet', 'value')
  ).toThrow();
});
