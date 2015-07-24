'use strict';

var forEach = require('lodash/collection/forEach');
var compact = require('lodash/array/compact');
var indexOf = require('lodash/array/indexOf');
var sum = require('lodash/collection/sum');
var find = require('lodash/collection/find');
var includes = require('lodash/collection/includes');
var map = require('lodash/collection/map');
var findIndex = require('lodash/array/findIndex');

var extend = require('../functions/extend');
var generateHierarchicalTree = require('./generate-hierarchical-tree');

/**
 * @typedef SearchResults.Facet
 * @type {object}
 * @property {string} name name of the attribute in the record
 * @property {object.<string, number>} data the facetting data: value, number of entries
 * @property {object} stats undefined unless facet_stats is retrieved from algolia
 */

function getIndices(obj) {
  var indices = {};

  forEach(obj, function(val, idx) { indices[val] = idx; });

  return indices;
}

function assignFacetStats(dest, facetStats, key) {
  if (facetStats && facetStats[key]) {
    dest.stats = facetStats[key];
  }
}

function findMatchingHierarchicalFacetFromAttributeName(hierarchicalFacets, hierarchicalAttributeName) {
  return find(
    hierarchicalFacets,
    function facetKeyMatchesAttribute(hierarchicalFacet) {
      return includes(hierarchicalFacet.attributes, hierarchicalAttributeName);
    }
  );
}

/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Algolia using the
 * {@link AlgoliaSearchHelper}.
 * @param {SearchParameters} state state that led to the response
 * @param {object} algoliaResponse the response from algolia client
 * @example <caption>SearchResults of the first query in <a href="http://demos.algolia.com/instant-search-demo">the instant search demo</a></caption>
{
   "hitsPerPage": 10,
   "processingTimeMS": 2,
   "facets": [
      {
         "name": "type",
         "data": {
            "HardGood": 6627,
            "BlackTie": 550,
            "Music": 665,
            "Software": 131,
            "Game": 456,
            "Movie": 1571
         },
         "exhaustive": false
      },
      {
         "exhaustive": false,
         "data": {
            "Free shipping": 5507
         },
         "name": "shipping"
      }
  ],
   "hits": [
      {
         "thumbnailImage": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_54x108_s.gif",
         "_highlightResult": {
            "shortDescription": {
               "matchLevel": "none",
               "value": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
               "matchedWords": []
            },
            "category": {
               "matchLevel": "none",
               "value": "Computer Security Software",
               "matchedWords": []
            },
            "manufacturer": {
               "matchedWords": [],
               "value": "Webroot",
               "matchLevel": "none"
            },
            "name": {
               "value": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
               "matchedWords": [],
               "matchLevel": "none"
            }
         },
         "image": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_105x210_sc.jpg",
         "shipping": "Free shipping",
         "bestSellingRank": 4,
         "shortDescription": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
         "url": "http://www.bestbuy.com/site/webroot-secureanywhere-internet-security-3-devi…d=1219060687969&skuId=1688832&cmp=RMX&ky=2d3GfEmNIzjA0vkzveHdZEBgpPCyMnLTJ",
         "name": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
         "category": "Computer Security Software",
         "salePrice_range": "1 - 50",
         "objectID": "1688832",
         "type": "Software",
         "customerReviewCount": 5980,
         "salePrice": 49.99,
         "manufacturer": "Webroot"
      },
      ....
  ],
   "nbHits": 10000,
   "disjunctiveFacets": [
      {
         "exhaustive": false,
         "data": {
            "5": 183,
            "12": 112,
            "7": 149,
            ...
         },
         "name": "customerReviewCount",
         "stats": {
            "max": 7461,
            "avg": 157.939,
            "min": 1
         }
      },
      {
         "data": {
            "Printer Ink": 142,
            "Wireless Speakers": 60,
            "Point & Shoot Cameras": 48,
            ...
         },
         "name": "category",
         "exhaustive": false
      },
      {
         "exhaustive": false,
         "data": {
            "> 5000": 2,
            "1 - 50": 6524,
            "501 - 2000": 566,
            "201 - 500": 1501,
            "101 - 200": 1360,
            "2001 - 5000": 47
         },
         "name": "salePrice_range"
      },
      {
         "data": {
            "Dynex™": 202,
            "Insignia™": 230,
            "PNY": 72,
            ...
         },
         "name": "manufacturer",
         "exhaustive": false
      }
  ],
   "query": "",
   "nbPages": 100,
   "page": 0,
   "index": "bestbuy"
}
 **/
function SearchResults(state, algoliaResponse) {
  var mainSubResponse = algoliaResponse.results[0];

  /**
   * query used to generate the results
   * @member {string}
   */
  this.query = mainSubResponse.query;
  /**
   * all the records that match the search parameters. It also contains _highlightResult,
   * which describe which and how the attributes are matched.
   * @member {object[]}
   */
  this.hits = mainSubResponse.hits;
  /**
   * index where the results come from
   * @member {string}
   */
  this.index = mainSubResponse.index;
  /**
   * number of hits per page requested
   * @member {number}
   */
  this.hitsPerPage = mainSubResponse.hitsPerPage;
  /**
   * total number of hits of this query on the index
   * @member {number}
   */
  this.nbHits = mainSubResponse.nbHits;
  /**
   * total number of pages with respect to the number of hits per page and the total number of hits
   * @member {number}
   */
  this.nbPages = mainSubResponse.nbPages;
  /**
   * current page
   * @member {number}
   */
  this.page = mainSubResponse.page;
  /**
   * sum of the processing time of all the queries
   * @member {number}
   */
  this.processingTimeMS = sum(algoliaResponse.results, 'processingTimeMS');
  /**
   * disjunctive facets results
   * @member {SearchResults.Facet[]}
   */
  this.disjunctiveFacets = [];
  /**
   * disjunctive facets results
   * @member {SearchResults.Facet[]}
   */
  this.hierarchicalFacets = map(state.hierarchicalFacets, function initFutureTree() {
    return [];
  });
  /**
   * other facets results
   * @member {SearchResults.Facet[]}
   */
  this.facets = [];

  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

  var facetsIndices = getIndices(state.facets);
  var disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);

  // Since we send request only for disjunctive facets that have been refined,
  // we get the facets informations from the first, general, response.
  forEach(mainSubResponse.facets, function(facetValueObject, facetKey) {
    var hierarchicalFacet;

    if (hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(state.hierarchicalFacets, facetKey)) {
      this.hierarchicalFacets[findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name})].push({
        attribute: facetKey,
        data: facetValueObject,
        exhaustive: mainSubResponse.exhaustiveFacetsCount
      });
    } else {
      var isFacetDisjunctive = indexOf(state.disjunctiveFacets, facetKey) !== -1;
      var position = isFacetDisjunctive ? disjunctiveFacetsIndices[facetKey] :
        facetsIndices[facetKey];

      if (isFacetDisjunctive) {
        this.disjunctiveFacets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount
        };
        assignFacetStats(this.disjunctiveFacets[position], mainSubResponse.facets_stats, facetKey);
      } else {
        this.facets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount
        };
        assignFacetStats(this.facets[position], mainSubResponse.facets_stats, facetKey);
      }
    }
  }, this);

  // aggregate the refined disjunctive facets
  forEach(disjunctiveFacets, function(disjunctiveFacet, idx) {
    var result = algoliaResponse.results[idx + 1];
    var hierarchicalFacet = state.getHierarchicalFacetByName(disjunctiveFacet);

    // There should be only item in facets.
    forEach(result.facets, function(facetResults, dfacet) {
      var position;

      if (hierarchicalFacet) {
        position = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
        var attributeIndex = findIndex(this.hierarchicalFacets[position], {attribute: dfacet});
        this.hierarchicalFacets[position][attributeIndex].data = extend({}, this.hierarchicalFacets[position][attributeIndex].data, facetResults);
      } else {
        position = disjunctiveFacetsIndices[dfacet];

        var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};

        this.disjunctiveFacets[position] = {
          name: dfacet,
          data: extend({}, dataFromMainRequest, facetResults),
          exhaustive: result.exhaustiveFacetsCount
        };
        assignFacetStats(this.disjunctiveFacets[position], result.facets_stats, dfacet);

        if (state.disjunctiveFacetsRefinements[dfacet]) {
          forEach(state.disjunctiveFacetsRefinements[dfacet], function(refinementValue) {
            // add the disjunctive refinements if it is no more retrieved
            if (!this.disjunctiveFacets[position].data[refinementValue] &&
              indexOf(state.disjunctiveFacetsRefinements[dfacet], refinementValue) > -1) {
              this.disjunctiveFacets[position].data[refinementValue] = 0;
            }
          }, this);
        }
      }
    }, this);
  }, this);

  // add the excludes
  forEach(state.facetsExcludes, function(excludes, facetName) {
    var position = facetsIndices[facetName];

    this.facets[position] = {
      name: facetName,
      data: mainSubResponse.facets[facetName],
      exhaustive: mainSubResponse.exhaustiveFacetsCount
    };
    forEach(excludes, function(facetValue) {
      this.facets[position] = this.facets[position] || {name: facetName};
      this.facets[position].data = this.facets[position].data || {};
      this.facets[position].data[facetValue] = 0;
    }, this);
  }, this);

  this.hierarchicalFacets = map(this.hierarchicalFacets, generateHierarchicalTree(state));

  this.facets = compact(this.facets);
  this.disjunctiveFacets = compact(this.disjunctiveFacets);

  this._state = state;
}

/**
 * Get a facet object with its name
 * @param {string} name name of the attribute facetted
 * @return {SearchResults.Facet} the facet object
 */
SearchResults.prototype.getFacetByName = function(name) {
  var isName = function(facet) { return facet.name === name; };

  var indexInFacets = find(this.facets, isName);

  return indexInFacets || find(this.disjunctiveFacets, isName);
};

module.exports = SearchResults;
