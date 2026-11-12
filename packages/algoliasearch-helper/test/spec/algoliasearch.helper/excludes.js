'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('toggling an exclude refinement should add an exclusion', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  expect(helper.state.facetsExcludes[facetName]).toBeFalsy();
  helper.state = helper.state.toggleExcludeFacetRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.facetsExcludes[facetName]).toBeTruthy();
  expect(
    helper.state.facetsExcludes[facetName][0] === facetValueToExclude
  ).toBeTruthy();
});

test('removeExcludeRefinement should remove an exclusion', function (done) {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  helper.state = helper.state.toggleExcludeFacetRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.facetsExcludes[facetName].length === 1).toBeTruthy();
  helper.state = helper.state.removeExcludeRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.facetsExcludes[facetName]).toEqual([]);

  try {
    helper.state = helper.state.removeExcludeRefinement(
      facetName,
      facetValueToExclude
    );
  } catch (e) {
    done(new Error('Removing unset exclusions should be ok...'));
  }

  done();
});

test('isExcludeRefined should allow to omit the value', function () {
  var facetName = 'foo';
  var facetValueToExclude = 'brand';
  var facetValueNotExcluded = 'bar';

  var helper = algoliasearchHelper(fakeClient, null, {
    facets: [facetName],
  });

  expect(helper.state.isExcludeRefined(facetName, facetValueToExclude)).toBe(
    false
  );
  expect(helper.state.isExcludeRefined(facetName, facetValueNotExcluded)).toBe(
    false
  );
  expect(helper.state.isExcludeRefined(facetName)).toBe(false);
  helper.state = helper.state.toggleExcludeFacetRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.isExcludeRefined(facetName, facetValueToExclude)).toBe(
    true
  );
  expect(helper.state.isExcludeRefined(facetName, facetValueNotExcluded)).toBe(
    false
  );
  expect(helper.state.isExcludeRefined(facetName)).toBe(true);
});

test('isExcludeRefined should report exclusion correctly', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function () {};

  var facetName = 'facet';
  var facetValueToExclude = 'brand';

  expect(helper.state.isExcludeRefined(facetName, facetValueToExclude)).toBe(
    false
  );
  helper.state = helper.state.toggleExcludeFacetRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.isExcludeRefined(facetName, facetValueToExclude)).toBe(
    true
  );
  helper.state = helper.state.removeExcludeRefinement(
    facetName,
    facetValueToExclude
  );
  expect(helper.state.isExcludeRefined(facetName, facetValueToExclude)).toBe(
    false
  );
});
