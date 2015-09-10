'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../index');
var SearchParameters = algoliasearchHelper.SearchParameters;

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

  t.deepEquals(
    qs.parse(helper.getStateAsQueryString(filters)),
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
  newHelper.setStateAsQueryString(helper.getStateAsQueryString(filters));

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
  newHelper.setStateAsQueryString(helper.getStateAsQueryString(filters));

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
  var queryString = helper.getStateAsQueryString(filters) + '&foo=bar&toto=tata';
  newHelper.setStateAsQueryString(queryString);

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

  var qString = helper.getStateAsQueryString(filters, {prefix: prefix});
  var parsedQs = qs.parse(qString);

  t.deepEquals(
    parsedQs,
    {
      toto_facetsRefinements: helper.state.facetsRefinements,
      toto_disjunctiveFacetsRefinements: helper.state.disjunctiveFacetsRefinements,
      toto_numericRefinements: helper.state.numericRefinements,
      toto_query: helper.state.query,
      toto_index: index
    },
    'deserialized qs with prefix should be equal to the state with prefix');

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
    filters,
    {
      prefix: prefix,
      moreAttributes: {
        toto: 'tata',
        foo: 'bar'
      }
    }
  );
  var parsedQs = qs.parse(qString);

  t.deepEquals(
    parsedQs,
    {
      toto_facetsRefinements: helper.state.facetsRefinements,
      toto_disjunctiveFacetsRefinements: helper.state.disjunctiveFacetsRefinements,
      toto_numericRefinements: helper.state.numericRefinements,
      toto_query: helper.state.query,
      toto: 'tata',
      foo: 'bar'
    },
    'deserialized qs with prefix should be equal to the state with prefix and keep the custom attributes');

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
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  var filters = ['index', 'query', 'attribute:*'];

  var newHelper = algoliasearchHelper(null, null, initialState);
  var queryString = helper.getStateAsQueryString(filters, {prefix: 'calimerou_'});
  newHelper.setStateAsQueryString(queryString, {prefix: 'calimerou_'});

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
