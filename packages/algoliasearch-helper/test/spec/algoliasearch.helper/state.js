'use strict';

var algoliasearchHelper = require('../../../index');

var SearchParameters = algoliasearchHelper.SearchParameters;
var shortener = require('../../../src/SearchParameters/shortener');

var mapKeys = require('lodash/mapKeys');

var qs = require('qs');

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function(done) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = algoliasearchHelper(fakeClient, null, state0);

  expect(helper.state).toEqual(new SearchParameters(state0));

  helper.on('change', function(newState) {
    expect(helper.state).toEqual(new SearchParameters(state1));
    expect(newState).toEqual(new SearchParameters(state1));
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

test('getState should return an object according to the specified filters', function() {
  var initialState = {
    query: 'a query',
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
    hierarchicalFacets: [{
      name: 'facetC',
      attributes: ['facetC']
    }],
    minWordSizefor1Typo: 1
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.toggleRefine('facetC', 'menu');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var stateFinalWithSpecificAttribute = {
    index: index,
    query: initialState.query,
    facetsRefinements: {facetA: ['a']},
    disjunctiveFacetsRefinements: {facetB: ['d']},
    numericRefinements: {numerical: {'=': [3]}}
  };

  var stateFinalWithoutSpecificAttributes = {
    index: index,
    query: initialState.query,
    facetsRefinements: {facetA: ['a'], facetWeDontCareAbout: ['v']},
    disjunctiveFacetsRefinements: {facetB: ['d']},
    hierarchicalFacetsRefinements: {facetC: ['menu']},
    numericRefinements: {numerical2: {'<=': [3]}, numerical: {'=': [3]}}
  };

  var stateWithHierarchicalAttribute = {
    hierarchicalFacetsRefinements: {facetC: ['menu']}
  };

  expect(helper.getState([])).toEqual({});
  expect(
    helper.getState(['index', 'query', 'attribute:facetA', 'attribute:facetB', 'attribute:numerical'])
  ).toEqual(stateFinalWithSpecificAttribute);

  expect(helper.getState(['attribute:facetC'])).toEqual(stateWithHierarchicalAttribute);

  expect(helper.getState(['index', 'query', 'attribute:*'])).toEqual(stateFinalWithoutSpecificAttributes);
});

test('Get the state as a query string', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  var filters = ['query', 'attribute:*'];
  var stateWithoutConfig = helper.getState(filters);

  var decodedState = mapKeys(
    qs.parse(helper.getStateAsQueryString({filters: filters})),
    function(v, k) {
      var decodedKey = shortener.decode(k);
      return decodedKey || k;
    }
  );

  expect(algoliasearchHelper.SearchParameters._parseNumbers(decodedState)).toEqual(stateWithoutConfig);
});

test('Set the state with a query parameter with index', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['index', 'query', 'attribute:*'];

  var newHelper = algoliasearchHelper(fakeClient, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({filters: filters}));

  expect(newHelper.state).toEqual(helper.state);
  expect(newHelper.getIndex()).toBe(helper.getIndex());
});

test('Set the state with a query parameter without index', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var helper = algoliasearchHelper(fakeClient, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['query', 'attribute:*'];

  var newHelper = algoliasearchHelper(fakeClient, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({filters: filters}));

  expect(newHelper.state).toEqual(helper.state);
  expect(newHelper.getIndex()).toBe(helper.getIndex());
});

test('Set the state with a query parameter with unknown querystring attributes', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var helper = algoliasearchHelper(fakeClient, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['query', 'attribute:*'];

  var newHelper = algoliasearchHelper(fakeClient, null, initialState);
  var queryString = helper.getStateAsQueryString({filters: filters}) + '&foo=bar&toto=tata';
  newHelper.setStateFromQueryString(queryString);

  expect(newHelper.state).toEqual(helper.state);
  expect(newHelper.getIndex()).toBe(helper.getIndex());
});

test('Serialize with prefix', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  var filters = ['query', 'attribute:*', 'index'];
  var prefix = 'toto_';

  var qString = helper.getStateAsQueryString({filters: filters, prefix: prefix});

  expect(qString).toEqual(
    'toto_q=a%20query&toto_idx=indexNameInTheHelper&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3'
  );
});

test('Serialize without any state to serialize, only more attributes', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };

  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  var filters = ['attribute:*'];

  var qString = helper.getStateAsQueryString(
    {
      filters: filters,
      moreAttributes: {
        toto: 'tata',
        foo: 'bar'
      }
    }
  );

  expect(qString).toEqual('toto=tata&foo=bar');
});

test('Serialize with prefix, this should have no impact on user provided paramaters', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  var filters = ['query', 'attribute:*'];
  var prefix = 'toto_';

  var qString = helper.getStateAsQueryString(
    {
      filters: filters,
      prefix: prefix,
      moreAttributes: {
        toto: 'tata',
        foo: 'bar'
      }
    }
  );

  expect(qString).toEqual(
    'toto_q=a%20query&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3&toto=tata&foo=bar'
  );
});

test('Should be able to deserialize qs with namespaced attributes', function() {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a&b=13');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['index', 'query', 'attribute:*'];

  var newHelper = algoliasearchHelper(fakeClient, null, initialState);
  var queryString = helper.getStateAsQueryString({filters: filters, prefix: 'calimerou_'});
  newHelper.setStateFromQueryString(queryString, {prefix: 'calimerou_'});

  expect(newHelper.state).toEqual(helper.state);
  expect(newHelper.getIndex()).toBe(helper.getIndex());
});

test('getStateFromQueryString should parse page as number and be consistent with the state', function() {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {});

  helper.setCurrentPage(10);

  var filters = ['page'];

  var queryString = helper.getStateAsQueryString({filters: filters});

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  expect(partialStateFromQueryString.page).toEqual(helper.state.page);
});

test('getStateFromQueryString should use its options', function() {
  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    'is_notexistingparam=val&is_MyQuery=test&is_p=3&extra_param=val',
    {
      prefix: 'is_',
      mapping: {
        q: 'MyQuery'
      }
    }
  );

  expect(partialStateFromQueryString).toEqual({
    query: 'test',
    page: 3
  });
});

test('should be able to get configuration that is not from algolia', function() {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {});

  helper.setCurrentPage(10);

  var filters = ['page', 'index'];

  var moar = {
    foo: 'bar',
    baz: 'toto',
    mi: '0'
  };

  var qsWithoutPrefix = helper.getStateAsQueryString(
    {
      filters: filters,
      moreAttributes: moar
    }
  );
  var qsWithPrefix = helper.getStateAsQueryString(
    {
      filters: filters,
      moreAttributes: moar,
      prefix: 'wtf_'
    }
  );
  var qsWithPrefixAndMapping = helper.getStateAsQueryString(
    {
      filters: filters,
      moreAttributes: moar,
      prefix: 'wtf_',
      mapping: {
        p: 'mypage'
      }
    }
  );
  var config1 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(qsWithoutPrefix);
  var config2 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(qsWithPrefix, {prefix: 'wtf_'});
  var config3 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(qsWithPrefixAndMapping, {prefix: 'wtf_', mapping: {p: 'mypage'}});

  expect(config1).toEqual(moar);
  expect(config2).toEqual(moar);
  expect(config3).toEqual(moar);
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
