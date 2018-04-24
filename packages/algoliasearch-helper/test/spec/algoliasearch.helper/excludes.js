'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('addExclude should add an exclusion', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet']
  });

  helper._search = function() {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  t.notOk(helper.state.facetsExcludes[facetName], 'initialy empty');
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.state.facetsExcludes[facetName], 'not empty');
  t.ok(helper.state.facetsExcludes[facetName][0] === facetValueToExclude, 'with the correct value');

  t.end();
});

test('removeExclude should remove an exclusion', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet']
  });

  helper._search = function() {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.state.facetsExcludes[facetName].length === 1, 'not empty at first');
  helper.removeExclude(facetName, facetValueToExclude);
  t.ok(!helper.state.facetsExcludes[facetName], 'then empty');

  try {
    helper.removeExclude(facetName, facetValueToExclude);
  } catch (e) {
    t.fail('Removing unset exclusions should be ok...');
  }

  t.end();
});

test('isExcluded should allow to omit the value', function(t) {
  var facetName = 'foo';
  var facetValueToExclude = 'brand';
  var facetValueNotExcluded = 'bar';

  var helper = algoliasearchHelper(fakeClient, null, {
    facets: [facetName]
  });

  t.notOk(helper.isExcluded(facetName, facetValueToExclude), 'before, the value to exclude is not excluded');
  t.notOk(helper.isExcluded(facetName, facetValueNotExcluded),
          'before, the value to exclude is not excluded');
  t.notOk(helper.isExcluded(facetName), 'before, no facet for the attribute');
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.isExcluded(facetName, facetValueToExclude), 'after, the value to exclude is excluded');
  t.notOk(helper.isExcluded(facetName, facetValueNotExcluded),
          'after, the value not to excluded is not excluded');
  t.ok(helper.isExcluded(facetName), 'after, the attribute contains exclusions');

  t.end();
});

test('isExcluded should report exclusion correctly', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet']
  });

  helper._search = function() {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  t.notOk(helper.isExcluded(facetName, facetValueToExclude), 'value not excluded at first');
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.isExcluded(facetName, facetValueToExclude), 'value is excluded');
  helper.removeExclude(facetName, facetValueToExclude);
  t.notOk(helper.isExcluded(facetName, facetValueToExclude), 'value is not excluded anymore');

  t.end();
});
