import algolia from 'algoliasearch'
import algoliaHelper from 'algoliasearch-helper'

export const FACET_CONJUNCTIVE = 'conjunctive'
export const FACET_DISJUNCTIVE = 'disjunctive'
export const FACET_HIERARCHICAL = 'hierarchical'

const assertValidFacetType = function (type) {
  if (type === FACET_CONJUNCTIVE) return
  if (type === FACET_DISJUNCTIVE) return
  if (type === FACET_HIERARCHICAL) return

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

  set algoliaClient(algoliaClient) {
    this._helper.setClient(algoliaClient)
    // Todo: this does not trigger a "change" event for now.
    // Todo: maybe refresh after this?
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

  set hitsPerPage(hitsPerPage) {
    this._helper.setQueryParameter('hitsPerPage', hitsPerPage)
  }

  get hitsPerPage() {
    let hitsPerPage = this._helper.getQueryParameter('hitsPerPage')

    if(hitsPerPage) {
      return hitsPerPage
    }

    return this._helper.lastResults ? this._helper.lastResults.hitsPerPage : 0
  }

  get hits() {
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

  get nbPages() {
    if (!this._helper.lastResults) {
      return 0
    }

    return this._helper.lastResults.nbPages
  }

  get nbHits() {
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

  firstPage() {
    this.page = 0
  }

  previousPage() {
    this._helper.previousPage()
  }

  nextPage() {
    this._helper.nextPage()
  }

  lastPage() {
    this.page = this.nbPages - 1
  }

  addFacet(attribute, type = FACET_CONJUNCTIVE) {
    assertValidFacetType(type)

    this.stop()
    this.removeFacet(attribute)

    let state = null
    if (type === FACET_CONJUNCTIVE) {
      state = this._helper.state.addFacet(attribute)
    } else if (type === FACET_DISJUNCTIVE) {
      state = this._helper.state.addDisjunctiveFacet(attribute)
    } else if (type === FACET_HIERARCHICAL) {
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

  isConjunctiveFacet(attribute) {
    return this._helper.state.isConjunctiveFacet(attribute)
  }

  isDisjunctiveFacet(attribute) {
    return this._helper.state.isDisjunctiveFacet(attribute)
  }

  isHierarchicalFacet(attribute) {
    return this._helper.state.isHierarchicalFacet(attribute)
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

  refresh() {
    this._helper.search()
  }
}
