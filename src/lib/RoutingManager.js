// import algoliasearchHelper from 'algoliasearch-helper';
import isEqual from 'lodash/isEqual';
import zip from 'lodash/zip';

export default class RoutingManager {
  constructor({ instantSearchInstance, router, stateMapping } = {}) {
    this.originalConfig = null;
    this.firstRender = true;

    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;

    // It never updates
    // this.originalUIState = this.stateMapping.routeToState(this.router.read());
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

  // Useful?
  // getConfiguration(currentConfiguration) {
  //   // we need to create a REAL helper to then get its state. Because some parameters
  //   // like hierarchicalFacet.rootPath are then triggering a default refinement that would
  //   // be not present if it was not going trough the SearchParameters constructor
  //   this.originalConfig = algoliasearchHelper(
  //     {},
  //     currentConfiguration.index,
  //     currentConfiguration
  //   ).state;

  //   // Here we have a huge difference between the previous implementation. This lifecyle
  //   // was called on start and each add/remove operations. The call on start was used to
  //   // restore the SearchParameters from the uiState. The helper was created on start with
  //   // those crafted parameters. Now it's not the case, each node has it own instance of
  //   // an helper that is created either on the InstantSearch creation or index creation.
  //   // We can compute the initial search parameters for each nodes right before the search
  //   // happen. It will mimic the previous implementation. For each node we call the method
  //   // `getWidgetSearchParameters` with the correct slice of the `uiState`. The question is
  //   // where to implement such logic?
  //   //   - 1. loop over the nodes inside the `RoutingManager`. Which means that we mutate
  //   //   the helper of the node from the manager. We can expose a method on the manager
  //   //   that perform those operations. Whhich means that we can call it for the rest of
  //   //   the lifcecyles add/remove. Which means that we get rid of the `getConfiguration`
  //   //   lifecyle for this widget.
  //   //   - 2. loop over the nodes inside the `RoutingManager` like the above solution, but
  //   //   create the next tree. Then we can replace it easily inside the instance. Which
  //   //   means that we copy widgets, etc... Is it the correct structure? Not sure maybe we
  //   //   can think of an alternative model that could split? Or even another model to make
  //   //   the routing? This solution might be the better.
  //   //   - 3. loop over the nodes from InstantSearch and mutate the helper node from the
  //   //   instance. The manager only compute the parameters for the given node/uiState. We
  //   //   have to expose the internal state of the manager to the instance. How we make it
  //   //   works with the other lifecycles add/remove.

  //   return {
  //     ...this.getAllSearchParameters({
  //       currentSearchParameters: this.originalConfig,
  //       uiState: this.originalUIState,
  //     }),
  //   };
  // }

  render({ state }) {
    if (this.firstRender) {
      this.firstRender = false;
      this.setupRouting(state);
    }
  }

  setupRouting() {
    // setupRouting(state) {
    const { helper } = this.instantSearchInstance;

    this.router.onUpdate(route => {
      const uiState = this.stateMapping.routeToState(route);
      // const currentUIState = this.getAllUIStates({ searchParameters: helper.state });
      // `helper.state` should be equivalent that looking though the tree, in that case
      // it should be fine.
      const currentUIState = this.getAllUIStates();

      if (isEqual(uiState, currentUIState)) return;

      const parameters = this.getAllSearchParameters({
        // Here we use the state of the render which is in our case the state of the derived
        // helper. Not even sure it's correct since it always refer the state of the initial
        // render rather than the latest updated state. The weird part is that below the fn
        // `onHistoryChange` is reading from `helper.state`. It's probably better to keep the
        // usage iso. Keep in mind that either `state` or `helper.state` is not fully correct.
        // For the following interation with the UI:
        //   -> query (Apple) -> configure (4 -> 8) -> query (Apple watch)
        //   1. with state: the back button restore the page to Apple + 4
        //   2. with helper.state: the back button restore the page to Apple + 8 but never come
        //      back to 4 since we lost the information.
        // To avoid this behaviour we have to sync the full state in the URL.
        // currentSearchParameters: state, <-- initial render state
        // currentSearchParameters: helper.state,
        // instantSearchInstance: this.instantSearchInstance,
        uiState,
      });

      // It might be only a optimization to avoid an extra render, but since we don't have a POJO
      // anymore the diff is a bit harder to compute. We can bypass it for now, see how it goes
      // and restore it if required.
      // const fullHelperState = {
      //   ...this.originalConfig,
      //   ...searchParameters,
      // };

      // if (isEqual(fullHelperState, searchParameters)) return;

      // Alter the current tree with searchParamters
      this.applySearchParameters(parameters);

      // helper
      //   .overrideStateWithoutTriggeringChangeEvent(searchParameters)
      //   .search();

      helper.search();
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
        .filter(w => Boolean(w.getWidgetSearchParameters))
        .reduce((innerStates, w) => {
          if (w.$$type === Symbol.for('ais.index')) {
            return {
              ...innerStates,
              children: [
                ...innerStates.children,
                loop(
                  {
                    state: w.node.helper.getState(),
                    children: [],
                  },
                  w.node
                ),
              ],
            };
          }

          if (node.parent === null) {
            return {
              ...innerStates,
              state: w.getWidgetSearchParameters(innerStates.state, {
                uiState,
              }),
            };
          }

          const nodeUiState =
            // Avoid the `indices` always self-contained
            (uiState.indices && uiState.indices[node.indexId]) || {};

          return {
            ...innerStates,
            state: w.getWidgetSearchParameters(innerStates.state, {
              uiState: nodeUiState,
            }),
          };
        }, states);
    };

    return loop(
      {
        state: this.instantSearchInstance.tree.helper.getState(),
        children: [],
      },
      this.instantSearchInstance.tree
    );
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

  getUiStateFromRouter() {
    return this.stateMapping.routeToState(this.router.read());
  }

  getSearchParametersForWidgets({ widgets, parameters, uiState }) {
    return widgets
      .filter(w => w.$$type !== Symbol.for('ais.index'))
      .filter(w => Boolean(w.getWidgetSearchParameters))
      .reduce(
        (acc, w) =>
          w.getWidgetSearchParameters(acc, {
            uiState,
          }),
        parameters
      );
  }

  // This function is useless in real life. We only use it at the moment to
  // get the `uiState` of the node right before the the remove, since we don't
  // store it on the `RoutingManager` in this branch.
  getUIStateForNode(node) {
    return node.widgets
      .filter(w => w.$$type !== Symbol.for('ais.index'))
      .filter(w => Boolean(w.getWidgetState))
      .reduce(
        (acc, w) =>
          w.getWidgetState(acc, {
            helper: node.helper,
            searchParameters: node.helper.getState(),
          }),
        {}
      );
  }

  applySearchParameters(parameters) {
    const loop = (treeNode, stateNode) => {
      treeNode.helper.overrideStateWithoutTriggeringChangeEvent(
        stateNode.state
      );

      zip(
        treeNode.widgets
          .filter(w => w.$$type === Symbol.for('ais.index'))
          .map(_ => _.node),
        stateNode.children
      ).forEach(([innerTreeNode, innerStateNode]) => {
        loop(innerTreeNode, innerStateNode);
      });
    };

    return loop(this.instantSearchInstance.tree, parameters);
  }

  // This lifecycle is not used anymore in the codebase. The place
  // where it was used has been dropped with the re-write of the
  // SearchBox. Do we manage to reproduce an issue that this API could
  // solve? Yes we keep, no we dropped.
  // onHistoryChange(fn) {
  //   const { helper } = this.instantSearchInstance;

  //   this.router.onUpdate(route => {
  //     const uiState = this.stateMapping.routeToState(route);
  //     // const currentUIState = this.getAllUIStates({ searchParameters: helper.state });
  //     // `helper.state` should be equivalent that looking though the tree, in that case
  //     // it should be fine.
  //     const currentUIState = this.getAllUIStates();

  //     if (isEqual(uiState, currentUIState)) return;

  //     const searchParameters = this.getAllSearchParameters({
  //       // The behaviour inside `router.onUpdate` should be the same than
  //       // this one. Otherwise we have inconsistencies in the API. Whatever
  //       // solution we pick it should be iso.
  //       currentSearchParameters: helper.state,
  //       // instantSearchInstance: this.instantSearchInstance,
  //       uiState,
  //     });

  //     const fullSearchParameters = {
  //       ...this.originalConfig,
  //       ...searchParameters,
  //     };

  //     fn(fullSearchParameters);
  //   });
  // }
}
