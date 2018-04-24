'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var _ = require('lodash');

var fakeClient = {};

test('Conjuctive facet should be declared to be refined', function(t) {
  var h = algoliasearchHelper(fakeClient, '', {});

  t.throws(_.bind(h.addRefine, h, 'undeclaredFacet', 'value'), 'Adding a facet refinement should not be possible');
  t.throws(_.bind(h.removeRefine, h, 'undeclaredFacet', 'value'), 'Remove a facet refinement should not be possible');
  t.throws(_.bind(h.isRefined, h, 'undeclaredFacet', 'value'), 'Checking if a facet is refined should not be possible');

  t.end();
});

test('Conjuctive facet should be declared to be excluded', function(t) {
  var h = algoliasearchHelper(fakeClient, '', {});

  t.throws(_.bind(h.addExclude, h, 'undeclaredFacet', 'value'), 'Adding a facet refinement should not be possible');
  t.throws(_.bind(h.removeExclude, h, 'undeclaredFacet', 'value'), 'Remove a facet refinement should not be possible');
  t.throws(_.bind(h.isExcluded, h, 'undeclaredFacet', 'value'), 'Checking if a facet is refined should not be possible');

  t.end();
});

test('Conjuctive facet should be declared to be refine', function(t) {
  var h = algoliasearchHelper(fakeClient, '', {});

  t.throws(_.bind(h.addDisjunctiveRefine, h, 'undeclaredFacet', 'value'), 'Adding a facet refinement should not be possible');
  t.throws(_.bind(h.removeDisjunctiveRefine, h, 'undeclaredFacet', 'value'), 'Remove a facet refinement should not be possible');
  t.throws(_.bind(h.isRefined, h, 'undeclaredFacet', 'value'), 'Checking if a facet is refined should not be possible');

  t.end();
});
