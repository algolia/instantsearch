'use strict';

var algoliaSearch = require('algoliasearch');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('Numeric filters: numeric filters from constructor', function (done) {
  var client = algoliaSearch('dsf', 'dsfdf');

  client.search = function (queries) {
    var ps = queries[0].params;

    expect(ps.numericFilters).toEqual([
      'attribute1>3',
      'attribute1<=100',
      'attribute2=42',
      'attribute2=25',
      'attribute2=58',
      ['attribute2=27', 'attribute2=70'],
    ]);

    done();

    return new Promise(function () {});
  };

  var helper = algoliasearchHelper(client, 'index', {
    numericRefinements: {
      attribute1: {
        '>': [3],
        '<=': [100],
      },
      attribute2: {
        '=': [42, 25, 58, [27, 70]],
      },
    },
  });

  helper.search();
});

test('Numeric filters: numeric filters from setters', function (done) {
  var client = algoliaSearch('dsf', 'dsfdf');

  client.search = function (queries) {
    var ps = queries[0].params;

    expect(ps.numericFilters).toEqual([
      'attribute1>3',
      'attribute1<=100',
      'attribute2=42',
      'attribute2=25',
      'attribute2=58',
      ['attribute2=27', 'attribute2=70'],
    ]);

    done();

    return new Promise(function () {});
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

test('Should be able to remove values one by one even 0s', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  expect(helper.state.numericRefinements.attribute['>']).toEqual([0, 4]);
  helper.removeNumericRefinement('attribute', '>', 0);
  expect(helper.state.numericRefinements.attribute['>']).toEqual([4]);
  helper.removeNumericRefinement('attribute', '>', 4);
  expect(helper.state.numericRefinements.attribute['>']).toEqual([]);
});

test('Should remove all the numeric values for a single operator if remove is called with two arguments', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  helper.addNumericRefinement('attribute', '<', 4);
  expect(helper.state.numericRefinements.attribute).toEqual({
    '>': [0, 4],
    '<': [4],
  });
  helper.removeNumericRefinement('attribute', '>');
  expect(helper.state.numericRefinements.attribute['>']).toEqual([]);
  expect(helper.state.numericRefinements.attribute['<']).toEqual([4]);

  expect(helper.getRefinements('attribute')).toEqual([
    { type: 'numeric', operator: '>', value: [] },
    { type: 'numeric', operator: '<', value: [4] },
  ]);
});

test('Should remove all the numeric values for an attribute if remove is called with one argument', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addNumericRefinement('attribute', '>', 0);
  helper.addNumericRefinement('attribute', '>', 4);
  helper.addNumericRefinement('attribute', '<', 4);
  expect(helper.state.numericRefinements.attribute).toEqual({
    '>': [0, 4],
    '<': [4],
  });
  helper.removeNumericRefinement('attribute');
  expect(helper.state.numericRefinements.attribute).toEqual({
    '>': [],
    '<': [],
  });

  expect(helper.getRefinements('attribute')).toEqual([
    {
      operator: '>',
      type: 'numeric',
      value: [],
    },
    {
      operator: '<',
      type: 'numeric',
      value: [],
    },
  ]);
});

test('Should be able to get if an attribute has numeric filter with hasRefinements', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.hasRefinements('attribute')).toBeFalsy();
  helper.addNumericRefinement('attribute', '=', 42);
  expect(helper.hasRefinements('attribute')).toBeTruthy();
});

test('Should be able to remove the value even if it was a string used as a number', function () {
  var attributeName = 'attr';
  var n = '42';

  var helper = algoliasearchHelper(fakeClient, 'index', {});

  // add string - removes string
  helper.addNumericRefinement(attributeName, '=', n);
  expect(helper.state.isNumericRefined(attributeName, '=', n)).toBeTruthy();
  helper.removeNumericRefinement(attributeName, '=', n);
  expect(helper.state.isNumericRefined(attributeName, '=', n)).toBeFalsy();

  // add number - removes string
  helper.addNumericRefinement(attributeName, '=', 42);
  expect(helper.state.isNumericRefined(attributeName, '=', 42)).toBeTruthy();
  helper.removeNumericRefinement(attributeName, '=', n);
  expect(helper.state.isNumericRefined(attributeName, '=', 42)).toBeFalsy();

  // add string - removes number
  helper.addNumericRefinement(attributeName, '=', n);
  expect(helper.state.isNumericRefined(attributeName, '=', n)).toBeTruthy();
  helper.removeNumericRefinement(attributeName, '=', 42);
  expect(helper.state.isNumericRefined(attributeName, '=', n)).toBeFalsy();
});
