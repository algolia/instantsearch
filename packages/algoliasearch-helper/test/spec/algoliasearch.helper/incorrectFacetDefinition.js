'use strict';

var algoliasearchHelper = require('../../../index');

var _ = require('lodash');

var fakeClient = {};

test('Conjunctive facet should be declared to be refined', function() {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(_.bind(h.addRefine, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.removeRefine, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.isRefined, h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjuctive facet should be declared to be excluded', function() {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(_.bind(h.addExclude, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.removeExclude, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.isExcluded, h, 'undeclaredFacet', 'value')).toThrow();
});

test('Conjuctive facet should be declared to be refine', function() {
  var h = algoliasearchHelper(fakeClient, '', {});

  expect(_.bind(h.addDisjunctiveRefine, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.removeDisjunctiveRefine, h, 'undeclaredFacet', 'value')).toThrow();
  expect(_.bind(h.isRefined, h, 'undeclaredFacet', 'value')).toThrow();
});
