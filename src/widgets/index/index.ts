import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  DerivedHelper,
  PlainSearchParameters,
  SearchParameters,
  SearchResults,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';
import {
  InstantSearch,
  UiState,
  IndexUiState,
  Widget,
  InitOptions,
  RenderOptions,
  ScopedResult,
  SearchClient,
} from '../../types';
import {
  checkIndexUiState,
  createDocumentationMessageGenerator,
  resolveSearchParameters,
  mergeSearchParameters,
  warning,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index-widget',
});

type IndexWidgetParams = {
  indexName: string;
  indexId?: string;
};

type IndexInitOptions = Pick<
  InitOptions,
  'instantSearchInstance' | 'parent' | 'uiState'
>;

type IndexRenderOptions = Pick<RenderOptions, 'instantSearchInstance'>;

type WidgetSearchParametersOptions = Parameters<
  NonNullable<Widget['getWidgetSearchParameters']>
>[1];
type LocalWidgetSearchParametersOptions = WidgetSearchParametersOptions & {
  initialSearchParameters: SearchParameters;
};

export type IndexWidgetDescription = {
  $$type: 'ais.index';
  $$widgetType: 'ais.index';
};

export type IndexWidget = Omit<
  Widget<IndexWidgetDescription & { widgetParams: IndexWidgetParams }>,
  'getWidgetUiState' | 'getWidgetState'
> & {
  getIndexName(): string;
  getIndexId(): string;
  getHelper(): Helper | null;
  getResults(): SearchResults | null;
  getScopedResults(): ScopedResult[];
  getParent(): IndexWidget | null;
  getWidgets(): Array<Widget | IndexWidget>;
  createURL(state: SearchParameters): string;

  addWidgets(widgets: Array<Widget | IndexWidget>): IndexWidget;
  removeWidgets(widgets: Array<Widget | IndexWidget>): IndexWidget;

  init(options: IndexInitOptions): void;
  render(options: IndexRenderOptions): void;
  dispose(): void;
  /**
   * @deprecated
   */
  getWidgetState(uiState: UiState): UiState;
  getWidgetUiState(uiState: UiState): UiState;
  getWidgetSearchParameters(
    searchParameters: SearchParameters,
    searchParametersOptions: { uiState: IndexUiState }
  ): SearchParameters;
  refreshUiState(): void;
};

export function isIndexWidget(
  widget: Widget | IndexWidget
): widget is IndexWidget {
  return widget.$$type === 'ais.index';
}

/**
 * This is the same content as helper._change / setState, but allowing for extra
 * UiState to be synchronized.
 * see: https://github.com/algolia/algoliasearch-helper-js/blob/6b835ffd07742f2d6b314022cce6848f5cfecd4a/src/algoliasearch.helper.js#L1311-L1324
 */
function privateHelperSetState(
  helper: AlgoliaSearchHelper,
  {
    state,
    isPageReset,
    _uiState,
  }: {
    state: SearchParameters;
    isPageReset?: boolean;
    _uiState?: IndexUiState;
  }
) {
  if (state !== helper.state) {
    helper.state = state;

    helper.emit('change', {
      state: helper.state,
      results: helper.lastResults,
      isPageReset,
      _uiState,
    });
  }
}

type WidgetUiStateOptions = Parameters<
  NonNullable<Widget['getWidgetUiState']>
>[1];

function getLocalWidgetsUiState(
  widgets: Array<Widget | IndexWidget>,
  widgetStateOptions: WidgetUiStateOptions,
  initialUiState: IndexUiState = {}
) {
  return widgets.reduce((uiState, widget) => {
    if (isIndexWidget(widget)) {
      return uiState;
    }

    if (!widget.getWidgetUiState && !widget.getWidgetState) {
      return uiState;
    }

    if (widget.getWidgetUiState) {
      return widget.getWidgetUiState(uiState, widgetStateOptions);
    }

    return widget.getWidgetState!(uiState, widgetStateOptions);
  }, initialUiState);
}

function getLocalWidgetsSearchParameters(
  widgets: Array<Widget | IndexWidget>,
  widgetSearchParametersOptions: LocalWidgetSearchParametersOptions
): SearchParameters {
  const { initialSearchParameters, ...rest } = widgetSearchParametersOptions;

  return widgets
    .filter(widget => !isIndexWidget(widget))
    .reduce<SearchParameters>((state, widget) => {
      if (!widget.getWidgetSearchParameters) {
        return state;
      }

      return widget.getWidgetSearchParameters(state, rest);
    }, initialSearchParameters);
}

function resetPageFromWidgets(widgets: Array<Widget | IndexWidget>): void {
  const indexWidgets = widgets.filter(isIndexWidget);

  if (indexWidgets.length === 0) {
    return;
  }

  indexWidgets.forEach(widget => {
    const widgetHelper = widget.getHelper()!;

    privateHelperSetState(widgetHelper, {
      state: widgetHelper.state.resetPage(),
      isPageReset: true,
    });

    resetPageFromWidgets(widget.getWidgets());
  });
}

function resolveScopedResultsFromWidgets(
  widgets: Array<Widget | IndexWidget>
): ScopedResult[] {
  const indexWidgets = widgets.filter(isIndexWidget);

  return indexWidgets.reduce<ScopedResult[]>((scopedResults, current) => {
    return scopedResults.concat(
      {
        indexId: current.getIndexId(),
        results: current.getResults()!,
        helper: current.getHelper()!,
      },
      ...resolveScopedResultsFromWidgets(current.getWidgets())
    );
  }, []);
}

const index = (widgetParams: IndexWidgetParams): IndexWidget => {
  if (widgetParams === undefined || widgetParams.indexName === undefined) {
    throw new Error(withUsage('The `indexName` option is required.'));
  }

  const { indexName, indexId = indexName } = widgetParams;

  let localWidgets: Array<Widget | IndexWidget> = [];
  let localUiState: IndexUiState = {};
  let localInstantSearchInstance: InstantSearch | null = null;
  let localParent: IndexWidget | null = null;
  let helper: Helper | null = null;
  let derivedHelper: DerivedHelper | null = null;

  return {
    $$type: 'ais.index',
    $$widgetType: 'ais.index',

    getIndexName() {
      return indexName;
    },

    getIndexId() {
      return indexId;
    },

    getHelper() {
      return helper;
    },

    getResults() {
      return derivedHelper && derivedHelper.lastResults;
    },

    getScopedResults() {
      const widgetParent = this.getParent();

      // If the widget is the root, we consider itself as the only sibling.
      const widgetSiblings = widgetParent ? widgetParent.getWidgets() : [this];

      return resolveScopedResultsFromWidgets(widgetSiblings);
    },

    getParent() {
      return localParent;
    },

    createURL(nextState: SearchParameters) {
      return localInstantSearchInstance!._createURL!({
        [indexId]: getLocalWidgetsUiState(localWidgets, {
          searchParameters: nextState,
          helper: helper!,
        }),
      });
    },

    getWidgets() {
      return localWidgets;
    },

    addWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `addWidgets` method expects an array of widgets.')
        );
      }

      if (
        widgets.some(
          widget =>
            typeof widget.init !== 'function' &&
            typeof widget.render !== 'function'
        )
      ) {
        throw new Error(
          withUsage(
            'The widget definition expects a `render` and/or an `init` method.'
          )
        );
      }

      localWidgets = localWidgets.concat(widgets);

      if (localInstantSearchInstance && Boolean(widgets.length)) {
        privateHelperSetState(helper!, {
          state: getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: helper!.state,
          }),
          _uiState: localUiState,
        });

        // We compute the render state before calling `init` in a separate loop
        // to construct the whole render state object that is then passed to
        // `init`.
        widgets.forEach(widget => {
          if (widget.getRenderState) {
            const renderState = widget.getRenderState(
              localInstantSearchInstance!.renderState[this.getIndexId()] || {},
              {
                uiState: localInstantSearchInstance!._initialUiState,
                helper: this.getHelper()!,
                parent: this,
                instantSearchInstance: localInstantSearchInstance!,
                state: helper!.state,
                renderState: localInstantSearchInstance!.renderState,
                templatesConfig: localInstantSearchInstance!.templatesConfig,
                createURL: this.createURL,
                scopedResults: [],
                searchMetadata: {
                  isSearchStalled: localInstantSearchInstance!._isSearchStalled,
                },
              }
            );

            storeRenderState({
              renderState,
              instantSearchInstance: localInstantSearchInstance!,
              parent: this,
            });
          }
        });

        widgets.forEach(widget => {
          if (widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              uiState: localInstantSearchInstance!._initialUiState,
              instantSearchInstance: localInstantSearchInstance!,
              state: helper!.state,
              renderState: localInstantSearchInstance!.renderState,
              templatesConfig: localInstantSearchInstance!.templatesConfig,
              createURL: this.createURL,
              scopedResults: [],
              searchMetadata: {
                isSearchStalled: localInstantSearchInstance!._isSearchStalled,
              },
            });
          }
        });

        localInstantSearchInstance.scheduleSearch();
      }

      return this;
    },

    removeWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `removeWidgets` method expects an array of widgets.')
        );
      }

      if (widgets.some(widget => typeof widget.dispose !== 'function')) {
        throw new Error(
          withUsage('The widget definition expects a `dispose` method.')
        );
      }

      localWidgets = localWidgets.filter(
        widget => widgets.indexOf(widget) === -1
      );

      if (localInstantSearchInstance && Boolean(widgets.length)) {
        const nextState = widgets.reduce((state, widget) => {
          // the `dispose` method exists at this point we already assert it
          const next = widget.dispose!({
            helper: helper!,
            state,
            parent: this,
          });

          return next || state;
        }, helper!.state);

        localUiState = getLocalWidgetsUiState(localWidgets, {
          searchParameters: nextState,
          helper: helper!,
        });

        helper!.setState(
          getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: nextState,
          })
        );

        if (localWidgets.length) {
          localInstantSearchInstance.scheduleSearch();
        }
      }

      return this;
    },

    init({ instantSearchInstance, parent, uiState }: IndexInitOptions) {
      if (helper !== null) {
        // helper is already initialized, therefore we do not need to set up
        // any listeners
        return;
      }

      localInstantSearchInstance = instantSearchInstance;
      localParent = parent;
      localUiState = uiState[indexId] || {};

      // The `mainHelper` is already defined at this point. The instance is created
      // inside InstantSearch at the `start` method, which occurs before the `init`
      // step.
      const mainHelper = instantSearchInstance.mainHelper!;
      const parameters = getLocalWidgetsSearchParameters(localWidgets, {
        uiState: localUiState,
        initialSearchParameters: new algoliasearchHelper.SearchParameters({
          index: indexName,
        }),
      });

      // This Helper is only used for state management we do not care about the
      // `searchClient`. Only the "main" Helper created at the `InstantSearch`
      // level is aware of the client.
      helper = algoliasearchHelper(
        {} as SearchClient,
        parameters.index,
        parameters
      );

      // We forward the call to `search` to the "main" instance of the Helper
      // which is responsible for managing the queries (it's the only one that is
      // aware of the `searchClient`).
      helper.search = () => {
        if (instantSearchInstance.onStateChange) {
          instantSearchInstance.onStateChange!({
            uiState: instantSearchInstance.mainIndex.getWidgetUiState({}),
            setUiState: instantSearchInstance.setUiState.bind(
              instantSearchInstance
            ),
          });

          // We don't trigger a search when controlled because it becomes the
          // responsibility of `setUiState`.
          return mainHelper;
        }

        return mainHelper.search();
      };

      helper.searchWithoutTriggeringOnStateChange = () => {
        return mainHelper.search();
      };

      // We use the same pattern for the `searchForFacetValues`.
      helper.searchForFacetValues = (
        facetName,
        facetValue,
        maxFacetHits,
        userState: PlainSearchParameters
      ) => {
        const state = helper!.state.setQueryParameters(userState);

        return mainHelper.searchForFacetValues(
          facetName,
          facetValue,
          maxFacetHits,
          state
        );
      };

      derivedHelper = mainHelper.derive(() =>
        mergeSearchParameters(...resolveSearchParameters(this))
      );

      // Subscribe to the Helper state changes for the page before widgets
      // are initialized. This behavior mimics the original one of the Helper.
      // It makes sense to replicate it at the `init` step. We have another
      // listener on `change` below, once `init` is done.
      helper.on('change', ({ isPageReset }) => {
        if (isPageReset) {
          resetPageFromWidgets(localWidgets);
        }
      });

      derivedHelper.on('search', () => {
        // The index does not manage the "staleness" of the search. This is the
        // responsibility of the main instance. It does not make sense to manage
        // it at the index level because it's either: all of them or none of them
        // that are stalled. The queries are performed into a single network request.
        instantSearchInstance.scheduleStalledRender();

        if (__DEV__) {
          checkIndexUiState({ index: this, indexUiState: localUiState });
        }
      });

      derivedHelper.on('result', ({ results }) => {
        // The index does not render the results it schedules a new render
        // to let all the other indices emit their own results. It allows us to
        // run the render process in one pass.
        instantSearchInstance.scheduleRender();

        // the derived helper is the one which actually searches, but the helper
        // which is exposed e.g. via instance.helper, doesn't search, and thus
        // does not have access to lastResults, which it used to in pre-federated
        // search behavior.
        helper!.lastResults = results;
      });

      // We compute the render state before calling `init` in a separate loop
      // to construct the whole render state object that is then passed to
      // `init`.
      localWidgets.forEach(widget => {
        if (widget.getRenderState) {
          const renderState = widget.getRenderState(
            instantSearchInstance.renderState[this.getIndexId()] || {},
            {
              uiState,
              helper: helper!,
              parent: this,
              instantSearchInstance,
              state: helper!.state,
              renderState: instantSearchInstance.renderState,
              templatesConfig: instantSearchInstance.templatesConfig,
              createURL: this.createURL,
              scopedResults: [],
              searchMetadata: {
                isSearchStalled: instantSearchInstance._isSearchStalled,
              },
            }
          );

          storeRenderState({
            renderState,
            instantSearchInstance,
            parent: this,
          });
        }
      });

      localWidgets.forEach(widget => {
        warning(
          // if it has NO getWidgetState or if it has getWidgetUiState, we don't warn
          // aka we warn if there's _only_ getWidgetState
          !widget.getWidgetState || Boolean(widget.getWidgetUiState),
          'The `getWidgetState` method is renamed `getWidgetUiState` and will no longer exist under that name in InstantSearch.js 5.x. Please use `getWidgetUiState` instead.'
        );

        if (widget.init) {
          widget.init({
            uiState,
            helper: helper!,
            parent: this,
            instantSearchInstance,
            state: helper!.state,
            renderState: instantSearchInstance.renderState,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: this.createURL,
            scopedResults: [],
            searchMetadata: {
              isSearchStalled: instantSearchInstance._isSearchStalled,
            },
          });
        }
      });

      // Subscribe to the Helper state changes for the `uiState` once widgets
      // are initialized. Until the first render, state changes are part of the
      // configuration step. This is mainly for backward compatibility with custom
      // widgets. When the subscription happens before the `init` step, the (static)
      // configuration of the widget is pushed in the URL. That's what we want to avoid.
      // https://github.com/algolia/instantsearch.js/pull/994/commits/4a672ae3fd78809e213de0368549ef12e9dc9454
      helper.on('change', event => {
        const { state } = event;

        const _uiState = (event as any)._uiState;

        localUiState = getLocalWidgetsUiState(
          localWidgets,
          {
            searchParameters: state,
            helper: helper!,
          },
          _uiState || {}
        );

        // We don't trigger an internal change when controlled because it
        // becomes the responsibility of `setUiState`.
        if (!instantSearchInstance.onStateChange) {
          instantSearchInstance.onInternalStateChange();
        }
      });
    },

    render({ instantSearchInstance }: IndexRenderOptions) {
      if (!this.getResults()) {
        return;
      }

      localWidgets.forEach(widget => {
        if (widget.getRenderState) {
          const renderState = widget.getRenderState(
            instantSearchInstance.renderState[this.getIndexId()] || {},
            {
              helper: this.getHelper()!,
              parent: this,
              instantSearchInstance,
              results: this.getResults()!,
              scopedResults: this.getScopedResults(),
              state: this.getResults()!._state,
              renderState: instantSearchInstance.renderState,
              templatesConfig: instantSearchInstance.templatesConfig,
              createURL: this.createURL,
              searchMetadata: {
                isSearchStalled: instantSearchInstance._isSearchStalled,
              },
            }
          );

          storeRenderState({
            renderState,
            instantSearchInstance,
            parent: this,
          });
        }
      });

      localWidgets.forEach(widget => {
        // At this point, all the variables used below are set. Both `helper`
        // and `derivedHelper` have been created at the `init` step. The attribute
        // `lastResults` might be `null` though. It's possible that a stalled render
        // happens before the result e.g with a dynamically added index the request might
        // be delayed. The render is triggered for the complete tree but some parts do
        // not have results yet.

        if (widget.render) {
          widget.render({
            helper: helper!,
            parent: this,
            instantSearchInstance,
            results: this.getResults()!,
            scopedResults: this.getScopedResults(),
            state: this.getResults()!._state,
            renderState: instantSearchInstance.renderState,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: this.createURL,
            searchMetadata: {
              isSearchStalled: instantSearchInstance._isSearchStalled,
            },
          });
        }
      });
    },

    dispose() {
      localWidgets.forEach(widget => {
        if (widget.dispose) {
          // The dispose function is always called once the instance is started
          // (it's an effect of `removeWidgets`). The index is initialized and
          // the Helper is available. We don't care about the return value of
          // `dispose` because the index is removed. We can't call `removeWidgets`
          // because we want to keep the widgets on the instance, to allow idempotent
          // operations on `add` & `remove`.
          widget.dispose({
            helper: helper!,
            state: helper!.state,
            parent: this,
          });
        }
      });

      localInstantSearchInstance = null;
      localParent = null;
      helper!.removeAllListeners();
      helper = null;

      derivedHelper!.detach();
      derivedHelper = null;
    },

    getWidgetUiState(uiState: UiState) {
      return localWidgets
        .filter(isIndexWidget)
        .reduce<UiState>(
          (previousUiState, innerIndex) =>
            innerIndex.getWidgetUiState(previousUiState),
          {
            ...uiState,
            [this.getIndexId()]: localUiState,
          }
        );
    },

    getWidgetState(uiState: UiState) {
      warning(
        false,
        'The `getWidgetState` method is renamed `getWidgetUiState` and will no longer exist under that name in InstantSearch.js 5.x. Please use `getWidgetUiState` instead.'
      );

      return this.getWidgetUiState(uiState);
    },

    getWidgetSearchParameters(searchParameters, { uiState }) {
      return getLocalWidgetsSearchParameters(localWidgets, {
        uiState,
        initialSearchParameters: searchParameters,
      });
    },

    refreshUiState() {
      localUiState = getLocalWidgetsUiState(localWidgets, {
        searchParameters: this.getHelper()!.state,
        helper: this.getHelper()!,
      });
    },
  };
};

export default index;

function storeRenderState({ renderState, instantSearchInstance, parent }) {
  const parentIndexName = parent
    ? parent.getIndexId()
    : instantSearchInstance.mainIndex.getIndexId();

  instantSearchInstance.renderState = {
    ...instantSearchInstance.renderState,
    [parentIndexName]: {
      ...instantSearchInstance.renderState[parentIndexName],
      ...renderState,
    },
  };
}
