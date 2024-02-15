'use strict';

var algoliasearchHelper = require('../../../index');

var SearchParameters = algoliasearchHelper.SearchParameters;

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function (done) {
  var state0 = { query: 'a query' };
  var state1 = { query: 'another query' };

  var helper = algoliasearchHelper(fakeClient, null, state0);

  expect(helper.state).toEqual(new SearchParameters(state0));

  helper.on('change', function (event) {
    expect(helper.state).toEqual(new SearchParameters(state1));
    expect(event.state).toEqual(new SearchParameters(state1));
    done();
  });

  helper.setState(state1);
});

test('setState should set a default hierarchicalFacetRefinement when a rootPath is defined', function () {
  var searchParameters = {
    hierarchicalFacets: [
      {
        name: 'hierarchicalCategories.lvl0',
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ],
        separator: ' > ',
        rootPath: 'Cameras & Camcorders',
        showParentLevel: true,
      },
    ],
  };

  var helper = algoliasearchHelper(fakeClient, null, searchParameters);
  var initialHelperState = Object.assign({}, helper.state);

  expect(initialHelperState.hierarchicalFacetsRefinements).toEqual({
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders'],
  });

  // reset state
  helper.setState(
    helper.state.removeHierarchicalFacet('hierarchicalCategories.lvl0')
  );
  expect(helper.state.hierarchicalFacetsRefinements).toEqual({});

  // re-add `hierarchicalFacets`
  helper.setState(Object.assign({}, helper.state, searchParameters));
  var finalHelperState = Object.assign({}, helper.state);

  expect(initialHelperState).toEqual(finalHelperState);
  expect(finalHelperState.hierarchicalFacetsRefinements).toEqual({
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders'],
  });
});

test('setState should warn about invalid userToken', function () {
  const message =
    '[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}';
  console.warn = jest.fn();

  var helper = algoliasearchHelper(fakeClient, null, {});
  helper.setState({ userToken: null });
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  helper.setState({ userToken: '' });
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  helper.setState({ userToken: 'my invalid token!' });
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenLastCalledWith(message);
});
