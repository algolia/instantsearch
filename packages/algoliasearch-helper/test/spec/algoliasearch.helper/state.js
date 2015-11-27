'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var SearchParameters = algoliasearchHelper.SearchParameters;
var shortener = require('../../../src/SearchParameters/shortener');

var mapKeys = require('lodash/object/mapKeys');

var qs = require('qs');

test('setState should set the state of the helper and trigger a change event', function(t) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = algoliasearchHelper(null, null, state0);

  t.deepEquals(helper.state, new SearchParameters(state0), '(setstate) initial state should be state0');

  helper.on('change', function(newState) {
    t.deepEquals(
      helper.state,
      new SearchParameters(state1),
      '(setState) the state in the helper should be changed to state1');
    t.deepEquals(
      newState,
      new SearchParameters(state1),
      '(setState) the state parameter of the event handler should be set to state1');
    t.end();
  });

  helper.setState(state1);
});

test('getState should return the current state of the helper', function(t) {
  var initialState = {query: 'a query'};
  var helper = algoliasearchHelper(null, null, initialState);

  t.deepEquals(helper.getState(),
    new SearchParameters(initialState),
    '(getState) getState returned value should be equivalent to initialstate as a new SearchParameters');
  t.deepEquals(helper.getState(),
    helper.state,
    '(getState) getState returned value should be equivalent to the internal state of the helper');

  t.end();
});

test('getState should return an object according to the specified filters', function(t) {
  var initialState = {
    query: 'a query',
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
    minWordSizefor1Typo: 1
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
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
    numericRefinements: {numerical2: {'<=': [3]}, numerical: {'=': [3]}}
  };

  t.deepEquals(helper.getState([]), {}, 'if an empty array is passed then we should get an empty object');
  t.deepEquals(
    helper.getState(['index', 'query', 'attribute:facetA', 'attribute:facetB', 'attribute:numerical']),
    stateFinalWithSpecificAttribute,
    '(getState) getState returned value should contain all the required elements');

  t.deepEquals(
    helper.getState(['index', 'query', 'attribute:*']),
    stateFinalWithoutSpecificAttributes,
    '(getState) getState should return all the attributes if *');

  t.end();
});

test('Get the state as a query string', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

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

  t.deepEquals(
    algoliasearchHelper.SearchParameters._parseNumbers(decodedState),
    stateWithoutConfig,
    'deserialized qs should be equal to the state');

  t.end();
});

test('Set the state with a query parameter with index', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['index', 'query', 'attribute:*'];

  var newHelper = algoliasearchHelper(null, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({filters: filters}));

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string');
  t.equal(
    newHelper.getIndex(),
    helper.getIndex(),
    'Index should be equal');
  t.end();
});

test('Set the state with a query parameter without index', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var helper = algoliasearchHelper(null, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['query', 'attribute:*'];

  var newHelper = algoliasearchHelper(null, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({filters: filters}));

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string');
  t.equal(
    newHelper.getIndex(),
    helper.getIndex(),
    'Index should be equal');
  t.end();
});

test('Set the state with a query parameter with unknown querystring attributes', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var helper = algoliasearchHelper(null, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['query', 'attribute:*'];

  var newHelper = algoliasearchHelper(null, null, initialState);
  var queryString = helper.getStateAsQueryString({filters: filters}) + '&foo=bar&toto=tata';
  newHelper.setStateFromQueryString(queryString);

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string');
  t.equal(
    newHelper.getIndex(),
    helper.getIndex(),
    'Index should be equal');
  t.end();
});

test('Serialize with prefix', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

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

  t.deepEquals(
    qString,
    'toto_q=a%20query&toto_idx=indexNameInTheHelper&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3',
    'serialized qs with prefix should be correct');

  t.end();
});

test('Serialize without any state to serialize, only more attributes', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };

  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

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

  t.deepEquals(
    qString,
    'toto=tata&foo=bar',
    'serialized qs without helper parameters and more attributes should be equal');

  t.end();
});

test('Serialize with prefix, this should have no impact on user provided paramaters', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

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

  t.deepEquals(
    qString,
    'toto_q=a%20query&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3&toto=tata&foo=bar',
    'serialized qs with prefix and more attributes should be equal');

  t.end();
});

test('Should be able to deserialize qs with namespaced attributes', function(t) {
  var initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB']
  };
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a&b=13');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['index', 'query', 'attribute:*'];

  var newHelper = algoliasearchHelper(null, null, initialState);
  var queryString = helper.getStateAsQueryString({filters: filters, prefix: 'calimerou_'});
  newHelper.setStateFromQueryString(queryString, {prefix: 'calimerou_'});

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string (with prefix)');
  t.equal(
    newHelper.getIndex(),
    helper.getIndex(),
    'Index should be equal even with the prefix');
  t.end();
});

test('getConfigurationFromQueryString should parse page as number and be consistent with the state', function(t) {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, {});

  helper.setCurrentPage(10);

  var filters = ['page'];

  var queryString = helper.getStateAsQueryString({filters: filters});

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.page,
    helper.state.page,
    'Page should be consistent throught query string serialization/deserialization');
  t.end();
});

test('should be able to get configuration that is not from algolia', function(t) {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(null, index, {});

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

  var config1 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(qsWithoutPrefix);
  var config2 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(qsWithPrefix, {prefix: 'wtf_'});

  t.deepEquals(
    config1,
    moar);
  t.deepEquals(
    config2,
    moar);
  t.end();
});
