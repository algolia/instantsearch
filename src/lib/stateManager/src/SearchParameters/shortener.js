'use strict';

var invert = require('lodash/invert');
var keys = require('lodash/keys');

var keys2Short = {
  advancedSyntax: 'aS',
  allowTyposOnNumericTokens: 'aTONT',
  analyticsTags: 'aT',
  analytics: 'a',
  aroundLatLngViaIP: 'aLLVIP',
  aroundLatLng: 'aLL',
  aroundPrecision: 'aP',
  aroundRadius: 'aR',
  attributesToHighlight: 'aTH',
  attributesToRetrieve: 'aTR',
  attributesToSnippet: 'aTS',
  disjunctiveFacetsRefinements: 'dFR',
  disjunctiveFacets: 'dF',
  distinct: 'd',
  facetsExcludes: 'fE',
  facetsRefinements: 'fR',
  facets: 'f',
  getRankingInfo: 'gRI',
  hierarchicalFacetsRefinements: 'hFR',
  hierarchicalFacets: 'hF',
  highlightPostTag: 'hPoT',
  highlightPreTag: 'hPrT',
  hitsPerPage: 'hPP',
  ignorePlurals: 'iP',
  index: 'idx',
  insideBoundingBox: 'iBB',
  insidePolygon: 'iPg',
  length: 'l',
  maxValuesPerFacet: 'mVPF',
  minimumAroundRadius: 'mAR',
  minProximity: 'mP',
  minWordSizefor1Typo: 'mWS1T',
  minWordSizefor2Typos: 'mWS2T',
  numericFilters: 'nF',
  numericRefinements: 'nR',
  offset: 'o',
  optionalWords: 'oW',
  page: 'p',
  queryType: 'qT',
  query: 'q',
  removeWordsIfNoResults: 'rWINR',
  replaceSynonymsInHighlight: 'rSIH',
  restrictSearchableAttributes: 'rSA',
  synonyms: 's',
  tagFilters: 'tF',
  tagRefinements: 'tR',
  typoTolerance: 'tT',
  optionalTagFilters: 'oTF',
  optionalFacetFilters: 'oFF',
  snippetEllipsisText: 'sET',
  disableExactOnAttributes: 'dEOA',
  enableExactOnSingleWordQuery: 'eEOSWQ'
};

var short2Keys = invert(keys2Short);

module.exports = {
  /**
   * All the keys of the state, encoded.
   * @const
   */
  ENCODED_PARAMETERS: keys(short2Keys),
  /**
   * Decode a shorten attribute
   * @param {string} shortKey the shorten attribute
   * @return {string} the decoded attribute, undefined otherwise
   */
  decode: function(shortKey) {
    return short2Keys[shortKey];
  },
  /**
   * Encode an attribute into a short version
   * @param {string} key the attribute
   * @return {string} the shorten attribute
   */
  encode: function(key) {
    return keys2Short[key];
  }
};
