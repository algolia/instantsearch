import instantsearch from 'instantsearch.js/es';
import algoliaHelper from 'algoliasearch-helper';
import { isVue3, isVue2, Vue2, createSSRApp } from '../util/vue-compat';
const { SearchResults, SearchParameters } = algoliaHelper;
import { warn } from './warn';

function walkIndex(indexWidget, visit) {
  visit(indexWidget);

  return indexWidget.getWidgets().forEach(widget => {
    if (widget.$$type !== 'ais.index') return;
    visit(widget);
    walkIndex(widget, visit);
  });
}

function searchOnlyWithDerivedHelpers(helper) {
  return new Promise((resolve, reject) => {
    helper.searchOnlyWithDerivedHelpers();

    // we assume all derived helpers resolve at least in the same tick
    helper.derivedHelpers[0].on('result', () => {
      resolve();
    });

    helper.derivedHelpers.forEach(derivedHelper =>
      derivedHelper.on('error', e => {
        reject(e);
      })
    );
  });
}

function defaultCloneComponent(componentInstance, { mixins = [] } = {}) {
  const options = {
    serverPrefetch: undefined,
    fetch: undefined,
    _base: undefined,
    name: 'ais-ssr-root-component',
  };

  let app;

  if (isVue3) {
    const appOptions = Object.assign({}, componentInstance.$options, options);
    appOptions.mixins = [...appOptions.mixins, ...mixins];
    app = createSSRApp(appOptions);
    if (componentInstance.$router) {
      app.use(componentInstance.$router);
    }
    if (componentInstance.$store) {
      app.use(componentInstance.$store);
    }
  } else {
    // copy over global Vue APIs
    options.router = componentInstance.$router;
    options.store = componentInstance.$store;

    const Extended = componentInstance.$vnode
      ? componentInstance.$vnode.componentOptions.Ctor.extend(options)
      : Vue2.component(Object.assign({}, componentInstance.$options, options));

    app = new Extended({
      propsData: componentInstance.$options.propsData,
      mixins: [...mixins],
    });
  }

  // https://stackoverflow.com/a/48195006/3185307
  app.$slots = componentInstance.$slots;
  app.$root = componentInstance.$root;
  if (isVue2) {
    app.$options.serverPrefetch = [];
  }

  return app;
}

function augmentInstantSearch(
  instantSearchOptions,
  searchClient,
  indexName,
  cloneComponent
) {
  /* eslint-disable no-param-reassign */

  const helper = algoliaHelper(searchClient, indexName);
  const search = instantsearch(instantSearchOptions);

  let resultsState;

  /**
   * main API for SSR, called in serverPrefetch of a root component which contains instantsearch
   * @param {Object} props the object including `component` and `renderToString`
   * @param {Object} props.component the calling component's `this`
   * @param {Function} props.renderToString the function to render componentInstance to string
   * @returns {Promise} result of the search, to save for .hydrate
   */
  search.findResultsState = function({ component, renderToString }) {
    if (!renderToString) {
      throw new Error(
        'findResultsState requires `renderToString: (component) => Promise<string>` in the first argument.'
      );
    }

    let app;
    let renderedComponent;

    return Promise.resolve()
      .then(() => {
        app = cloneComponent(component, {
          mixins: [
            {
              created() {
                // eslint-disable-next-line consistent-this
                renderedComponent = this;
                this.instantsearch.helper = helper;
                this.instantsearch.mainHelper = helper;

                this.instantsearch.mainIndex.init({
                  instantSearchInstance: this.instantsearch,
                  parent: null,
                  uiState: this.instantsearch._initialUiState,
                });
              },
            },
          ],
        });
      })
      .then(() => renderToString(app))
      .then(() => searchOnlyWithDerivedHelpers(helper))
      .then(() => {
        const results = {};
        walkIndex(renderedComponent.instantsearch.mainIndex, widget => {
          results[widget.getIndexId()] = widget.getResults();
        });

        search.hydrate(results);

        resultsState = Object.keys(results)
          .map(indexId => {
            const { _state, _rawResults } = results[indexId];
            return [
              indexId,
              {
                // copy just the values of SearchParameters, not the functions
                _state: Object.keys(_state).reduce((acc, key) => {
                  acc[key] = _state[key];
                  return acc;
                }, {}),
                _rawResults,
              },
            ];
          })
          .reduce(
            (acc, [key, val]) => {
              acc[key] = val;
              return acc;
            },
            {
              __identifier: 'stringified',
            }
          );
        return search.getState();
      });
  };

  /**
   * @returns {Promise} result state to serialize and enter into .hydrate
   */
  search.getState = function() {
    if (!resultsState) {
      throw new Error('You need to wait for findResultsState to finish');
    }
    return resultsState;
  };

  /**
   * make sure correct data is available in each widget's state.
   * called in widget mixin with (this.widget, this)
   *
   * @param {object} widget The widget instance
   * @param {object} parent The local parent index
   * @returns {void}
   */
  search.__forceRender = function(widget, parent) {
    const localHelper = parent.getHelper();

    const results = search.__initialSearchResults[parent.getIndexId()];

    // this happens when a different InstantSearch gets rendered initially,
    // after the hydrate finished. There's thus no initial results available.
    if (!results) {
      return;
    }

    const state = results._state;

    // helper gets created in init, but that means it doesn't get the injected
    // parameters, because those are from the lastResults
    localHelper.state = state;

    widget.render({
      helper: localHelper,
      results,
      scopedResults: parent.getScopedResults().map(result =>
        Object.assign(result, {
          results: search.__initialSearchResults[result.indexId],
        })
      ),
      parent,
      state,
      templatesConfig: {},
      createURL: parent.createURL,
      instantSearchInstance: search,
      searchMetadata: {
        isSearchStalled: false,
      },
    });
  };

  /**
   * Called both in server
   * @param {object} results a map of indexId: SearchResults
   * @returns {void}
   */
  search.hydrate = function(results) {
    if (!results) {
      warn(
        'The result of `findResultsState()` needs to be passed to `hydrate()`.'
      );
      return;
    }

    const initialResults =
      results.__identifier === 'stringified'
        ? Object.keys(results).reduce((acc, indexId) => {
            if (indexId === '__identifier') {
              return acc;
            }
            acc[indexId] = new SearchResults(
              new SearchParameters(results[indexId]._state),
              results[indexId]._rawResults
            );
            return acc;
          }, {})
        : results;

    search.__initialSearchResults = initialResults;

    search.helper = helper;
    search.mainHelper = helper;

    search.mainIndex.init({
      instantSearchInstance: search,
      parent: null,
      uiState: search._initialUiState,
    });
  };

  /* eslint-enable no-param-reassign */
  return search;
}

export function createServerRootMixin(instantSearchOptions = {}) {
  const {
    searchClient,
    indexName,
    $cloneComponent = defaultCloneComponent,
  } = instantSearchOptions;

  if (!searchClient || !indexName) {
    throw new Error(
      'createServerRootMixin requires `searchClient` and `indexName` in the first argument'
    );
  }

  const search = augmentInstantSearch(
    instantSearchOptions,
    searchClient,
    indexName,
    $cloneComponent
  );

  // put this in the user's root Vue instance
  // we can then reuse that InstantSearch instance seamlessly from `ais-instant-search-ssr`
  const rootMixin = {
    provide() {
      return {
        $_ais_ssrInstantSearchInstance: this.instantsearch,
      };
    },
    data() {
      return {
        // this is in data, so that the real & duplicated render do not share
        // the same instantsearch instance.
        instantsearch: search,
      };
    },
  };

  return rootMixin;
}
