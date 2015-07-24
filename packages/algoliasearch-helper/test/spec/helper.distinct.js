'use strict';

var test = require('tape');
var forEach = require('lodash/collection/forEach');

var algoliasearchHelper = require('../../index.js');

test('Distinct not set', function(t) {
  var helper = algoliasearchHelper(null, null, {});
  var state0 = helper.state;

  var disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();

  t.equal(disjunctiveFacetSearchParam.distinct, undefined, '[disjunctive] distinct should be undefined');

  var facetSearchParam = helper._getHitsSearchParams();

  t.equal(facetSearchParam.distinct, undefined, '[hits] distinct should be undefined');

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, undefined, '[disjunctive][query not empty] distinct should be undefined');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, undefined, '[hits][query not empty] distinct should be undefined');
  forEach(helper._getQueries(), function(q) {
    t.notOk(q.hasOwnProperty('distinct'), '[hits][query not empty] no distinct should be in the queries by default');
  });

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, undefined, '[disjunctive][disjunctive refinement] distinct should be undefined');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, undefined, '[hits][disjunctive refinement] distinct should be undefined');
  forEach(helper._getQueries(), function(q) {
    t.notOk(q.hasOwnProperty('distinct'), '[hits][disjunctive refinement] no distinct should be in the queries by default');
  });

  helper.setState(state0);
  helper.addRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, undefined, '[disjunctive][conjunctive refinement] distinct should be undefined');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, undefined, '[hits][conjunctive refinement] distinct should be undefined');
  forEach(helper._getQueries(), function(q) {
    t.notOk(q.hasOwnProperty('distinct'), '[disjunctive][conjunctive refinement] no distinct should be in the queries by default');
  });

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, undefined, '[disjunctive][numeric refinement] distinct should be undefined');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, undefined, '[hits][numeric refinement] distinct should be undefined');
  forEach(helper._getQueries(), function(q) {
    t.notOk(q.hasOwnProperty('distinct'), 'no distinct should be in the queries by default');
  });

  t.end();
});

test('Distinct set to true', function(t) {
  var helper = algoliasearchHelper(null, null, {}).setQueryParameter('distinct', true);
  var state0 = helper.state;

  var disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();

  t.equal(disjunctiveFacetSearchParam.distinct, true, '[disjunctive] distinct should be true');

  var facetSearchParam = helper._getHitsSearchParams();

  t.equal(facetSearchParam.distinct, true, '[hits] distinct should be true');

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, true, '[disjunctive][query not empty] distinct should be true');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, true, '[hits][query not empty] distinct should be true');

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, true, '[disjunctive][disjunctive refinement] distinct should be true');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, true, '[hits][disjunctive refinement] distinct should be true');

  helper.setState(state0);
  helper.addRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, true, '[disjunctive][conjunctive refinement] distinct should be true');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, true, '[hits][conjunctive refinement] distinct should be true');

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, true, '[disjunctive][numeric refinement] distinct should be true');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, true, '[hits][numeric refinement] distinct should be true');

  t.end();
});

test('Distinct to false', function(t) {
  var helper = algoliasearchHelper(null, null, {}).setQueryParameter('distinct', false);
  var state0 = helper.state;

  var disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();

  t.equal(disjunctiveFacetSearchParam.distinct, false, '[disjunctive] distinct should be false');

  var facetSearchParam = helper._getHitsSearchParams();

  t.equal(facetSearchParam.distinct, false, '[hits] distinct should be false');

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, false, '[disjunctive][query not empty] distinct should be false');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, false, '[hits][query not empty] distinct should be false');

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, false, '[disjunctive][disjunctive refinement] distinct should be false');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, false, '[hits][disjunctive refinement] distinct should be false');

  helper.setState(state0);
  helper.addRefine('facet', 'value');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, false, '[disjunctive][conjunctive refinement] distinct should be false');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, false, '[hits][conjunctive refinement] distinct should be false');

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = helper._getDisjunctiveFacetSearchParams();
  t.equal(disjunctiveFacetSearchParam.distinct, false, '[disjunctive][numeric refinement] distinct should be false');
  facetSearchParam = helper._getHitsSearchParams();
  t.equal(facetSearchParam.distinct, false, '[hits][numeric refinement] distinct should be false');

  t.end();
});
