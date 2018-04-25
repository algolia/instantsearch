'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var SearchParameters = algoliasearchHelper.SearchParameters;
var shortener = require('../../../src/SearchParameters/shortener');

var mapKeys = require('lodash/mapKeys');

var qs = require('qs');

var fakeClient = {};

test('setState should set the state of the helper and trigger a change event', function(t) {
  var state0 = {query: 'a query'};
  var state1 = {query: 'another query'};

  var helper = algoliasearchHelper(fakeClient, null, state0);

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
  var helper = algoliasearchHelper(fakeClient, null, initialState);

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

  t.deepEquals(helper.getState([]), {}, 'if an empty array is passed then we should get an empty object');
  t.deepEquals(
    helper.getState(['index', 'query', 'attribute:facetA', 'attribute:facetB', 'attribute:numerical']),
    stateFinalWithSpecificAttribute,
    '(getState) getState returned value should contain all the required elements');

  t.deepEquals(
    helper.getState(['attribute:facetC']),
    stateWithHierarchicalAttribute,
    '(getState) getState returned value should contain the hierarchical facet');

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

test('getStateFromQueryString should parse page as number and be consistent with the state', function(t) {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {});

  helper.setCurrentPage(10);

  var filters = ['page'];

  var queryString = helper.getStateAsQueryString({filters: filters});

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.page,
    helper.state.page,
    'Page should be consistent through query string serialization/deserialization');
  t.end();
});

test('getStateFromQueryString should use its options', function(t) {
  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    'is_notexistingparam=val&is_MyQuery=test&is_p=3&extra_param=val',
    {
      prefix: 'is_',
      mapping: {
        q: 'MyQuery'
      }
    }
  );

  t.deepEquals(
    partialStateFromQueryString,
    {
      query: 'test',
      page: 3
    },
    'Partial state should have used both the prefix and the mapping'
  );
  t.end();
});

test('should be able to get configuration that is not from algolia', function(t) {
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

  t.deepEquals(
    config1,
    moar);
  t.deepEquals(
    config2,
    moar);
  t.deepEquals(
    config3,
    moar);
  t.end();
});

test('setState should set a default hierarchicalFacetRefinement when a rootPath is defined', function(t) {
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

  t.deepEquals(initialHelperState.hierarchicalFacetsRefinements, {
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders']
  });

  // reset state
  helper.setState(helper.state.removeHierarchicalFacet('hierarchicalCategories.lvl0'));
  t.deepEquals(helper.getState().hierarchicalFacetsRefinements, {});

  // re-add `hierarchicalFacets`
  helper.setState(Object.assign({}, helper.state, searchParameters));
  var finalHelperState = Object.assign({}, helper.getState());

  t.deepEquals(initialHelperState, finalHelperState);
  t.deepEquals(finalHelperState.hierarchicalFacetsRefinements, {
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders']
  });

  t.end();
});
