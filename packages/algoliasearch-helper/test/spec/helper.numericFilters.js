'use strict';

var test = require('tape');
var algoliaSearch = require('algoliasearch');
var algoliasearchHelper = require('../../index');

test('Numeric filters: numeric filters from constructor', function(t) {
  var client = algoliaSearch('dsf', 'dsfdf');

  client.search = function(queries) {
    var ps = queries[0].params;

    t.deepEqual(
      ps.numericFilters,
      ['attribute1>3',
        'attribute1<=100',
        'attribute2=42',
        'attribute2=25',
        'attribute2=58',
        ['attribute2=27', 'attribute2=70']],
      'Serialization of numerical filters');
    t.end();
  };

  var helper = algoliasearchHelper(client, 'index', {
    numericRefinements: {
      attribute1: {
        '>': [3],
        '<=': [100]
      },
      attribute2: {
        '=': [42, 25, 58, [27, 70]]
      }
    }
  });

  helper.search();
});

test('Numeric filters: numeric filters from setters', function(t) {
  var client = algoliaSearch('dsf', 'dsfdf');

  client.search = function(queries) {
    var ps = queries[0].params;

    t.deepEqual(
      ps.numericFilters,
      ['attribute1>3',
        'attribute1<=100',
        'attribute2=42',
        'attribute2=25',
        'attribute2=58',
        ['attribute2=27', 'attribute2=70']],
      'Serialization of numerical filters');
    t.end();
  };

  var helper = algoliasearchHelper(client, 'index');

  helper.addNumericRefinement('attribute1', '>', 3);
  helper.addNumericRefinement('attribute1', '<=', 100);
  helper.addNumericRefinement('attribute2', '=', 42);
  helper.addNumericRefinement('attribute2', '=', 25);
  helper.addNumericRefinement('attribute2', '=', 58);
  helper.addNumericRefinement('attribute2', '=', [27, 70]);

  helper.search();
});

test('Should be able to remove values one by one even 0s', function(t) {
  var helper = algoliasearchHelper(null, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  t.deepEqual(helper.state.numericRefinements.attribute['>'], [0, 4], 'should be set to [0, 4] initially');
  helper.removeNumericRefinement('attribute', '>', 0);
  t.deepEqual(helper.state.numericRefinements.attribute['>'], [4], 'should be set to [ 0 ]');
  helper.removeNumericRefinement('attribute', '>', 4);
  t.equal(helper.state.numericRefinements.attribute, undefined, 'should set to undefined');
  t.end();
});

test('Should remove all the numeric values for a single operator if remove is called with two arguments', function(t) {
  var helper = algoliasearchHelper(null, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  helper.addNumericRefinement('attribute', '<', 4);
  t.deepEqual(
    helper.state.numericRefinements.attribute,
    {'>': [0, 4], '<': [4]},
    'should be set to {">": [0, 4], "<":[4]} initially');
  helper.removeNumericRefinement('attribute', '>');
  t.equal(helper.state.numericRefinements.attribute['>'], undefined, 'should set to undefined');
  t.deepEqual(
    helper.state.numericRefinements.attribute['<'],
    [4],
    'the value of the other should be the same');

  t.deepEqual(
    helper.getRefinements('attribute'),
    [{type: 'numeric', operator: '<', value: [4]}],
    'should have the same result with getRefinements');

  t.end();
});

test('Should remove all the numeric values for a single operator if remove is called with two arguments', function(t) {
  var helper = algoliasearchHelper(null, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  helper.addNumericRefinement('attribute', '<', 4);
  t.deepEqual(
    helper.state.numericRefinements.attribute,
    {'>': [0, 4], '<': [4]},
    'should be set to {">": [0, 4], "<":[4]} initially');
  helper.removeNumericRefinement('attribute');
  t.equal(helper.state.numericRefinements.attribute, undefined, 'should set to undefined');

  t.deepEqual(
    helper.getRefinements('attribute'),
    [],
    'should have the same result with getRefinements');

  t.end();
});

test('should be able to retrieve numeric filters', function(t) {
  t.end();
});

test('Should be able to get if an attribute has numeric filter with hasRefinements', function(t) {
  var helper = algoliasearchHelper(null, null, null);

  t.notOk(helper.hasRefinements('attribute'), 'not refined initially');
  helper.addNumericRefinement('attribute', '=', 42);
  t.ok(helper.hasRefinements('attribute'), 'should be refined');

  t.end();
});
