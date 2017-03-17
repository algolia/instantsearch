import algolia from 'algoliasearch'
import algoliaHelper from 'algoliasearch-helper'

export const FACET_AND = 'and'
export const FACET_OR = 'or'
export const FACET_TREE = 'tree'

export const assertValidFacetType = function (type) {
  if (type === FACET_AND) return
  if (type === FACET_OR) return
  if (type === FACET_TREE) return

  throw new Error(`Invalid facet type ${type}.`)
}

export const createFromAlgoliaCredentials = (appID, apiKey) => {
  const client = algolia(appID, apiKey)
  const helper = algoliaHelper(client)

  return new Store(helper)
}

export const createFromAlgoliaClient = (client) => {
  const helper = algoliaHelper(client)

  return new Store(helper)
}

const onHelperChange =  function () {
  if (this._stoppedCounter === 0) {
    this.refresh()
  }
}

export class Store {
  constructor(algoliaHelper) {
    // We require one start() call to execute the first search query.
    // Allows every widget to alter the state at initialization
    // without trigger multiple queries.
    this._stoppedCounter = 1

    this.algoliaHelper = algoliaHelper
  }

  set algoliaHelper(algoliaHelper) {

    if(this._helper) {
      this._helper.removeListener('change', onHelperChange)
    }

    this._helper = algoliaHelper
    this._helper.on('change', onHelperChange.bind(this))

    // Todo: fetch the version somehow.
    this._helper.getClient().addAlgoliaAgent('Store (x.x.x)')
  }

  get algoliaHelper() {
    return this._helper;
  }

  set algoliaClient(algoliaClient) {
    this._helper.setClient(algoliaClient)

    // Manually trigger the change given the helper doesn't emit a change event
    // when a new client is set.
    onHelperChange()
  }

  get algoliaClient() {
    return this._helper.getClient()
  }

  get algoliaApiKey() {
    return this.algoliaClient.apiKey
  }

  get algoliaAppId() {
    return this.algoliaClient.applicationID
  }

  // Todo: maybe freeze / unfreeze, pause / resume are better names
  start() {
    if (this._stoppedCounter < 1) {
      this._stoppedCounter = 0
    } else {
      this._stoppedCounter--
    }

    if (this._stoppedCounter === 0) {
      this.refresh()
    }
  }

  stop() {
    this._stoppedCounter++
  }

  set index(index) {
    this._helper.setIndex(index)
  }

  get index() {
    return this._helper.getIndex()
  }

  set resultsPerPage(count) {
    this._helper.setQueryParameter('hitsPerPage', count)
  }

  get resultsPerPage() {
    let resultsPerPage = this._helper.getQueryParameter('hitsPerPage')

    if(resultsPerPage) {
      return resultsPerPage
    }

    return this._helper.lastResults ? this._helper.lastResults.hitsPerPage : 0
  }

  get results() {
    if (!this._helper.lastResults) {
      return []
    }

    return this._helper.lastResults.hits
  }

  get page() {
    return this._helper.getPage()
  }

  set page(page) {
    this._helper.setPage(page)
  }

  get totalPages() {
    if (!this._helper.lastResults) {
      return 0
    }

    return this._helper.lastResults.nbPages
  }

  get totalResults() {
    if (!this._helper.lastResults) {
      return 0
    }

    return this._helper.lastResults.nbHits
  }

  get processingTimeMS() {
    if (!this._helper.lastResults) {
      return 0
    }

    return this._helper.lastResults.processingTimeMS
  }

  goTofirstPage() {
    this.page = 0
  }

  goToPreviousPage() {
    this._helper.previousPage()
  }

  goToNextPage() {
    this._helper.nextPage()
  }

  goToLastPage() {
    this.page = this.nbPages - 1
  }

  addFacet(attribute, type = FACET_AND) {
    assertValidFacetType(type)

    this.stop()
    this.removeFacet(attribute)

    let state = null
    if (type === FACET_AND) {
      state = this._helper.state.addFacet(attribute)
    } else if (type === FACET_OR) {
      state = this._helper.state.addDisjunctiveFacet(attribute)
    } else if (type === FACET_TREE) {
      state = this._helper.state.addHierarchicalFacet(attribute)
    }

    this._helper.setState(state)
    this.start()
  }

  removeFacet(attribute) {
    if (this._helper.state.isConjunctiveFacet(attribute)) {
      this._helper.state.removeFacet(attribute)
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.state.removeDisjunctiveFacet(attribute)
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.state.removeHierarchicalFacet(attribute)
    }
  }

  addFacetRefinement(attribute, value) {
    if (this._helper.state.isConjunctiveFacet(attribute)) {
      this._helper.addFacetRefinement(attribute, value)
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.addDisjunctiveFacetRefinement(attribute, value)
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.addHierarchicalFacetRefinement(attribute, value)
    }
  }

  toggleFacetRefinement(facet, value) {
    this._helper.toggleRefinement(facet, value)
  }

  clearRefinements(attribute) {
    this._helper.clearRefinements(attribute)
  }

  getFacetValues(attribute, sortBy, limit = -1) {
    if (!this._helper.lastResults) {
      return []
    }

    // Todo: make sure the attribute is already added.
    // Todo: Not sure this should be here because will make it very hard to debug I suppose.

    let values = this._helper.lastResults.getFacetValues(attribute, {sortBy})
    if (limit === -1) {
      return values
    }

    return values.slice(0, limit)
  }

  get activeRefinements() {
    if (!this._helper.lastResults) {
      return []
    }

    return this._helper.lastResults.getRefinements()
  }

  addNumericRefinement(attribute, operator, value) {
    this._helper.addNumericRefinement(attribute, operator, value)
  }

  removeNumericRefinement(attribute, operator, value) {
    this._helper.removeNumericRefinement(attribute, operator, value)
  }

  set query(query) {
    if (this._helper.state.query === query) {
      return
    }
    this._helper.setQuery(query)
  }

  get query() {
    return this._helper.state.query
  }

  // Todo: find a better name for this function.
  refresh() {
    this._helper.search()
  }
}
