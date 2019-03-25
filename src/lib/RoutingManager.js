import algoliasearchHelper from 'algoliasearch-helper';
import isEqual from 'lodash/isEqual';

export default class RoutingManager {
  constructor({ instantSearchInstance, router, stateMapping } = {}) {
    this.originalConfig = null;
    this.firstRender = true;

    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;

    this.originalUIState = this.stateMapping.routeToState(this.router.read());
  }

  init() {
    // init({ state }) {
    // store the initial state from the storage
    // so that we can compare it with the state after the first render
    // in case the searchFunction has modifyied it.
    // this.initState = this.getAllUIStates({ searchParameters: state });
    // `state` is provided to the init step with `helper.getState()` which
    // means that we can access the tree directly since nothing can change
    // it the meantime.
    this.initState = this.getAllUIStates();
  }

  getConfiguration(currentConfiguration) {
    // we need to create a REAL helper to then get its state. Because some parameters
    // like hierarchicalFacet.rootPath are then triggering a default refinement that would
    // be not present if it was not going trough the SearchParameters constructor
    this.originalConfig = algoliasearchHelper(
      {},
      currentConfiguration.index,
      currentConfiguration
    ).state;
    // The content of getAllSearchParameters is destructured to return a plain object
    return {
      ...this.getAllSearchParameters({
        currentSearchParameters: this.originalConfig,
        uiState: this.originalUIState,
      }),
    };
  }

  render({ state }) {
    if (this.firstRender) {
      this.firstRender = false;
      this.setupRouting(state);
    }
  }

  setupRouting(state) {
    const { helper } = this.instantSearchInstance;

    this.router.onUpdate(route => {
      const uiState = this.stateMapping.routeToState(route);
      // const currentUIState = this.getAllUIStates({ searchParameters: helper.state });
      // `helper.state` should be equivalent that looking though the tree, in that case
      // it should be fine.
      const currentUIState = this.getAllUIStates();

      if (isEqual(uiState, currentUIState)) return;

      const searchParameters = this.getAllSearchParameters({
        currentSearchParameters: state,
        // instantSearchInstance: this.instantSearchInstance,
        uiState,
      });

      const fullHelperState = {
        ...this.originalConfig,
        ...searchParameters,
      };

      if (isEqual(fullHelperState, searchParameters)) return;

      helper
        .overrideStateWithoutTriggeringChangeEvent(searchParameters)
        .search();
    });

    this.renderURLFromState = () => {
      // this.renderURLFromState = searchParameters => {
      // const uiState = this.getAllUIStates({ searchParameters });
      // `searchParameters` is provided from the `change` event emitted by the
      // helper. The state on the tree should be equal to the one that we emit.
      const uiState = this.getAllUIStates();
      const route = this.stateMapping.stateToRoute(uiState);
      this.router.write(route);
    };
    helper.on('change', this.renderURLFromState);

    // Compare initial state and post first render state, in order
    // to see if the query has been changed by a searchFunction

    // const firstRenderState = this.getAllUIStates({ searchParameters: state });
    // Here we change the initial behaviour since the `state` provided to the
    // render function is not iso with the one we get from the tree. The one
    // we get from the argument is the state of the derivation. We don't care
    // about this one inside the URL. We only want to sync each part of the
    // tree. In that case that state should be what we want.
    const firstRenderState = this.getAllUIStates();

    if (!isEqual(this.initState, firstRenderState)) {
      // force update the URL, if the state has changed since the initial URL read
      // We do this in order to make a URL update when there is search function
      // that prevent the search of the initial rendering
      // See: https://github.com/algolia/instantsearch.js/issues/2523#issuecomment-339356157
      const route = this.stateMapping.stateToRoute(firstRenderState);
      this.router.write(route);
    }
  }

  dispose() {
    if (this.renderURLFromState) {
      this.instantSearchInstance.helper.removeListener(
        'change',
        this.renderURLFromState
      );
    }

    this.router.dispose();
  }

  getAllSearchParameters({ uiState }) {
    const loop = (states, node) => {
      return node.widgets
        .filter(w => Boolean(w.getWidgetState))
        .reduce((innerStates, w) => {
          if (w.$$type === Symbol.for('ais.index')) {
            return {
              ...innerStates,
              children: [
                ...innerStates.children,
                loop({ children: [] }, w.node),
              ],
            };
          }

          if (node.parent === null) {
            const nodeState = innerStates.state || node.helper.getState();

            return {
              ...innerStates,
              state: w.getWidgetSearchParameters(nodeState, {
                uiState,
              }),
            };
          }

          const nodeState = innerStates.state || node.helper.getState();
          const nodeUiState =
            // Avoid the `indices` always self-contained
            (uiState.indices && uiState.indices[node.indexId]) || {};

          return {
            ...innerStates,
            state: w.getWidgetSearchParameters(nodeState, {
              uiState: nodeUiState,
            }),
          };
        }, states);
    };

    return loop({ children: [] }, this.instantSearchInstance.tree);
  }

  getAllUIStates() {
    // Filter out empty object?
    const loop = (uiState, node) =>
      node.widgets
        .filter(w => Boolean(w.getWidgetState))
        .reduce((innerUiState, w) => {
          if (w.$$type === Symbol.for('ais.index')) {
            return loop(innerUiState, w.node);
          }

          if (node.parent === null) {
            return w.getWidgetState(innerUiState, {
              helper: node.helper,
              searchParameters: node.helper.getState(),
            });
          }

          // Could be avoided with algorithm that scope the uiState to the
          // correct node. It would avoid some `if` and it maybe simplify
          // a bit the logic.
          const nodeUiState =
            (innerUiState.indices && innerUiState.indices[node.indexId]) || {};

          return {
            ...innerUiState,
            indices: {
              ...innerUiState.indices,
              [node.indexId]: w.getWidgetState(nodeUiState, {
                helper: node.helper,
                searchParameters: node.helper.getState(),
              }),
            },
          };
        }, uiState);

    return loop({}, this.instantSearchInstance.tree);
  }

  // External API's

  createURL(state) {
    const uiState = this.getAllUIStates({
      searchParameters: state,
    });
    const route = this.stateMapping.stateToRoute(uiState);
    return this.router.createURL(route);
  }

  onHistoryChange(fn) {
    const { helper } = this.instantSearchInstance;

    this.router.onUpdate(route => {
      const uiState = this.stateMapping.routeToState(route);
      // const currentUIState = this.getAllUIStates({ searchParameters: helper.state });
      // `helper.state` should be equivalent that looking though the tree, in that case
      // it should be fine.
      const currentUIState = this.getAllUIStates();

      if (isEqual(uiState, currentUIState)) return;

      const searchParameters = this.getAllSearchParameters({
        currentSearchParameters: helper.state,
        // instantSearchInstance: this.instantSearchInstance,
        uiState,
      });

      const fullSearchParameters = {
        ...this.originalConfig,
        ...searchParameters,
      };

      fn(fullSearchParameters);
    });
  }
}
