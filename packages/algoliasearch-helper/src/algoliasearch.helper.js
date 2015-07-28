'use strict';

var SearchParameters = require('./SearchParameters');
var SearchResults = require('./SearchResults');
var extend = require('./functions/extend');
var util = require('util');
var events = require('events');
var forEach = require('lodash/collection/forEach');
var isEmpty = require('lodash/lang/isEmpty');
var bind = require('lodash/function/bind');
var reduce = require('lodash/collection/reduce');
var map = require('lodash/collection/map');
var trim = require('lodash/string/trim');

/**
 * Initialize a new AlgoliaSearchHelper
 * @class
 * @classdesc The AlgoliaSearchHelper is a class that ease the management of the
 * search. It provides an event based interface for search callbacks:
 *  - change: when the internal search state is changed.
 *    This event contains a {@link SearchParameters} object and the {@link SearchResults} of the last result if any.
 *  - result: when the response is retrieved from Algolia and is processed.
 *    This event contains a {@link SearchResults} object and the {@link SearchParameters} corresponding to this answer.
 *  - error: when the response is an error. This event contains the error returned by the server.
 * @param  {AlgoliaSearch} client an AlgoliaSearch client
 * @param  {string} index the index name to query
 * @param  {SearchParameters | object} options an object defining the initial config of the search. It doesn't have to be a {SearchParameters}, just an object containing the properties you need from it.
 */
function AlgoliaSearchHelper(client, index, options) {
  this.client = client;
  this.index = index;
  this.state = SearchParameters.make(options);
  this.lastResults = null;
  this._queryId = 0;
  this._lastQueryIdReceived = -1;
}

util.inherits(AlgoliaSearchHelper, events.EventEmitter);

/**
 * Start the search with the parameters set in the state.
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.search = function() {
  this._search();
  return this;
};

/**
 * Sets the query. Also sets the current page to 0.
 * @param  {string} q the user query
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.setQuery = function(q) {
  this.state = this.state.setQuery(q);
  this._change();
  return this;
};

/**
 * Remove all refinements (disjunctive + conjunctive + excludes + numeric filters)
 * @param {string} [name] - If given, name of the facet / attribute on which  we want to remove all refinements
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.clearRefinements = function(name) {
  this.state = this.state.clearRefinements(name);
  this._change();
  return this;
};

/**
 * Remove all the tag filtering
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.clearTags = function() {
  this.state = this.state.clearTags();
  this._change();
  return this;
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value (will be converted to string)
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function(facet, value) {
  this.state = this.state.addDisjunctiveFacetRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Add a numeric refinement on the given attribute
 * @param  {string} attribute the attribute on which the numeric filter applies
 * @param  {string} operator the operator of the filter
 * @param  {number} value the value of the filter
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.addNumericRefinement = function(attribute, operator, value) {
  this.state = this.state.addNumericRefinement(attribute, operator, value);
  this._change();
  return this;
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value (will be converted to string)
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.addRefine = function(facet, value) {
  this.state = this.state.addFacetRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Ensure a facet exclude exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value (will be converted to string)
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.addExclude = function(facet, value) {
  this.state = this.state.addExcludeRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Add a tag refinement
 * @param {string} tag the tag to add to the filter
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.addTag = function(tag) {
  this.state = this.state.addTagRefinement(tag);
  this._change();
  return this;
};

/**
 * Remove a numeric filter.
 * @param  {string} attribute the attribute on which the numeric filter applies
 * @param  {string} operator the operator of the filter
 * @param  {number} value the value of the filter
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.removeNumericRefinement = function(attribute, operator, value) {
  this.state = this.state.removeNumericRefinement(attribute, operator, value);
  this._change();
  return this;
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function(facet, value) {
  this.state = this.state.removeDisjunctiveFacetRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.removeRefine = function(facet, value) {
  this.state = this.state.removeFacetRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Ensure a facet exclude does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.removeExclude = function(facet, value) {
  this.state = this.state.removeExcludeRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Ensure that a tag is not filtering the results
 * @param {string} tag tag to remove from the filter
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.removeTag = function(tag) {
  this.state = this.state.removeTagRefinement(tag);
  this._change();
  return this;
};

/**
 * Toggle refinement state of an exclude
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.toggleExclude = function(facet, value) {
  this.state = this.state.toggleExcludeFacetRefinement(facet, value);
  this._change();
  return this;
};

/**
 * Toggle refinement state of a facet
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {AlgoliaSearchHelper}
 * @throws will throw an error if the facet is not declared in the settings of the helper
 */
AlgoliaSearchHelper.prototype.toggleRefine = function(facet, value) {
  if (this.state.isHierarchicalFacet(facet)) {
    this.state = this.state.toggleHierarchicalFacetRefinement(facet, value);
  } else if (this.state.isConjunctiveFacet(facet)) {
    this.state = this.state.toggleFacetRefinement(facet, value);
  } else if (this.state.isDisjunctiveFacet(facet)) {
    this.state = this.state.toggleDisjunctiveFacetRefinement(facet, value);
  } else {
    throw new Error('Cannot refine the undeclared facet ' + facet +
      '; it should be added to the helper options facets or disjunctiveFacets');
  }

  this._change();
  return this;
};

/**
 * Toggle tag refinement
 * @param {string} tag tag to remove or add
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.toggleTag = function(tag) {
  this.state = this.state.toggleTagRefinement(tag);
  this._change();
  return this;
};

/**
 * Go to next page
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.nextPage = function() {
  return this.setCurrentPage(this.state.page + 1);
};

/**
 * Go to previous page
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.previousPage = function() {
  return this.setCurrentPage(this.state.page - 1);
};

/**
 * Change the current page
 * @param  {integer} page The page number
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.setCurrentPage = function(page) {
  if (page < 0) throw new Error('Page requested below 0.');

  this.state = this.state.setPage(page);
  this._change();
  return this;
};

/**
 * Configure the underlying index name
 * @param {string} name the index name
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.setIndex = function(name) {
  this.index = name;
  this.setCurrentPage(0);
  return this;
};

/**
 * Update any single parameter of the state/configuration (based on SearchParameters).
 * @param {string} parameter name of the parameter to update
 * @param {any} value new value of the parameter
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.setQueryParameter = function(parameter, value) {
  var newState = this.state.setQueryParameter(parameter, value);

  if (this.state === newState) return this;

  this.state = newState;
  this._change();
  return this;
};

/**
 * Set the whole state (warning: will erase previous state)
 * @param {SearchParameters} newState the whole new state
 * @return {AlgoliaSearchHelper}
 */
AlgoliaSearchHelper.prototype.setState = function(newState) {
  this.state = new SearchParameters(newState);
  this._change();
  return this;
};

/**
 * Get the current search state stored in the helper. This object is immutable.
 * @return {SearchParameters}
 */
AlgoliaSearchHelper.prototype.getState = function() {
  return this.state;
};

/**
 * Override the current state without triggering a change event.
 * Do not use this method unless you know what you are doing. (see the example
 * for a legit use case)
 * @param {SearchParameters} newState the whole new state
 * @return {AlgoliaSearchHelper}
 * @example
 *  helper.on('change', function(state){
 *    // In this function you might want to find a way to store the state in the url/history
 *    updateYourURL(state)
 *  })
 *  window.onpopstate = function(event){
 *    // This is naive though as you should check if the state is really defined etc.
 *    helper.overrideStateWithoutTriggeringChangeEvent(event.state).search()
 *  }
 */
AlgoliaSearchHelper.prototype.overrideStateWithoutTriggeringChangeEvent = function(newState) {
  this.state = new SearchParameters(newState);
  return this;
};

/**
 * Check the refinement state of a given value for a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isRefined = function(facet, value) {
  if (this.state.isConjunctiveFacet(facet)) {
    return this.state.isFacetRefined(facet, value);
  } else if (this.state.isDisjunctiveFacet(facet)) {
    return this.state.isDisjunctiveFacetRefined(facet, value);
  }

  throw new Error(facet +
    ' is not properly defined in this helper configuration' +
    '(use the facets or disjunctiveFacets keys to configure it)');
};

/**
 * Check if the attribute has any numeric, disjunctive or conjunctive refinements
 * @param {string} attribute the name of the attribute
 * @return {boolean} true if the attribute is filtered by at least one value
 */
AlgoliaSearchHelper.prototype.hasRefinements = function(attribute) {
  var attributeHasNumericRefinements = !isEmpty(this.state.getNumericRefinements(attribute));
  var isFacetDeclared = this.state.isConjunctiveFacet(attribute) || this.state.isDisjunctiveFacet(attribute);

  if (!attributeHasNumericRefinements && isFacetDeclared) {
    return this.state.isFacetRefined(attribute);
  }

  return attributeHasNumericRefinements;
};

/**
 * Check the exclude state of a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isExcluded = function(facet, value) {
  return this.state.isExcludeRefined(facet, value);
};

/**
 * Check the refinement state of the disjunctive facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isDisjunctiveRefined = function(facet, value) {
  return this.state.isDisjunctiveFacetRefined(facet, value);
};

/**
 * Check if the string is a currently filtering tag
 * @param {string} tag tag to check
 * @return {boolean}
 */
AlgoliaSearchHelper.prototype.isTagRefined = function(tag) {
  return this.state.isTagRefined(tag);
};

/**
 * Get the underlying configured index name
 * @return {string}
 */
AlgoliaSearchHelper.prototype.getIndex = function() {
  return this.index;
};

/**
 * Get the currently selected page
 * @return {number} the current page
 */
AlgoliaSearchHelper.prototype.getCurrentPage = function() {
  return this.state.page;
};

/**
 * Get all the filtering tags
 * @return {string[]}
 */
AlgoliaSearchHelper.prototype.getTags = function() {
  return this.state.tagRefinements;
};

/**
 * Get a parameter of the search by its name
 * @param {string} parameterName the parameter name
 * @return {any} the parameter value
 */
AlgoliaSearchHelper.prototype.getQueryParameter = function(parameterName) {
  return this.state.getQueryParameter(parameterName);
};

/**
 * Get the list of refinements for a given attribute.
 * @param {string} facetName attribute name used for facetting
 * @return {Refinement[]} All Refinement are objects that contain a value, and a type. Numeric also contains an operator.
 */
AlgoliaSearchHelper.prototype.getRefinements = function(facetName) {
  var refinements = [];

  if (this.state.isConjunctiveFacet(facetName)) {
    var conjRefinements = this.state.getConjunctiveRefinements(facetName);

    forEach(conjRefinements, function(r) {
      refinements.push({
        value: r,
        type: 'conjunctive'
      });
    });

    var excludeRefinements = this.state.getExcludeRefinements(facetName);

    forEach(excludeRefinements, function(r) {
      refinements.push({
        value: r,
        type: 'exclude'
      });
    });
  } else if (this.state.isDisjunctiveFacet(facetName)) {
    var disjRefinements = this.state.getDisjunctiveRefinements(facetName);

    forEach(disjRefinements, function(r) {
      refinements.push({
        value: r,
        type: 'disjunctive'
      });
    });
  }

  var numericRefinements = this.state.getNumericRefinements(facetName);

  forEach(numericRefinements, function(value, operator) {
    refinements.push({
      value: value,
      operator: operator,
      type: 'numeric'
    });
  });

  return refinements;
};

/**
 * Get the current breadcrumb for a hierarchical facet, as an array
 * @param  {string} facetName Hierarchical facet name
 * @return {array}
 */
AlgoliaSearchHelper.prototype.getHierarchicalFacetBreadcrumb = function(facetName) {
  return map(
    this
      .state
      .getHierarchicalRefinement(facetName)[0]
      .split(this.state._getHierarchicalFacetSeparator(
        this.state.getHierarchicalFacetByName(facetName)
      )), function trimName(facetValue) { return trim(facetValue); }
  );
};

// /////////// PRIVATE

/**
 * Perform the underlying queries
 * @private
 * @return {undefined}
 */
AlgoliaSearchHelper.prototype._search = function() {
  var state = this.state;

  this.client.search(this._getQueries(),
    bind(this._handleResponse,
      this,
      state,
      this._queryId++));
};

/**
 * Get all the queries to send to the client, those queries can used directly
 * with the Algolia client.
 * @private
 * @return {object[]} The queries
 */
AlgoliaSearchHelper.prototype._getQueries = function getQueries() {
  var queries = [];

  // One query for the hits
  queries.push({
    indexName: this.index,
    query: this.state.query,
    params: this._getHitsSearchParams()
  });

  // One for each disjunctive facets
  forEach(this.state.getRefinedDisjunctiveFacets(), function(refinedFacet) {
    queries.push({
      indexName: this.index,
      query: this.state.query,
      params: this._getDisjunctiveFacetSearchParams(refinedFacet)
    });
  }, this);

  return queries;
};

/**
 * Transform the response as sent by the server and transform it into a user
 * usable objet that merge the results of all the batch requests.
 * @private
 * @param {SearchParameters} state state used for to generate the request
 * @param {number} queryId id of the current request
 * @param {Error} err error if any, null otherwise
 * @param {object} content content of the response
 * @return {undefined}
 */
AlgoliaSearchHelper.prototype._handleResponse = function(state, queryId, err, content) {
  if (queryId < this._lastQueryIdReceived) {
    // Outdated answer
    return;
  }

  this._lastQueryIdReceived = queryId;

  if (err) {
    this.emit('error', err);
    return;
  }

  var formattedResponse = this.lastResults = new SearchResults(state, content);

  this.emit('result', formattedResponse, state);
};

/**
 * Build search parameters used to fetch hits
 * @private
 * @return {object.<string, any>}
 */
AlgoliaSearchHelper.prototype._getHitsSearchParams = function() {
  var facets = this.state.facets
    .concat(this.state.disjunctiveFacets)
    .concat(this._getHitsHierarchicalFacetsAttributes());

  var facetFilters = this._getFacetFilters();
  var numericFilters = this._getNumericFilters();
  var tagFilters = this._getTagFilters();
  var additionalParams = {
    facets: facets,
    tagFilters: tagFilters
  };

  if (this.state.distinct === true || this.state.distinct === false) {
    additionalParams.distinct = this.state.distinct;
  }

  if (facetFilters.length > 0) {
    additionalParams.facetFilters = facetFilters;
  }

  if (numericFilters.length > 0) {
    additionalParams.numericFilters = numericFilters;
  }

  return extend(this.state.getQueryParams(), additionalParams);
};

/**
 * Build search parameters used to fetch a disjunctive facet
 * @private
 * @param  {string} facet the associated facet name
 * @return {object}
 */
AlgoliaSearchHelper.prototype._getDisjunctiveFacetSearchParams = function(facet) {
  var facetFilters = this._getFacetFilters(facet);
  var numericFilters = this._getNumericFilters(facet);
  var tagFilters = this._getTagFilters();
  var additionalParams = {
    hitsPerPage: 1,
    page: 0,
    attributesToRetrieve: [],
    attributesToHighlight: [],
    attributesToSnippet: [],
    tagFilters: tagFilters
  };

  var hierarchicalFacet = this.state.getHierarchicalFacetByName(facet);

  if (hierarchicalFacet) {
    additionalParams.facets = [this._getDisjunctiveHierarchicalFacetAttribute(hierarchicalFacet)];
  } else {
    additionalParams.facets = facet;
  }

  if (this.state.distinct === true || this.state.distinct === false) {
    additionalParams.distinct = this.state.distinct;
  }

  if (numericFilters.length > 0) {
    additionalParams.numericFilters = numericFilters;
  }

  if (facetFilters.length > 0) {
    additionalParams.facetFilters = facetFilters;
  }

  return extend(this.state.getQueryParams(), additionalParams);
};

AlgoliaSearchHelper.prototype.containsRefinement = function(query, facetFilters, numericFilters, tagFilters) {
  return query ||
    facetFilters.length !== 0 ||
    numericFilters.length !== 0 ||
    tagFilters.length !== 0;
};

/**
 * Return the numeric filters in an algolia request fashion
 * @private
 * @param {string} [facetName] the name of the attribute for which the filters should be excluded
 * @return {string[]} the numeric filters in the algolia format
 */
AlgoliaSearchHelper.prototype._getNumericFilters = function(facetName) {
  var numericFilters = [];

  forEach(this.state.numericRefinements, function(operators, attribute) {
    forEach(operators, function(value, operator) {
      if (facetName !== attribute) {
        numericFilters.push(attribute + operator + value);
      }
    });
  });

  return numericFilters;
};

/**
 * Return the tags filters depending
 * @private
 * @return {string}
 */
AlgoliaSearchHelper.prototype._getTagFilters = function() {
  if (this.state.tagFilters) {
    return this.state.tagFilters;
  }

  return this.state.tagRefinements.join(',');
};

/**
 * Test if there are some disjunctive refinements on the facet
 * @private
 * @param {string} facet the attribute to test
 * @return {boolean}
 */
AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function(facet) {
  return this.state.disjunctiveRefinements[facet] &&
    this.state.disjunctiveRefinements[facet].length > 0;
};

/**
 * Build facetFilters parameter based on current refinements. The array returned
 * contains strings representing the facet filters in the algolia format.
 * @private
 * @param  {string} [facet] if set, the current disjunctive facet
 * @return {array.<string>}
 */
AlgoliaSearchHelper.prototype._getFacetFilters = function(facet) {
  var facetFilters = [];

  forEach(this.state.facetsRefinements, function(facetValues, facetName) {
    forEach(facetValues, function(facetValue) {
      facetFilters.push(facetName + ':' + facetValue);
    });
  });

  forEach(this.state.facetsExcludes, function(facetValues, facetName) {
    forEach(facetValues, function(facetValue) {
      facetFilters.push(facetName + ':-' + facetValue);
    });
  });

  forEach(this.state.disjunctiveFacetsRefinements, function(facetValues, facetName) {
    if (facetName === facet || !facetValues || facetValues.length === 0) return;
    var orFilters = [];

    forEach(facetValues, function(facetValue) {
      orFilters.push(facetName + ':' + facetValue);
    });

    facetFilters.push(orFilters);
  });

  forEach(this.state.hierarchicalFacetsRefinements, function(facetValues, facetName) {
    var facetValue = facetValues[0];

    if (facetValue === undefined) {
      return;
    }

    var hierarchicalFacet = this.state.getHierarchicalFacetByName(facetName);
    var separator = this.state._getHierarchicalFacetSeparator(hierarchicalFacet);
    var attributeToRefine;

    // we ask for parent facet values only when the `facet` is the current hierarchical facet
    if (facet === facetName) {
      // if we are at the root level already, no need to ask for facet values, we get them from
      // the hits query
      if (facetValue.indexOf(separator) === -1 || hierarchicalFacet.alwaysGetRootLevel === true) {
        return;
      }

      attributeToRefine = hierarchicalFacet.attributes[facetValue.split(separator).length - 2];
      facetValue = facetValue.slice(0, facetValue.lastIndexOf(separator));
    } else {
      attributeToRefine = hierarchicalFacet.attributes[facetValue.split(separator).length - 1];
    }

    facetFilters.push([attributeToRefine + ':' + facetValue]);
  }, this);

  return facetFilters;
};

AlgoliaSearchHelper.prototype._change = function() {
  this.emit('change', this.state, this.lastResults);
};

AlgoliaSearchHelper.prototype._getHitsHierarchicalFacetsAttributes = function() {
  var out = [];

  return reduce(
    this.state.hierarchicalFacets,
    // ask for as much levels as there's hierarchical refinements
    function getHitsAttributesForHierarchicalFacet(allAttributes, hierarchicalFacet) {
      var hierarchicalRefinement = this.state.getHierarchicalRefinement(hierarchicalFacet.name)[0];

      // if no refinement, ask for root level
      if (!hierarchicalRefinement) {
        allAttributes.push(hierarchicalFacet.attributes[0]);
        return allAttributes;
      }

      var level = hierarchicalRefinement.split(this.state._getHierarchicalFacetSeparator(hierarchicalFacet)).length;
      var newAttributes = hierarchicalFacet.attributes.slice(0, level + 1);

      return allAttributes.concat(newAttributes);
    }, out, this);
};

AlgoliaSearchHelper.prototype._getDisjunctiveHierarchicalFacetAttribute = function(hierarchicalFacet) {
  if (hierarchicalFacet.alwaysGetRootLevel) {
    return hierarchicalFacet.attributes[0];
  }

  var hierarchicalRefinement = this.state.getHierarchicalRefinement(hierarchicalFacet.name)[0] || '';
  // if refinement is 'beers > IPA > Flying dog',
  // then we want `facets: ['beers > IPA']` as disjunctive facet (parent level values)

  var parentLevel = hierarchicalRefinement.split(this.state._getHierarchicalFacetSeparator(hierarchicalFacet)).length - 1;
  return hierarchicalFacet.attributes[parentLevel];
};

module.exports = AlgoliaSearchHelper;
