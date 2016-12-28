'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index.js');

test('It should instanciate even with an old client that does not support addAlgoliaAgent', function(t) {
  var helper = algoliasearchHelper({}, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet']
  });

  t.ok(helper);
  t.end();
});
