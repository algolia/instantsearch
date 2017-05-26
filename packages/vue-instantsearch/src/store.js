import algolia from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';
import { version } from '../package.json';
import {
  serialize as serializeHelper,
  unserialize as unserializeHelper,
} from './helper-serializer';

export const FACET_AND = 'and';
export const FACET_OR = 'or';
export const FACET_TREE = 'tree';

export const HIGHLIGHT_PRE_TAG = '__ais-highlight__';
export const HIGHLIGHT_POST_TAG = '__/ais-highlight__';

export const assertValidFacetType = function(type) {
  if (type === FACET_AND) return;
  if (type === FACET_OR) return;
  if (type === FACET_TREE) return;

  throw new Error(`Invalid facet type ${type}.`);
};

export const createFromAlgoliaCredentials = (appID, apiKey) => {
  const client = algolia(appID, apiKey);
  const helper = algoliaHelper(client);

  return new Store(helper);
};

export const createFromAlgoliaClient = client => {
  const helper = algoliaHelper(client);

  return new Store(helper);
};

export const createFromSerialized = data => {
  const helper = unserializeHelper(data);

  return new Store(helper);
};

const onHelperChange = function() {
  if (this._stoppedCounter === 0) {
    this.refresh();
  }
};

export class Store {
  constructor(algoliaHelper) {
    // We require one start() call to execute the first search query.
    // Allows every widget to alter the state at initialization
    // without trigger multiple queries.
    this._stoppedCounter = 1;

    this.algoliaHelper = algoliaHelper;
  }

  set algoliaHelper(algoliaHelper) {
    if (this._helper) {
      this._helper.removeListener('change', onHelperChange);
    }

    this._helper = algoliaHelper;

    // Here we enforce custom highlight tags for handling XSS protection.
    // We also make sure that we keep the current page as this operation resets it.
    const page = this._helper.getPage();
    this._helper.setQueryParameter('highlightPreTag', HIGHLIGHT_PRE_TAG);
    this._helper.setQueryParameter('highlightPostTag', HIGHLIGHT_POST_TAG);
    this._helper.setPage(page);

    this._helper.on('change', onHelperChange.bind(this));

    this._helper.getClient().addAlgoliaAgent(`vue-instantsearch ${version}`);
  }

  get algoliaHelper() {
    return this._helper;
  }

  get highlightPreTag() {
    return this._helper.getQueryParameter('highlightPreTag');
  }

  get highlightPostTag() {
    return this._helper.getQueryParameter('highlightPostTag');
  }

  set algoliaClient(algoliaClient) {
    this._helper.setClient(algoliaClient);

    // Manually trigger the change given the helper doesn't emit a change event
    // when a new client is set.
    onHelperChange();
  }

  get algoliaClient() {
    return this._helper.getClient();
  }

  get algoliaApiKey() {
    return this.algoliaClient.apiKey;
  }

  get algoliaAppId() {
    return this.algoliaClient.applicationID;
  }

  // Todo: maybe freeze / unfreeze, pause / resume are better names
  start() {
    if (this._stoppedCounter < 1) {
      this._stoppedCounter = 0;
    } else {
      this._stoppedCounter--;
    }

    if (this._stoppedCounter === 0) {
      this.refresh();
    }
  }

  stop() {
    this._stoppedCounter++;
  }

  set indexName(index) {
    this._helper.setIndex(index);
  }

  get indexName() {
    return this._helper.getIndex();
  }

  set resultsPerPage(count) {
    this._helper.setQueryParameter('hitsPerPage', count);
  }

  get resultsPerPage() {
    let resultsPerPage = this._helper.getQueryParameter('hitsPerPage');

    if (resultsPerPage) {
      return resultsPerPage;
    }

    return this._helper.lastResults ? this._helper.lastResults.hitsPerPage : 0;
  }

  get results() {
    if (!this._helper.lastResults) {
      return [];
    }

    return this._helper.lastResults.hits;
  }

  get page() {
    return this._helper.getPage() + 1;
  }

  set page(page) {
    this._helper.setPage(page - 1);
  }

  get totalPages() {
    if (!this._helper.lastResults) {
      return 0;
    }

    return this._helper.lastResults.nbPages;
  }

  get totalResults() {
    if (!this._helper.lastResults) {
      return 0;
    }

    return this._helper.lastResults.nbHits;
  }

  get processingTimeMS() {
    if (!this._helper.lastResults) {
      return 0;
    }

    return this._helper.lastResults.processingTimeMS;
  }

  goTofirstPage() {
    this.page = 0;
  }

  goToPreviousPage() {
    this._helper.previousPage();
  }

  goToNextPage() {
    this._helper.nextPage();
  }

  goToLastPage() {
    this.page = this.nbPages - 1;
  }

  addFacet(attribute, type = FACET_AND) {
    assertValidFacetType(type);

    this.stop();
    this.removeFacet(attribute);

    let state = null;
    if (type === FACET_AND) {
      state = this._helper.state.addFacet(attribute);
    } else if (type === FACET_OR) {
      state = this._helper.state.addDisjunctiveFacet(attribute);
    } else if (type === FACET_TREE) {
      state = this._helper.state.addHierarchicalFacet(attribute);
    }

    this._helper.setState(state);
    this.start();
  }

  removeFacet(attribute) {
    if (this._helper.state.isConjunctiveFacet(attribute)) {
      this._helper.state.removeFacet(attribute);
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.state.removeDisjunctiveFacet(attribute);
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.state.removeHierarchicalFacet(attribute);
    }
  }

  addFacetRefinement(attribute, value) {
    if (this._helper.state.isConjunctiveFacet(attribute)) {
      this._helper.addFacetRefinement(attribute, value);
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.addDisjunctiveFacetRefinement(attribute, value);
    } else if (this._helper.state.isDisjunctiveFacet(attribute)) {
      this._helper.addHierarchicalFacetRefinement(attribute, value);
    }
  }

  toggleFacetRefinement(facet, value) {
    this._helper.toggleRefinement(facet, value);
  }

  clearRefinements(attribute) {
    this._helper.clearRefinements(attribute);
  }

  getFacetValues(attribute, sortBy, limit = -1) {
    if (!this._helper.lastResults) {
      return [];
    }

    // Todo: make sure the attribute is already added.
    // Todo: Not sure this should be here because will make it very hard to debug I suppose.

    let values = this._helper.lastResults.getFacetValues(attribute, { sortBy });
    if (limit === -1) {
      return values;
    }

    return values.slice(0, limit);
  }

  get activeRefinements() {
    if (!this._helper.lastResults) {
      return [];
    }

    return this._helper.lastResults.getRefinements();
  }

  addNumericRefinement(attribute, operator, value) {
    this._helper.addNumericRefinement(attribute, operator, value);
  }

  removeNumericRefinement(attribute, operator, value) {
    this._helper.removeNumericRefinement(attribute, operator, value);
  }

  set query(query) {
    if (this._helper.state.query === query) {
      return;
    }
    this._helper.setQuery(query);
  }

  get query() {
    return this._helper.state.query;
  }

  set queryParameters(parameters) {
    this.stop();
    for (let parameter in parameters) {
      if (parameters[parameter] === null) {
        parameters[parameter] = undefined;
      }
      this._helper.setQueryParameter(parameter, parameters[parameter]);
    }

    // Make sure page starts at 1.
    if ('page' in parameters) {
      this.page = parameters.page;
      delete parameters.page;
    }
    this.start();
  }

  get queryParameters() {
    const parameters = this._helper.state.getQueryParams();
    parameters.page = this.page;

    return parameters;
  }

  get searchParameters() {
    return Object.assign({}, this._helper.state, { page: this.page });
  }

  set searchParameters(searchParameters) {
    const params = Object.assign({}, searchParameters);
    if (params.page !== undefined) {
      params.page = params.page - 1;
    }
    const newSearchParameters = algoliaHelper.SearchParameters.make(params);
    this._helper.setState(newSearchParameters);
  }

  serialize() {
    return serializeHelper(this._helper);
  }

  // Todo: find a better name for this function.
  refresh() {
    this._helper.search();
  }

  waitUntilInSync() {
    return new Promise((resolve, reject) => {
      if (this._helper.hasPendingRequests() === false) {
        return resolve();
      }

      // Todo: we need to de-register the one that is not being triggered.
      this._helper.once('searchQueueEmpty', () => {
        resolve();
      });
      this._helper.once('error', error => {
        throw new Error(error.message);
        // Todo: implement rejection once this has a solution
        // https://github.com/algolia/algoliasearch-helper-js/issues/502
        // reject(error);
      });
    });
  }
}
