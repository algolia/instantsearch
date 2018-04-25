'use strict';

var test = require('tape');
var _ = require('lodash');
var algoliasearchHelper = require('../../index');

var emptyClient = {};

test('Adding refinments should add an entry to the refinments attribute', function(t) {
  var facetName = 'facet1';
  var facetValue = '42';

  var helper = algoliasearchHelper(emptyClient, 'index', {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'should be empty at first');
  helper.addRefine(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 1, 'when adding a refinment, should have one');
  t.deepEqual(helper.state.facetsRefinements.facet1, [facetValue]);
  helper.addRefine(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 1, 'when adding the same, should still be one');
  helper.removeRefine(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 0, 'Then empty ');
  t.end();
});

test('Adding several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.addRefine(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding one refinement, should have one');
  helper.addRefine(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding another refinement, should have two');
  helper.addRefine(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding same refinement as the first, should have two');

  t.end();
});

test('Toggling several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.toggleRefine(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding one refinement, should have one');
  helper.toggleRefine(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding another refinement, should have two');
  helper.toggleRefine(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding same refinement as the first, should have two');
  t.deepEqual(helper.state.facetsRefinements[facetName], ['value2'], 'should contain value2');

  t.end();
});

test('Using toggleRefine on a non specified facet should throw an exception', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {});

  t.throws(_.partial(helper.toggleRefine, 'unknown', 'value'));

  t.end();
});

test('Removing several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.addRefine(facetName, 'value1');
  helper.addRefine(facetName, 'value2');
  helper.addRefine(facetName, 'value3');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 3, 'Adding another refinement, should have two');
  helper.removeRefine(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding same refinement as the first, should have two');
  t.deepEqual(helper.state.facetsRefinements[facetName], ['value1', 'value3'], 'should contain value1 and value3');

  t.end();
});

test('isDisjunctiveRefined', function(t) {
  var facet = 'MyFacet';

  var helper = algoliasearchHelper(emptyClient, null, {
    disjunctiveFacets: [facet]
  });

  var value = 'MyValue';

  t.equal(helper.isDisjunctiveRefined(facet, value), false,
    'isDisjunctiveRefined should return false for when no refinement for facet');

  helper.addDisjunctiveRefine(facet, value);
  t.equal(helper.isDisjunctiveRefined(facet, value), true,
    'isDisjunctiveRefined should be true when facet is refined');

  helper.removeDisjunctiveRefine(facet, value);
  t.equal(helper.isDisjunctiveRefined(facet, value), false,
    'isDisjunctiveRefined should return false when refinement was removed');
  t.end();
});

test('IsRefined should return true if the (facet, value ) is refined.', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1']
  });

  helper.addRefine('facet1', 'boom');

  t.equal(helper.isRefined('facet1', 'boom'), true, 'the facet + value is refined >> true');

  t.equal(helper.isRefined('facet1', 'booohh'), false, 'value not refined but is a facet');
  t.throws(_.bind(helper.isRefined, helper, 'notAFacet', 'maoooh'), 'should throw as it is not a facet');
  t.throws(_.bind(helper.isRefined, helper, null, null), 'not valid values');

  t.end();
});

test('isRefined(facet)/hasRefinements should return true if the facet is refined.', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1']
  });

  t.equal(helper.isRefined('facet1'), false, 'the facet is not refined yet >> false');
  t.equal(helper.hasRefinements('facet1'), false, 'the facet is not refined yet >> false');

  helper.addRefine('facet1', 'boom');

  t.equal(helper.isRefined('facet1'), true, 'the facet is refined >> true');
  t.equal(helper.hasRefinements('facet1'), true, 'the facet is refined >> true');

  t.throws(_.bind(helper.isRefined, helper, 'notAFacet'), 'not a facet');
  // in complete honesty we should be able to detect numeric facets but we can't
  // t.throws(helper.hasRefinements.bind(helper, 'notAFacet'), 'not a facet');
  t.throws(_.bind(helper.isRefined, null), 'not even valid values');
  t.throws(_.bind(helper.hasRefinements, null), 'not even valid values');

  t.end();
});

test('getRefinements should return all the refinements for a given facet', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2', 'sales']
  });

  helper.addRefine('facet1', 'val1')
    .addRefine('facet1', 'val2')
    .addExclude('facet1', 'val-1')
    .toggleRefine('facet1', 'val3');

  helper.addDisjunctiveRefine('facet2', 'val4')
    .addDisjunctiveRefine('facet2', 'val5')
    .toggleRefine('facet2', 'val6');

  helper.addNumericRefinement('sales', '>', '3')
    .addNumericRefinement('sales', '<', '9');

  t.deepEqual(helper.getRefinements('facet1'),
    [
      {value: 'val1', type: 'conjunctive'},
      {value: 'val2', type: 'conjunctive'},
      {value: 'val3', type: 'conjunctive'},
      {value: 'val-1', type: 'exclude'}
    ],
    '');

  t.deepEqual(helper.getRefinements('facet2'),
    [
      {value: 'val4', type: 'disjunctive'},
      {value: 'val5', type: 'disjunctive'},
      {value: 'val6', type: 'disjunctive'}
    ],
    '');

  t.deepEqual(helper.getRefinements('sales'),
    [
      {value: [3], operator: '>', type: 'numeric'},
      {value: [9], operator: '<', type: 'numeric'}
    ],
    '');

  t.end();
});

test('getRefinements should return an empty array if the facet has no refinement', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  t.deepEqual(helper.getRefinements('facet1'), [], '');
  t.deepEqual(helper.getRefinements('facet2'), [], '');

  t.end();
});

test('[Conjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addRefine('facet1', 42);
  t.equal(helper.isRefined('facet1', 42), true, '[facet][number] should be refined');
  t.equal(helper.isRefined('facet1', '42'), true, '[facet][string] should be refined');

  var stateWithFacet1and42 = helper.state;

  helper.removeRefine('facet1', '42');
  t.equal(helper.isRefined('facet1', '42'), false, '[facet][string] should not be refined');

  helper.setState(stateWithFacet1and42);
  helper.removeRefine('facet1', 42);
  t.equal(helper.isRefined('facet1', 42), false, '[facet][number] should not be refined');

  t.end();
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addExclude('facet1', 42);
  t.equal(helper.isExcluded('facet1', 42), true, '[facet][number] should be refined');
  t.equal(helper.isExcluded('facet1', '42'), true, '[facet][string] should be refined');

  var stateWithFacet1Without42 = helper.state;

  helper.removeExclude('facet1', '42');
  t.equal(helper.isExcluded('facet1', '42'), false, '[facet][string] should not be refined');

  helper.setState(stateWithFacet1Without42);
  helper.removeExclude('facet1', 42);
  t.equal(helper.isExcluded('facet1', 42), false, '[facet][number] should not be refined');

  t.end();
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addDisjunctiveRefine('facet2', 42);
  t.equal(helper.isDisjunctiveRefined('facet2', 42), true, '[facet][number] should be refined');
  t.equal(helper.isDisjunctiveRefined('facet2', '42'), true, '[facet][string] should be refined');

  var stateWithFacet2and42 = helper.state;

  helper.removeDisjunctiveRefine('facet2', '42');
  t.equal(helper.isDisjunctiveRefined('facet2', '42'), false, '[facet][string] should not be refined');
  helper.setState(stateWithFacet2and42);

  helper.removeDisjunctiveRefine('facet2', 42);
  t.equal(helper.isDisjunctiveRefined('facet2', 42), false, '[facet][number] should not be refined');

  t.end();
});
