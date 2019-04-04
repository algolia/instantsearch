// import algoliasearchHelper from 'algoliasearch-helper';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';
import EventEmitter from 'events';
import RoutingManager from './RoutingManager';
import simpleMapping from './stateMappings/simple';
import historyRouter from './routers/history';
// import version from './version';
import algoliasearchHelper from './stateManager';
import { resolveSingleLeafMerge } from './resolveSearchParametersWithMerge';
import createHelpers from './createHelpers';

const _defer = Promise.resolve();

const ROUTING_DEFAULT_OPTIONS = {
  stateMapping: simpleMapping(),
  router: historyRouter(),
};

function defaultCreateURL() {
  return '#';
}

const isIndexWidget = _ => _.$$type === Symbol.for('ais.index');
const isIndexWidgetLinked = _ => isIndexWidget(_) && Boolean(_.node);

const resolveNodesFromNode = node => {
  const loop = (acc, innerNode) => {
    return innerNode.widgets
      .filter(isIndexWidget)
      .map(_ => _.node)
      .reduce(
        (innerAcc, currentNode) =>
          loop(innerAcc.concat(currentNode), currentNode),
        acc
      );
  };

  return loop([], node);
};

const resolveNodesFromIndexId = (node, indexId) => {
  const loop = (acc, innerNode) => {
    const nextAcc = innerNode.indexId === indexId ? acc.concat(innerNode) : acc;

    return innerNode.widgets
      .filter(isIndexWidget)
      .map(_ => _.node)
      .reduce((innerAcc, _) => loop(innerAcc, _), nextAcc);
  };

  return loop([], node);
};

const resolveNodeFromIndexId = (node, indexId) => {
  const loop = innerNode => {
    if (innerNode.indexId === indexId) {
      return innerNode;
    }

    // Find an alternaive solution
    return innerNode.widgets
      .filter(isIndexWidgetLinked)
      .map(_ => _.node)
      .find(_ => loop(_));
  };

  return loop(node);
};

const resolveNodesResultsFromNode = node => {
  const loop = (acc, innerNode) => {
    const nextAcc = acc.concat({
      indexId: innerNode.indexId,
      results: innerNode.derivedHelper.lastResults,
    });

    return innerNode.widgets
      .filter(isIndexWidget)
      .map(_ => _.node)
      .reduce((innerAcc, _) => loop(innerAcc, _), nextAcc);
  };

  return loop([], node);
};

const resolveRoot = node => {
  const resolveParentNode = innerNode => {
    return innerNode.parent !== null
      ? resolveParentNode(innerNode.parent)
      : innerNode;
  };

  return resolveParentNode(node);
};

const resolveRootNodes = (root, node) => {
  const resolveParentNode = (innerNode, nodes) => {
    const nodesForIndexId = resolveNodesFromIndexId(root, innerNode.indexId);
    const next = [nodesForIndexId].concat(nodes);

    return innerNode.parent !== null
      ? resolveParentNode(innerNode.parent, next)
      : next;
  };

  return resolveParentNode(node, []);
};

const resolveSearchParameters = node => {
  const rootNode = resolveRoot(node);
  const nodeSearchParemeters = resolveRootNodes(rootNode, node).map(nodes =>
    resolveSingleLeafMerge(
      ...nodes
        // Tweaks for the input of the resolve function
        .map(_ => ({ state: _.helper.getState() }))
    )
  );

  return resolveSingleLeafMerge(
    // Tweaks for the input of the resolve function
    ...nodeSearchParemeters.map(_ => ({ state: _ }))
  );
};

const createChildHelper = ({ parent, client, index, parameters }) => {
  const helper = algoliasearchHelper(client, index, parameters);

  helper.search = () => {
    parent.search();
  };

  return helper;
};

const createDerivedHelper = (helper, node, indexId) => {
  return helper.derive(() => {
    return resolveSearchParameters(node, indexId);
  });
};

const createHelperSubscription = ({ helper, event, callback }) => {
  helper.on(event, callback);

  return () => {
    helper.off(event, callback);
  };
};

const createHelperPagination = ({ helper, node }) => {
  helper.on('change', (_, __, reset) => {
    if (reset) {
      const nodes = resolveNodesFromNode(node);

      nodes.forEach(innerNode => {
        const { page, ...rest } = innerNode.helper.getState();

        if (typeof page !== 'undefined') {
          // This is brittle, another solution would be welcome.
          innerNode.helper.overrideStateWithoutTriggeringChangeEvent({
            ...rest,
            page: 0,
          });
        }
      });
    }
  });
};

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * @fires Instantsearch#render This event is triggered each time a render is done
 */
class InstantSearch extends EventEmitter {
  constructor(options) {
    super();

    const {
      indexName = null,
      numberLocale,
      searchParameters = {},
      routing = null,
      // searchFunction,
      stalledSearchDelay = 200,
      searchClient = null,
    } = options;

    //     if (indexName === null || searchClient === null) {
    //       throw new Error(`Usage: instantsearch({
    //   indexName: 'indexName',
    //   searchClient: algoliasearch('appId', 'apiKey')
    // });`);
    //     }

    //     if (typeof options.urlSync !== 'undefined') {
    //       throw new Error(
    //         'InstantSearch.js V3: `urlSync` option has been removed. You can now use the new `routing` option'
    //       );
    //     }

    //     if (typeof searchClient.search !== 'function') {
    //       throw new Error(
    //         'The search client must implement a `search(requests)` method.'
    //       );
    //     }

    //     if (typeof searchClient.addAlgoliaAgent === 'function') {
    //       searchClient.addAlgoliaAgent(`instantsearch.js ${version}`);
    //     }

    this.client = searchClient;
    this.searchParameters = searchParameters;
    // We use the ref to create the derived helper before we create the
    // actual node which cause an issue because the scope is captued with
    // the incorrect data.
    this.tree = {};

    const helper = algoliasearchHelper(this.client, indexName, {
      ...searchParameters,
      index: indexName,
    });

    // We use the ref of the Helper in multiple places, expose it avoid to
    // break implementation that rely on this behaviour (routing included).
    this.helper = helper;

    createHelperPagination({
      node: this.tree,
      helper,
    });

    const derivedHelper = createDerivedHelper(helper, this.tree, indexName);

    derivedHelper.on('result', this._batch.bind(this, helper));
    // derivedHelper.on('result', this._render.bind(this, helper));

    derivedHelper.on('error', e => this.emit('error', e));

    this.tree.instance = this;
    this.tree.parent = null;
    this.tree.indexId = indexName;
    this.tree.widgets = [];
    this.tree.helper = helper;
    this.tree.derivedHelper = derivedHelper;
    this.tree.unsubscribeDerivedHelper = () => {};

    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };

    this._stalledSearchDelay = stalledSearchDelay;

    // if (searchFunction) {
    //   this._searchFunction = searchFunction;
    // }

    if (routing === true) this.routing = ROUTING_DEFAULT_OPTIONS;
    else if (isPlainObject(routing))
      this.routing = {
        ...ROUTING_DEFAULT_OPTIONS,
        ...routing,
      };
  }

  addWidget(widget) {
    this.addWidgets([widget]);
  }

  addWidgets(widgets, node) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        'You need to provide an array of widgets or call `addWidget()`'
      );
    }

    // The routing manager widget is always added manually at the last position.
    // By removing it from the last position and adding it back after, we ensure
    // it keeps this position.
    // fixes #3148
    const lastWidget = this.tree.widgets.pop();

    this.addWidgetsToNode(widgets, node);

    // Second part of the fix for #3148
    if (lastWidget) {
      this.tree.widgets.push(lastWidget);
    }

    if (this.started && Boolean(widgets.length)) {
      this.tree.helper.search();

      console.log('search for widgets added:');
      console.log(this.tree);
      console.log('------');
    }
  }

  addWidgetsToNode(widgets, node) {
    const current = node || this.tree;

    // Widgets
    widgets
      // .filter(widget => !isIndexWidget(widget))
      .forEach(widget => {
        if (widget.render === undefined && widget.init === undefined) {
          throw new Error('Widget definition missing render or init method');
        }

        current.widgets.push(widget);

        current.helper.setState(
          // @TODO: replace the `enhanceConfiguration`
          enhanceConfiguration()(
            {
              ...current.helper.getState(),
            },
            widget
          )
        );

        if (this.started && widget.init) {
          widget.init({
            state: current.helper.state,
            helper: current.helper,
            templatesConfig: this.templatesConfig,
            createURL: this._createAbsoluteURL,
            onHistoryChange: this._onHistoryChange,
            instantSearchInstance: this,
          });
        }
      });

    // Indices
    widgets.filter(isIndexWidget).forEach(index => {
      const nodeForIndexId = resolveNodeFromIndexId(this.tree, index.indexId);

      const helper = createChildHelper({
        parent: current.helper,
        client: this.client,
        index: index.indexName,
        // parameters: {
        //   ...current.helper.getState(),
        //   index: index.indexName,
        // },
      });

      const innerNode = {
        instance: this,
        parent: current,
        indexId: index.indexId,
        widgets: [],
        helper,
        // derivedHelper,
        // unsubscribeDerivedHelper,
      };

      const derivedHelper = !nodeForIndexId
        ? // @TODO: find a better solution to avoid the node mutation
          createDerivedHelper(this.tree.helper, innerNode, index.indexId)
        : nodeForIndexId.derivedHelper;

      const unsubscribeDerivedHelper = createHelperSubscription({
        helper: derivedHelper,
        event: 'result',
        callback: this._batch.bind(this, helper),
        // callback: this._render.bind(this, helper),
      });

      innerNode.derivedHelper = derivedHelper;
      innerNode.unsubscribeDerivedHelper = unsubscribeDerivedHelper;

      createHelperPagination({
        node: innerNode,
        helper,
      });

      // register the node on the index
      index.node = innerNode;

      // recursive call to add widgets on the tree
      this.addWidgetsToNode(index.widgets, innerNode);
    });
  }

  removeWidgets(widgets, node) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        'You need to provide an array of widgets or call `removeWidget()`'
      );
    }

    this.removeWidgetsFromNode(widgets, node);

    setTimeout(() => {
      if (this.tree.widgets.length > 0) {
        this.tree.helper.search();

        console.log('search for widgets removed:');
        console.log(this.tree);
        console.log('------');
      }
    }, 0);
  }

  removeWidgetsFromNode(widgets, node) {
    const current = node || this.tree;

    // Filter out widgets from the node
    current.widgets = current.widgets.filter(w => !widgets.includes(w));

    widgets
      .filter(_ => typeof _.dispose === 'function')
      .forEach(widget => {
        const nextState = widget.dispose({
          state: current.helper.getState(),
          helper: current.helper,
        });

        if (nextState) {
          // get the initial configuration search parameters for the rest of the
          // widgets e.g. two widgets were using the same configuration but we
          // removed one.

          // This function is useless in real life. We only use it at the moment
          // to get the `uiState` of the node right before the the remove, since
          // we don't store it on the `RoutingManager` in this branch.
          const previousUiState = this.routing
            ? this.routingManager.getUIStateForNode(current)
            : {};

          const nextWidgetsState = current.widgets.reduce(
            // @TODO: replace the `enhanceConfiguration`
            enhanceConfiguration({}),
            {
              // apply the root parameters only on the top level node
              ...(current.parent === null && this.searchParameters),
              ...nextState,
            }
          );

          let nextWidgetsStateWithRouting = nextWidgetsState;

          if (this.routing) {
            // Inside the `routing` widget we don't have the `getConfiguration`
            // hook anymore, which means that we have to manually recreate the
            // state on add/remove.
            nextWidgetsStateWithRouting = this.routingManager.getSearchParametersForWidgets(
              {
                widgets: current.widgets,
                parameters: algoliasearchHelper.SearchParametersWithoutDefaults.make(
                  nextWidgetsState
                ),
                // This argument is useless in real life. The `routingManager`
                // should contain the current uiState. It's not the case on
                // that branch.
                uiState: previousUiState,
              }
            );
          }

          current.helper.setState(nextWidgetsStateWithRouting);
        }
      });

    // Widget indices
    widgets.filter(isIndexWidget).forEach(index => {
      // remove the subscription on the derviedHelper
      index.node.unsubscribeDerivedHelper();
      index.node.helper.removeAllListeners();

      // remove the derivedHelper when no nodes are present
      if (!resolveNodeFromIndexId(this.tree, index.indexId)) {
        index.node.derivedHelper.detach();
      }

      // recursive call to dispose widgets on the tree
      this.removeWidgetsFromNode(index.widgets, index.node);

      index.node = null;
    });
  }

  // /**
  //  * Clears the cached answers from Algolia and triggers a new search.
  //  *
  //  * @return {undefined} Does not return anything
  //  */
  // refresh() {
  //   if (this.helper) {
  //     this.helper.clearCache().search();
  //   }
  // }

  /**
   * Ends the initialization of InstantSearch.js and triggers the
   * first search. This method should be called after all widgets have been added
   * to the instance of InstantSearch.js. InstantSearch.js also supports adding and removing
   * widgets after the start as an **EXPERIMENTAL** feature.
   *
   * @return {undefined} Does not return anything
   */
  start() {
    if (this.started) throw new Error('start() has been already called once');

    if (this.routing) {
      this.routingManager = new RoutingManager({
        ...this.routing,
        instantSearchInstance: this,
      });

      this._onHistoryChange = function() {};
      // this._onHistoryChange = routingManager.onHistoryChange.bind(
      //   routingManager
      // );
      this._createURL = this.routingManager.createURL.bind(this.routingManager);
      this._createAbsoluteURL = this._createURL;

      this.tree.widgets.push(this.routingManager);

      // Get the UI state from the router
      const uiState = this.routingManager.getUiStateFromRouter();

      // Get the SearchParamters from the uiState
      const parameters = this.routingManager.getAllSearchParameters({
        uiState,
      });

      // Apply the SearchParamters on the instance
      this.routingManager.applySearchParameters(parameters);
    } else {
      this._createURL = defaultCreateURL;
      this._createAbsoluteURL = defaultCreateURL;
      this._onHistoryChange = function() {};
    }

    // if (this._searchFunction) {
    //   this._mainHelperSearch = helper.search.bind(helper);
    //   helper.search = () => {
    //     const helperSearchFunction = algoliasearchHelper(
    //       {
    //         search: () => new Promise(() => {}),
    //       },
    //       helper.state.index,
    //       helper.state
    //     );
    //     helperSearchFunction.once('search', state => {
    //       helper.overrideStateWithoutTriggeringChangeEvent(state);
    //       this._mainHelperSearch();
    //     });
    //     this._searchFunction(helperSearchFunction);
    //   };
    // }

    console.log('Start');
    console.log(this.tree);
    console.log('--');

    this._searchStalledTimer = null;
    this._isSearchStalled = true;

    this._init();

    this.tree.helper.on('search', () => {
      if (!this._isSearchStalled && !this._searchStalledTimer) {
        this._searchStalledTimer = setTimeout(() => {
          this._isSearchStalled = true;
          // This render does not work, it only render the top level widgets
          // since it trigger a render with only the top level helper. We
          // branch inside `render`.
          this._render(
            this.tree.helper,
            this.tree.helper.lastResults,
            this.tree.helper.lastResults._state
          );
        }, this._stalledSearchDelay);
      }
    });

    // this.tree.helper.on('result', this._render.bind(this, this.tree.helper));

    // this.tree.helper.on('error', e => this.emit('error', e));

    this.tree.helper.search();

    console.log('------');

    // track we started the search if we add more widgets,
    // to init them directly after add
    this.started = true;
  }

  /**
   * Removes all widgets without triggering a search afterwards. This is an **EXPERIMENTAL** feature,
   * if you find an issue with it, please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20dispose).
   * @return {undefined} This method does not return anything
   */
  dispose() {
    // this.removeWidgets(this.widgets);
    // You can not start an instance two times, therefore a disposed instance needs to set started as false
    // otherwise this can not be restarted at a later point.
    // this.started = false;
    // The helper needs to be reset to perform the next search from a fresh state.
    // If not reset, it would use the state stored before calling `dispose()`.
    // this.helper.removeAllListeners();
    // this.helper = null;
  }

  // This method is not documented neither used inside Magento + Shopify (I checked)
  // on GitHub but worth asking to the integration team. The hard part for this one
  // is to infer on which node we want to alter the state. We can by default update
  // the root but do we really want to provide this functionnality?
  createURL(params) {
    // Won't be able to compute since we don't know on which node we want to
    // alter the state. See the usage of this API. First step would be to make
    // the function provided to the render part functional.
    if (!this._createURL) {
      throw new Error('You need to call start() before calling createURL()');
    }

    return this._createURL(this.helper.state.setQueryParameters(params));
  }

  _init() {
    const walk = node => {
      node.widgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            state: node.helper.getState(),
            helper: node.helper,
            templatesConfig: this.templatesConfig,
            // We can wrap the createURL function with the node at this level
            // which means that inside the router we're able to find which node
            // is impacted. That last part is to avoid to mutate the current
            // tree.
            createURL: this._createAbsoluteURL,
            onHistoryChange: this._onHistoryChange,
            instantSearchInstance: this,
          });
        }

        if (widget.node) {
          walk(widget.node);
        }
      });
    };

    walk(this.tree);
  }

  _batch() {
    if (this.isPending) {
      return;
    }

    this.isPending = true;

    _defer.then(() => {
      this.isPending = false;
      this._render();
    });
  }

  _render() {
    const walk = node => {
      const scoped = resolveNodesResultsFromNode(node);

      node.widgets.forEach(widget => {
        if (widget.render) {
          widget.render({
            templatesConfig: this.templatesConfig,
            scoped,
            results: node.derivedHelper.lastResults,
            // At this stage the `state` provided to `_render` is not the one
            // of `node.helper.state` but the one from the derivation. What
            // are the impact... Complicated to see all of them...
            state: node.derivedHelper.lastResults._state,
            helper: node.helper,
            createURL: this._createAbsoluteURL,
            instantSearchInstance: this,
            searchMetadata: {
              isSearchStalled: this._isSearchStalled,
            },
          });
        }

        if (widget.node) {
          walk(widget.node);
        }
      });
    };

    if (!this.tree.helper.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;
      this._isSearchStalled = false;
    }

    walk(this.tree);

    this.emit('render');
  }

  // _render(helper, results, state) {
  //   const walk = node => {
  //     node.widgets.forEach(widget => {
  //       if (node.helper === helper && widget.render) {
  //         widget.render({
  //           templatesConfig: this.templatesConfig,
  //           scope: [],
  //           results,
  //           // At this stage the `state` provided to `_render` is not the one
  //           // of `node.helper.state` but the one from the derivation. What
  //           // are the impact... Complicated to see all of them...
  //           state,
  //           helper: node.helper,
  //           createURL: this._createAbsoluteURL,
  //           instantSearchInstance: this,
  //           searchMetadata: {
  //             isSearchStalled: this._isSearchStalled,
  //           },
  //         });
  //       }

  //       if (widget.node) {
  //         walk(widget.node);
  //       }
  //     });
  //   };

  //   if (!this.tree.helper.hasPendingRequests()) {
  //     clearTimeout(this._searchStalledTimer);
  //     this._searchStalledTimer = null;
  //     this._isSearchStalled = false;
  //   }

  //   walk(this.tree);

  //   this.emit('render');
  // }
}

export function enhanceConfiguration(searchParametersFromUrl) {
  return (configuration, widgetDefinition) => {
    if (!widgetDefinition.getConfiguration) return configuration;

    // Get the relevant partial configuration asked by the widget
    const partialConfiguration = widgetDefinition.getConfiguration(
      configuration,
      searchParametersFromUrl
    );

    const customizer = (a, b) => {
      // always create a unified array for facets refinements
      if (Array.isArray(a)) {
        return union(a, b);
      }

      // avoid mutating objects
      if (isPlainObject(a)) {
        return mergeWith({}, a, b, customizer);
      }

      return undefined;
    };

    return mergeWith({}, configuration, partialConfiguration, customizer);
  };
}

export default InstantSearch;
