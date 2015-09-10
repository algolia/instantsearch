'use strict';
var invert = require('lodash/object/invert');

var keys2Short = {
  'index': 'idx',
  'query': 'q',
  'facets': 'f',
  'disjunctiveFacets': 'dF',
  'hierarchicalFacets': 'hF',
  'facetsRefinements': 'fR',
  'facetsExcludes': 'fE',
  'disjunctiveFacetsRefinements': 'dFR',
  'numericRefinements': 'nR',
  'tagRefinements': 'tR',
  'hierarchicalFacetsRefinements': 'hFR',
  'numericFilters': 'nF',
  'tagFilters': 'tF',
  'hitsPerPage': 'hPP',
  'maxValuesPerFacet': 'mVPF',
  'page': 'p',
  'queryType': 'qT',
  'typoTolerance': 'tT',
  'minWordSizefor1Typo': 'mWS1T',
  'minWordSizefor2Typos': 'mWS2T',
  'allowTyposOnNumericTokens': 'aTONT',
  'ignorePlurals': 'iP',
  'restrictSearchableAttributes': 'rSA',
  'advancedSyntax': 'aS',
  'analytics': 'a',
  'analyticsTags': 'aT',
  'synonyms': 's',
  'replaceSynonymsInHighlight': 'rSIH',
  'optionalWords': 'oW',
  'removeWordsIfNoResults': 'rWINR',
  'attributesToRetrieve': 'aTR',
  'attributesToHighlight': 'aTH',
  'highlightPreTag': 'hPrT',
  'highlightPostTag': 'hPoT',
  'attributesToSnippet': 'aTS',
  'getRankingInfo': 'gRI',
  'distinct': 'd',
  'aroundLatLng': 'aLL',
  'aroundLatLngViaIP': 'aLLVIP',
  'aroundRadius': 'aR',
  'aroundPrecision': 'aP',
  'insideBoundingBox': 'iBB',
  'offset': 'o',
  'length': 'l'
};

var short2Keys = invert(keys2Short);

module.exports = {
  decode: function(shortKey) {
    return short2Keys[shortKey];
  },
  encode: function(key) {
    return keys2Short[key];
  }
};
