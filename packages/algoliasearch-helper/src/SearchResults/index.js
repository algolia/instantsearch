'use strict';

var forEach = require('lodash/collection/forEach');
var compact = require('lodash/array/compact');
var indexOf = require('lodash/array/indexOf');
var findIndex = require('lodash/array/findIndex');

var sum = require('lodash/collection/sum');
var find = require('lodash/collection/find');
var includes = require('lodash/collection/includes');
var map = require('lodash/collection/map');
var sortByOrder = require('lodash/collection/sortByOrder');

var defaults = require('lodash/object/defaults');
var merge = require('lodash/object/merge');

var isArray = require('lodash/lang/isArray');
var isFunction = require('lodash/lang/isFunction');

var partial = require('lodash/function/partial');
var partialRight = require('lodash/function/partialRight');

var formatSort = require('../functions/formatSort');

var generateHierarchicalTree = require('./generate-hierarchical-tree');

/**
 * @typedef SearchResults.Facet
 * @type {object}
 * @property {string} name name of the attribute in the record
 * @property {object.<string, number>} data the facetting data: value, number of entries
 * @property {object} stats undefined unless facet_stats is retrieved from algolia
 */

/**
 * @typedef SearchResults.HierarchicalFacet
 * @type {object}
 * @property {string} name name of the current value given the hierarchical level, trimmed.
 *                         If root node, you get the facet name
 * @property {number} count number (integer) of objets matching this hierarchical value
 * @property {string} path the current hierarchical value full path
 * @property {boolean} isRefined true if the current value was refined, false otherwise
 * @property {SearchResults.HierarchicalFacet[]} data sub values for the current level
 */

/**
 * @typedef SearchResults.FacetValue
 * @type {object}
 * @property {value} string the facet value itself
 * @property {count} number times this facet appears in the results
 * @property {isRefined} boolean is the facet currently selected
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

/*eslint-disable */
/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Algolia using the
 * {@link AlgoliaSearchHelper}.
 * @param {SearchParameters} state state that led to the response
 * @param {object} algoliaResponse the response from algolia client
 * @example <caption>SearchResults of the first query in
 * <a href="http://demos.algolia.com/instant-search-demo">the instant search demo</a></caption>
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
/*eslint-enable */
function SearchResults(state, algoliaResponse) {
  var mainSubResponse = algoliaResponse.results[0];

  /**
   * query used to generate the results
   * @member {string}
   */
  this.query = mainSubResponse.query;
  /**
   * The query as parsed by the engine given all the rules.
   * @member {string}
   */
  this.parsedQuery = mainSubResponse.parsedQuery;
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
   * The position if the position was guessed by IP.
   * @member {string}
   * @example "48.8637,2.3615",
   */
  this.aroundLatLng = mainSubResponse.aroundLatLng;
  /**
   * The radius computed by Algolia.
   * @member {string}
   * @example "126792922",
   */
  this.automaticRadius = mainSubResponse.automaticRadius;
  /**
   * String identifying the server used to serve this request.
   * @member {string}
   * @example "c7-use-2.algolia.net",
   */
  this.serverUsed = mainSubResponse.serverUsed;
  /**
   * Boolean that indicates if the computation of the counts did time out.
   * @member {boolean}
   */
  this.timeoutCounts = mainSubResponse.timeoutCounts;
  /**
   * Boolean that indicates if the computation of the hits did time out.
   * @member {boolean}
   */
  this.timeoutHits = mainSubResponse.timeoutHits;

  /**
   * disjunctive facets results
   * @member {SearchResults.Facet[]}
   */
  this.disjunctiveFacets = [];
  /**
   * disjunctive facets results
   * @member {SearchResults.HierarchicalFacet[]}
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
  var nextDisjunctiveResult = 1;

  // Since we send request only for disjunctive facets that have been refined,
  // we get the facets informations from the first, general, response.
  forEach(mainSubResponse.facets, function(facetValueObject, facetKey) {
    var hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(
      state.hierarchicalFacets,
      facetKey
    );

    if (hierarchicalFacet) {
      // Place the hierarchicalFacet data at the correct index depending on the attributes order that was defined at the
      // helper initialization
      var facetIndex = hierarchicalFacet.attributes.indexOf(facetKey);
      this.hierarchicalFacets[findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name})][facetIndex] = {
        attribute: facetKey,
        data: facetValueObject,
        exhaustive: mainSubResponse.exhaustiveFacetsCount
      };
    } else {
      var isFacetDisjunctive = indexOf(state.disjunctiveFacets, facetKey) !== -1;
      var isFacetConjunctive = indexOf(state.facets, facetKey) !== -1;
      var position;

      if (isFacetDisjunctive) {
        position = disjunctiveFacetsIndices[facetKey];
        this.disjunctiveFacets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount
        };
        assignFacetStats(this.disjunctiveFacets[position], mainSubResponse.facets_stats, facetKey);
      }
      if (isFacetConjunctive) {
        position = facetsIndices[facetKey];
        this.facets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount
        };
        assignFacetStats(this.facets[position], mainSubResponse.facets_stats, facetKey);
      }
    }
  }, this);

  // Make sure we do not keep wholes within the hierarchical facets
  this.hierarchicalFacets = compact(this.hierarchicalFacets);

  // aggregate the refined disjunctive facets
  forEach(disjunctiveFacets, function(disjunctiveFacet) {
    var result = algoliaResponse.results[nextDisjunctiveResult];
    var hierarchicalFacet = state.getHierarchicalFacetByName(disjunctiveFacet);

    // There should be only item in facets.
    forEach(result.facets, function(facetResults, dfacet) {
      var position;

      if (hierarchicalFacet) {
        position = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
        var attributeIndex = findIndex(this.hierarchicalFacets[position], {attribute: dfacet});

        // previous refinements and no results so not able to find it
        if (attributeIndex === -1) {
          return;
        }

        this.hierarchicalFacets[position][attributeIndex].data = merge(
          {},
          this.hierarchicalFacets[position][attributeIndex].data,
          facetResults
        );
      } else {
        position = disjunctiveFacetsIndices[dfacet];

        var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};

        this.disjunctiveFacets[position] = {
          name: dfacet,
          data: defaults({}, facetResults, dataFromMainRequest),
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
    nextDisjunctiveResult++;
  }, this);

  // if we have some root level values for hierarchical facets, merge them
  forEach(state.getRefinedHierarchicalFacets(), function(refinedFacet) {
    var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
    var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);

    var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
    // if we are already at a root refinement (or no refinement at all), there is no
    // root level values request
    if (currentRefinement.length === 0 || currentRefinement[0].split(separator).length < 2) {
      return;
    }

    var result = algoliaResponse.results[nextDisjunctiveResult];

    forEach(result.facets, function(facetResults, dfacet) {
      var position = findIndex(state.hierarchicalFacets, {name: hierarchicalFacet.name});
      var attributeIndex = findIndex(this.hierarchicalFacets[position], {attribute: dfacet});

      // previous refinements and no results so not able to find it
      if (attributeIndex === -1) {
        return;
      }

      // when we always get root levels, if the hits refinement is `beers > IPA` (count: 5),
      // then the disjunctive values will be `beers` (count: 100),
      // but we do not want to display
      //   | beers (100)
      //     > IPA (5)
      // We want
      //   | beers (5)
      //     > IPA (5)
      var defaultData = {};

      if (currentRefinement.length > 0) {
        var root = currentRefinement[0].split(separator)[0];
        defaultData[root] = this.hierarchicalFacets[position][attributeIndex].data[root];
      }

      this.hierarchicalFacets[position][attributeIndex].data = defaults(
        defaultData,
        facetResults,
        this.hierarchicalFacets[position][attributeIndex].data
      );
    }, this);

    nextDisjunctiveResult++;
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
 * @deprecated
 * @param {string} name name of the attribute facetted
 * @return {SearchResults.Facet} the facet object
 */
SearchResults.prototype.getFacetByName = function(name) {
  var predicate = {name: name};

  return find(this.facets, predicate) ||
    find(this.disjunctiveFacets, predicate) ||
    find(this.hierarchicalFacets, predicate);
};

/**
 * Get the facet values of a specified attribute from a SearchResults object.
 * @private
 * @param {SearchResults} results the search results to search in
 * @param {string} attribute name of the facetted attribute to search for
 * @return {array|object} facet values. For the hierarchical facets it is an object.
 */
function extractNormalizedFacetValues(results, attribute) {
  var predicate = {name: attribute};
  if (results._state.isConjunctiveFacet(attribute)) {
    var facet = find(results.facets, predicate);
    if (!facet) return [];

    return map(facet.data, function(v, k) {
      return {
        name: k,
        count: v,
        isRefined: results._state.isFacetRefined(attribute, k)
      };
    });
  } else if (results._state.isDisjunctiveFacet(attribute)) {
    var disjunctiveFacet = find(results.disjunctiveFacets, predicate);
    if (!disjunctiveFacet) return [];

    return map(disjunctiveFacet.data, function(v, k) {
      return {
        name: k,
        count: v,
        isRefined: results._state.isDisjunctiveFacetRefined(attribute, k)
      };
    });
  } else if (results._state.isHierarchicalFacet(attribute)) {
    return find(results.hierarchicalFacets, predicate);
  }
}

/**
 * Sort nodes of a hierarchical facet results
 * @param {HierarchicalFacet} node node to upon which we want to apply the sort
 */
function recSort(sortFn, node) {
  if (!node.data || node.data.length === 0) {
    return node;
  }
  var children = map(node.data, partial(recSort, sortFn));
  var sortedChildren = sortFn(children);
  var newNode = merge({}, node, {data: sortedChildren});
  return newNode;
}

SearchResults.DEFAULT_SORT = ['isRefined:desc', 'count:desc', 'name:asc'];

function vanillaSortFn(order, data) {
  return data.sort(order);
}

/**
 * Get a the list of values for a given facet attribute. Those values are sorted
 * refinement first, descending count (bigger value on top), and name asending
 * (alphabetical order). The sort formula can overriden using either string based
 * predicates or a function.
 * @param {string} attribute attribute name
 * @param {object} options configuration options
 *                          - sortBy : function or array of string
 * @return {FacetValue[]|HierarchicalFacet} depending on the type of facet of
 * the attribute requested (hierarchical, disjunctive or conjunctive)
 * @example
 * helper.on('results', function(content){
 *   //get values ordered only by name ascending using the string predicate
 *   content.getFacetValues('city', {sortBy: ['name:asc']);
 *   //get values  ordered only by count ascending using a function
 *   content.getFacetValues('city', {
 *     sortBy: function(a, b) {
 *       return a.count - b.count;
 *     }
 *   });
 * });
 */
SearchResults.prototype.getFacetValues = function(attribute, opts) {
  var facetValues = extractNormalizedFacetValues(this, attribute);
  if (!facetValues) throw new Error(attribute + ' is not a retrieved facet.');

  var options = defaults({}, opts, {sortBy: SearchResults.DEFAULT_SORT});

  if (isArray(options.sortBy)) {
    var order = formatSort(options.sortBy);
    if (isArray(facetValues)) {
      return sortByOrder(facetValues, order[0], order[1]);
    }
    // If facetValues is not an array, it's an object thus a hierarchical facet object
    return recSort(partialRight(sortByOrder, order[0], order[1]), facetValues);
  } else if (isFunction(options.sortBy)) {
    if (isArray(facetValues)) {
      return facetValues.sort(options.sortBy);
    }
    // If facetValues is not an array, it's an object thus a hierarchical facet object
    return recSort(partial(vanillaSortFn, options.sortBy), facetValues);
  }
  throw new Error(
    'options.sortBy is optional but if defined it must be ' +
    'either an array of string (predicates) or a sorting function'
  );
};

/**
 * Returns the facet stats if attribute is defined and the facet contains some.
 * Otherwise returns undefined.
 * @param {string} attribute name of the facetted attribute
 * @return {object} The stats of the facet
 */
SearchResults.prototype.getFacetStats = function(attribute) {
  if (this._state.isConjunctiveFacet(attribute)) {
    return getFacetStatsIfAvailable(this.facets, attribute);
  } else if (this._state.isDisjunctiveFacet(attribute)) {
    return getFacetStatsIfAvailable(this.disjunctiveFacets, attribute);
  }

  throw new Error(attribute + ' is not present in `facets` or `disjunctiveFacets`');
};

function getFacetStatsIfAvailable(facetList, facetName) {
  var data = find(facetList, {name: facetName});
  return data && data.stats;
}

module.exports = SearchResults;
