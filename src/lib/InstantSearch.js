import algoliasearchHelper from 'algoliasearch-helper';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';
import EventEmitter from 'events';
import { Index } from '../widgets/index/index';
// import RoutingManager from './RoutingManager';
// import simpleMapping from './stateMappings/simple';
// import historyRouter from './routers/history';
// import version from './version';
import createHelpers from './createHelpers';

// const ROUTING_DEFAULT_OPTIONS = {
//   stateMapping: simpleMapping(),
//   router: historyRouter(),
// };

function defaultCreateURL() {
  return '#';
}

// Issues:
// - 1. addWidgets: create N times the same index with same name (should re-use it)
// - 2. we currently only merge the parent with the current node for the SP but we
//   should bubble up in the tree until no parent is found. The merge of the SP
//   is complex because of the default values
// - 3. render could be faster (have to test):
//   - render full tree on each result with branch on helper (current)
//   - render part of the tree from the current node on each result
//   - render full tree only once we have all the results
// - 4. dynamicly added widgets we have to call init recursively only on the one that
//   have been added. How to know that on a recusrive tree? Maybe the solution is
//   to call `init` immediately after adding them? Other solutions?
// - 5. right now every time we add a widget to an instance that is started it does
//   N search based on the numbers of index that the widgets contains. We have to
//   limit the search to only one call
// - 6. the `index.widgets` and `node.widgets` are not sync after the start since we
//   append the widgets directly rather than wait for the node to be created. See
//   how we can get rid of the duplication.
// - 7. the removeWidget function removes correctly the current widget but it does not
//   compute the state for the complete tree. Only the current level is recreated but
//   we should probably do it for the rest of the tree below? Do we really have to do
//   it on each iteration though? Could we remove all the widgets and compute the state
//   at the end? Not sure since we use the `nextState` we can reduce it I think.

// Nice to have:
// - 1. Use a Symbol to indentify which kind of wiget it is

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

    this.tree = {
      instance: this,
      parent: null,
      indices: [],
      widgets: [],
      helper: algoliasearchHelper(this.client, indexName, {
        ...searchParameters,
        index: indexName,
      }),
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
        const innerNode = {
          instance: this,
          parent: current,
          indices: [],
          widgets: [],
          helper: createChildHelper({
            parent: current.helper,
            client: this.client,
            index: index.indexName,
            parameters: {
              ...current.helper.getState(),
              index: index.indexName,
            },
          }),
        };

        current.indices.push(innerNode);

        index.node = innerNode;

        // useful to trigger the N requets only the top level owns the search
        const derivedHelper = this.tree.helper.derive(parameters => {
          // @TODO: resolve the search parameters from the tree
          // node.helper.getState() -> node.parent.helper.getState()

          console.log('derive:');
          console.log({ ...parameters });
          console.log({ ...innerNode.helper.getState() });
          console.log('--');

          return algoliasearchHelper.SearchParameters.make({
            ...parameters,
            ...innerNode.helper.getState(),
          });
        });

        derivedHelper.on('result', this._render.bind(this, innerNode.helper));

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
            current.widgets.reduce(enhanceConfiguration({}), {
              ...this.searchParameters,
              ...nextState,
            })
          );
        }
      });

    // Indices

    setTimeout(() => {
      // if (this.widgets.length > 0) {}
      this.tree.helper.search();
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
