import algoliasearchHelper from 'algoliasearch-helper';
import isEqual from 'lodash/isEqual';

/**
 * @type StateMapping
 * @property {(object) => object} stateToRoute transforms an UI state representation into a route object
 * @property {(object) => object} routeToState transforms route object into an UI state representation
 */

/**
 * @type Router
 * @property {(object) => ()} write push a route object into a storage
 * @property {((object) => (object)) => ()} onUpdate sets an event listenere when the storage is updated by a third party
 * @property {() => (object)} read reads the storage and gets a route object
 * @property {(object) => string} createURL transforms a route object into a URL
 * @property {() => ()} dispose cleans up any event listeners
 */

export default class RoutingManager {
  constructor({ instantSearchInstance, router, stateMapping } = {}) {
    this.originalConfig = null;
    this.firstRender = true;

    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;

    this.originalUIState = this.stateMapping.routeToState(this.router.read());
  }

  init({ state }) {
    // store the initial state from the storage
    // so that we can compare it with the state after the first render
    // in case the searchFunction has modifyied it.
    const { helper } = this.instantSearchInstance;
    this.initState = this.getAllUIStates({
      helper,
      state,
      instantSearchInstance: this.instantSearchInstance,
    });
  }

  getConfiguration(currentConfiguration) {
    // we need to create a REAL helper to then get its state. Because some parameters
    // like hierarchicalFacet.rootPath are then triggering a default refinement that would
    // be not present if it was not going trough the SearchParameters constructor
    this.originalConfig = algoliasearchHelper(
      { addAlgoliaAgent() {} },
      currentConfiguration.index,
      currentConfiguration
    ).state;
    return Object.assign(
      {},
      this.getAllSearchParameters({
        state: this.originalConfig,
        uiState: this.originalUIState,
      })
    );
  }

  render({ state }) {
    if (this.firstRender) {
      this.firstRender = false;
      const { helper } = this.instantSearchInstance;
      this.router.onUpdate(route => {
        const uiState = this.stateMapping.routeToState(route);
        const currentUIState = this.getAllUIStates({
          helper,
          state: helper.state,
          instantSearchInstance: this.instantSearchInstance,
        });

        if (isEqual(uiState, currentUIState)) return;

        // retrieve a search state from the widgets and the UI state
        const searchParameters = this.getAllSearchParameters({
          state,
          instantSearchInstance: this.instantSearchInstance,
          uiState,
        });

        const fullHelperState = Object.assign(
          {},
          this.originalConfig,
          searchParameters
        );

        if (isEqual(fullHelperState, searchParameters)) return;

        helper
          .overrideStateWithoutTriggeringChangeEvent(searchParameters)
          .search();
      });

      helper.on('change', searchState => {
        // this.renderURLFromState(s)
        const uiState = this.getAllUIStates({
          helper,
          state: searchState,
          instantSearchInstance: this.instantSearchInstance,
        });
        const route = this.stateMapping.stateToRoute(uiState);
        this.router.write(route);
      });

      // Compare initial state and post first render state, in order
      // to see if the query has been changed by a searchFunction

      const firstRenderState = this.getAllUIStates({
        helper,
        state,
        instantSearchInstance: this.instantSearchInstance,
      });

      if (!isEqual(this.initState, firstRenderState)) {
        // force update the URL, if the state has changed since the initial URL read
        // We do this in order to make a URL update when there is search function
        // that prevent the search of the initial rendering
        // See: https://github.com/algolia/instantsearch.js/issues/2523#issuecomment-339356157
        this.router.write(firstRenderState);
      }
    }
  }

  dispose() {
    this.instantSearchInstance.helper.removeListener(
      'change',
      this.renderURLFromState
    );
    this.router.dispose();
  }

  getAllSearchParameters({ state, uiState }) {
    const { widgets } = this.instantSearchInstance;
    const searchParameters = widgets.reduce((u, w) => {
      if (!w.getWidgetSearchParameters) return u;
      return w.getWidgetSearchParameters(u, {
        uiState,
      });
    }, state);
    return searchParameters;
  }

  getAllUIStates({ state }) {
    const { widgets, helper } = this.instantSearchInstance;
    const uiState = widgets.reduce((u, w) => {
      if (!w.getWidgetState) return u;
      return w.getWidgetState(u, {
        helper,
        state,
      });
    }, {});

    return uiState;
  }

  // External API's

  createURL(state) {
    const uiState = this.getAllUIStates({
      state,
    });
    const route = this.stateMapping.stateToRoute(uiState);
    return this.router.createURL(route);
  }

  onHistoryChange(fn) {
    this.router.onUpdate(route => {
      const helper = this.instantSearchInstance.helper;
      const uiState = this.stateMapping.routeToState(route);
      const currentUIState = this.getAllUIStates({
        helper: this.instantSearchInstance.helper,
        state: helper.state,
        instantSearchInstance: this.instantSearchInstance,
      });

      if (isEqual(uiState, currentUIState)) return;

      const searchParameters = this.getAllSearchParameters({
        state: helper.state,
        instantSearchInstance: this.instantSearchInstance,
        uiState,
      });

      const fullSearchParameters = Object.assign(
        {},
        this.originalConfig,
        searchParameters
      );

      fn(fullSearchParameters);
    });
    return;
  }
}
