'use strict';

var algoliasearchHelper = require('../../../index');

var SearchParameters = algoliasearchHelper.SearchParameters;

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function(done) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = algoliasearchHelper(fakeClient, null, state0);

  expect(helper.state).toEqual(new SearchParameters(state0));

  helper.on('change', function(event) {
    expect(helper.state).toEqual(new SearchParameters(state1));
    expect(event.state).toEqual(new SearchParameters(state1));
    done();
  });

  helper.setState(state1);
});

test('getState should return the current state of the helper', function() {
  var initialState = {query: 'a query'};
  var helper = algoliasearchHelper(fakeClient, null, initialState);

  expect(helper.getState()).toEqual(new SearchParameters(initialState));
  expect(helper.getState()).toEqual(helper.state);
});

test('setState should set a default hierarchicalFacetRefinement when a rootPath is defined', function() {
  var searchParameters = {hierarchicalFacets: [
    {
      name: 'hierarchicalCategories.lvl0',
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2'
      ],
      separator: ' > ',
      rootPath: 'Cameras & Camcorders',
      showParentLevel: true
    }
  ]};

  var helper = algoliasearchHelper(fakeClient, null, searchParameters);
  var initialHelperState = Object.assign({}, helper.getState());

  expect(initialHelperState.hierarchicalFacetsRefinements).toEqual({
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders']
  });

  // reset state
  helper.setState(helper.state.removeHierarchicalFacet('hierarchicalCategories.lvl0'));
  expect(helper.getState().hierarchicalFacetsRefinements).toEqual({});

  // re-add `hierarchicalFacets`
  helper.setState(Object.assign({}, helper.state, searchParameters));
  var finalHelperState = Object.assign({}, helper.getState());

  expect(initialHelperState).toEqual(finalHelperState);
  expect(finalHelperState.hierarchicalFacetsRefinements).toEqual({
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders']
  });
});
