'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('addExclude should add an exclusion', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  expect(helper.state.facetsExcludes[facetName]).toBeFalsy();
  helper.addExclude(facetName, facetValueToExclude);
  expect(helper.state.facetsExcludes[facetName]).toBeTruthy();
  expect(
    helper.state.facetsExcludes[facetName][0] === facetValueToExclude
  ).toBeTruthy();
});

test('removeExclude should remove an exclusion', function (done) {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  helper.addExclude(facetName, facetValueToExclude);
  expect(helper.state.facetsExcludes[facetName].length === 1).toBeTruthy();
  helper.removeExclude(facetName, facetValueToExclude);
  expect(helper.state.facetsExcludes[facetName]).toEqual([]);

  try {
    helper.removeExclude(facetName, facetValueToExclude);
  } catch (e) {
    done.fail('Removing unset exclusions should be ok...');
  }

  done();
});

test('isExcluded should allow to omit the value', function () {
  var facetName = 'foo';
  var facetValueToExclude = 'brand';
  var facetValueNotExcluded = 'bar';

  var helper = algoliasearchHelper(fakeClient, null, {
    facets: [facetName],
  });

  expect(helper.isExcluded(facetName, facetValueToExclude)).toBeFalsy();
  expect(helper.isExcluded(facetName, facetValueNotExcluded)).toBeFalsy();
  expect(helper.isExcluded(facetName)).toBeFalsy();
  helper.addExclude(facetName, facetValueToExclude);
  expect(helper.isExcluded(facetName, facetValueToExclude)).toBeTruthy();
  expect(helper.isExcluded(facetName, facetValueNotExcluded)).toBeFalsy();
  expect(helper.isExcluded(facetName)).toBeTruthy();
});

test('isExcluded should report exclusion correctly', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  expect(helper.isExcluded(facetName, facetValueToExclude)).toBeFalsy();
  helper.addExclude(facetName, facetValueToExclude);
  expect(helper.isExcluded(facetName, facetValueToExclude)).toBeTruthy();
  helper.removeExclude(facetName, facetValueToExclude);
  expect(helper.isExcluded(facetName, facetValueToExclude)).toBeFalsy();
});
