// import algoliasearchHelper from 'algoliasearch-helper';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';
import EventEmitter from 'events';
import { Index } from '../widgets/index/index';
// import RoutingManager from './RoutingManager';
// import simpleMapping from './stateMappings/simple';
// import historyRouter from './routers/history';
// import version from './version';
import algoliasearchHelper from './stateManager';
import { resolveSingleLeafMerge } from './resolveSearchParametersWithMerge';
import createHelpers from './createHelpers';

// const ROUTING_DEFAULT_OPTIONS = {
//   stateMapping: simpleMapping(),
//   router: historyRouter(),
// };

function defaultCreateURL() {
  return '#';
}

const resolveRootNode = node => {
  const resolveParentNode = (innerNode, nodes) => {
    const next = [innerNode].concat(nodes);

    return innerNode.parent !== null
      ? resolveParentNode(innerNode.parent, next)
      : next;
  };

  return resolveParentNode(node, []);
};

const createMainHelper = ({ client, index, parameters, nodesByIndexId }) => {
  const helper = algoliasearchHelper(client, index, parameters);
  const mainSearchFunction = helper.search.bind(helper);

  helper.search = () => {
    const innerSearchParameters = nodesByIndexId[index].nodes.map(n =>
      // Resolve the search paramerters for each node that share the same
      // index identifer than this derived helper. We merge them based on
      // the order they have been added to the tree.
      resolveSingleLeafMerge(
        // Resolve the root node for each node that share the same index
        // identifer than this derived helper. We merge them based on
        // the order they have been added to the tree.
        ...resolveRootNode(n)
          // Tweaks for the input of the resolve function
          .map(_ => ({ state: _.helper.getState() }))
      )
    );

    const nextSearchParameters = resolveSingleLeafMerge(
      ...[{ state: helper.getState() }].concat(
        // Tweaks for the input of the resolve function
        innerSearchParameters.map(_ => ({ state: _ }))
      )
    );

    mainSearchFunction(nextSearchParameters);
  };

  return helper;
};

const createChildHelper = ({ parent, client, index, parameters }) => {
  const helper = algoliasearchHelper(client, index, parameters);

  helper.search = () => {
    parent.search();
  };

  return helper;
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
      // routing = null,
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
    this.nodesByIndexId = {};

    this.tree = {
      instance: this,
      parent: null,
      derivedHelper: null,
      indices: [],
      widgets: [],
      helper: createMainHelper({
        // Avoid the circular reference for the `nodesByIndexId`. Could be solve
        // with a structure more appropritate than two different structures. See
        // how we can improve the structure to support this.
        nodesByIndexId: this.nodesByIndexId,
        client: this.client,
        index: indexName,
        parameters: {
          ...searchParameters,
          index: indexName,
        },
      }),
    };

    this.nodesByIndexId[indexName] = {
      helper: this.tree.helper,
      nodes: [],
    };

    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };

    this._stalledSearchDelay = stalledSearchDelay;

    // if (searchFunction) {
    //   this._searchFunction = searchFunction;
    // }

    // if (routing === true) this.routing = ROUTING_DEFAULT_OPTIONS;
    // else if (isPlainObject(routing))
    //   this.routing = {
    //     ...ROUTING_DEFAULT_OPTIONS,
    //     ...routing,
    //   };
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
    // const lastWidget = this.widgets.pop();

    const current = node || this.tree;

    // Widgets
    widgets
      .filter(widget => !(widget instanceof Index))
      .forEach(widget => {
        if (widget.render === undefined && widget.init === undefined) {
          throw new Error('Widget definition missing render or init method');
        }

        current.helper.setState(
          enhanceConfiguration()(
            {
              ...current.helper.getState(),
            },
            widget
          )
        );

        current.widgets.push(widget);
      });

    // Indices
    widgets
      .filter(widget => widget instanceof Index)
      .forEach(index => {
        const isIndexIdAlreadyExist = Boolean(
          this.nodesByIndexId[index.indexId]
        );

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
          indices: [],
          widgets: [],
          derivedHelper: null,
          helper,
        };

        if (!isIndexIdAlreadyExist) {
          const derivedHelper = this.tree.helper.derive(() => {
            const innerSearchParameters = this.nodesByIndexId[
              index.indexId
            ].nodes.map(n =>
              // Resolve the search paramerters for each node that share the same
              // index identifer than this derived helper. We merge them based on
              // the order they have been added to the tree.
              resolveSingleLeafMerge(
                // Resolve the root node for each node that share the same index
                // identifer than this derived helper. We merge them based on
                // the order they have been added to the tree.
                ...resolveRootNode(n)
                  // Tweaks for the input of the resolve function
                  .map(_ => ({ state: _.helper.getState() }))
              )
            );

            const nodes = resolveRootNode(innerNode);
            const searchParameters = resolveSingleLeafMerge(
              ...nodes
                // Tweaks for the input of the resolve function
                .map(_ => ({ state: _.helper.getState() }))
            );

            return resolveSingleLeafMerge(
              ...[{ state: searchParameters }].concat(
                // Tweaks for the input of the resolve function
                innerSearchParameters.map(_ => ({ state: _ }))
              )
            );
          });

          innerNode.derivedHelper = derivedHelper;

          // register the index
          this.nodesByIndexId = {
            ...this.nodesByIndexId,
            [index.indexId]: {
              helper: derivedHelper,
              nodes: [],
            },
          };
        } else {
          this.nodesByIndexId[index.indexId].nodes.push(innerNode);
        }

        // attach the render callback with the helper node
        this.nodesByIndexId[index.indexId].helper.on(
          'result',
          this._render.bind(this, helper)
        );

        current.indices.push(innerNode);

        index.node = innerNode;

        // recursive call to add widgets on the tree
        this.addWidgets(index.widgets, innerNode);
      });

    // Second part of the fix for #3148
    // if (lastWidget) this.widgets.push(lastWidget);

    // Init the widget directly if instantsearch has been already started
    if (this.started && Boolean(widgets.length)) {
      widgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            state: node.helper.state,
            helper: node.helper,
            templatesConfig: this.templatesConfig,
            createURL: this._createAbsoluteURL,
            onHistoryChange: this._onHistoryChange,
            instantSearchInstance: this,
          });
        }
      });

      this.tree.helper.search();

      console.log('search for widgets added:');
      console.log(this.tree);
      console.log('--');
    }
  }

  removeWidgets(widgets, node) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        'You need to provide an array of widgets or call `removeWidget()`'
      );
    }

    const current = node || this.tree;

    // Widgets
    widgets
      .filter(widget => !(widget instanceof Index))
      .forEach(widget => {
        if (
          !current.widgets.includes(widget) ||
          typeof widget.dispose !== 'function'
        ) {
          throw new Error(
            'The widget you tried to remove does not implement the dispose method, therefore it is not possible to remove this widget'
          );
        }

        current.widgets = current.widgets.filter(w => w !== widget);

        const nextState = widget.dispose({
          helper: current.helper,
          state: current.helper.getState(),
        });

        if (nextState) {
          current.helper.setState(
            // @TODO: resolve the search parameters from the tree
            // node.helper.getState() -> node.parent.helper.getState()
            current.widgets.reduce(enhanceConfiguration({}), {
              ...this.searchParameters,
              ...current.parent.helper.getState(),
              ...nextState,
            })
          );
        }
      });

    // Widget indices
    widgets
      .filter(widget => widget instanceof Index)
      .forEach(index => {
        current.indices = current.indices.filter(n => n !== index.node);

        index.node.derivedHelper.detach();
        this.removeWidgets(index.widgets, index.node);

        index.node.indices.forEach(innerNode => {
          innerNode.derivedHelper.detach();
          this.removeWidgets(innerNode.widgets, innerNode);
          delete innerNode.parent.node;
        });

        delete index.node;
      });

    setTimeout(() => {
      // if (this.widgets.length > 0) {}
      this.tree.helper.search();
      console.log('------');
    }, 0);
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

    // if (this.routing) {
    //   const routingManager = new RoutingManager({
    //     ...this.routing,
    //     instantSearchInstance: this,
    //   });
    //   // this._onHistoryChange = routingManager.onHistoryChange.bind(
    //   //   routingManager
    //   // );
    //   this._createURL = routingManager.createURL.bind(routingManager);
    //   this._createAbsoluteURL = this._createURL;
    //   this.tree.widgets.push(routingManager);
    // } else {
    this._createURL = defaultCreateURL;
    this._createAbsoluteURL = defaultCreateURL;
    this._onHistoryChange = function() {};
    // }

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

    this.tree.helper.on('result', this._render.bind(this, this.tree.helper));

    this.tree.helper.on('error', e => this.emit('error', e));

    this.tree.helper.search();

    console.log('------');

    // track we started the search if we add more widgets,
    // to init them directly after add
    this.started = true;
  }

  // /**
  //  * Removes all widgets without triggering a search afterwards. This is an **EXPERIMENTAL** feature,
  //  * if you find an issue with it, please
  //  * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20dispose).
  //  * @return {undefined} This method does not return anything
  //  */
  // dispose() {
  //   this.removeWidgets(this.widgets);
  //   // You can not start an instance two times, therefore a disposed instance needs to set started as false
  //   // otherwise this can not be restarted at a later point.
  //   this.started = false;

  //   // The helper needs to be reset to perform the next search from a fresh state.
  //   // If not reset, it would use the state stored before calling `dispose()`.
  //   this.helper.removeAllListeners();
  //   this.helper = null;
  // }

  // createURL(params) {
  //   if (!this._createURL) {
  //     throw new Error('You need to call start() before calling createURL()');
  //   }
  //   return this._createURL(this.helper.state.setQueryParameters(params));
  // }

  _init() {
    const walk = node => {
      node.widgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            state: node.helper.getState(),
            helper: node.helper,
            templatesConfig: this.templatesConfig,
            createURL: this._createAbsoluteURL,
            onHistoryChange: this._onHistoryChange,
            instantSearchInstance: this,
          });
        }
      });

      node.indices.forEach(inner => walk(inner));
    };

    walk(this.tree);
  }

  _render(helper, results, state) {
    const walk = node => {
      if (node.helper === helper) {
        node.widgets.forEach(widget => {
          if (widget.render) {
            widget.render({
              templatesConfig: this.templatesConfig,
              results,
              state,
              helper: node.helper,
              createURL: this._createAbsoluteURL,
              instantSearchInstance: this,
              searchMetadata: {
                isSearchStalled: this._isSearchStalled,
              },
            });
          }
        });
      }

      node.indices.forEach(inner => walk(inner));
    };

    if (!this.tree.helper.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;
      this._isSearchStalled = false;
    }

    walk(this.tree);

    this.emit('render');
  }
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
