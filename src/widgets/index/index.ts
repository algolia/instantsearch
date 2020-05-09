import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import {
  InstantSearch,
  UiState,
  IndexUiState,
  Widget,
  InitOptions,
  RenderOptions,
  WidgetStateOptions,
  WidgetSearchParametersOptions,
  ScopedResult,
} from '../../types';
import { createSearchManager } from '../../lib/searchManager';
import {
  checkIndexUiState,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index-widget',
});

type IndexProps = {
  indexName: string;
  indexId?: string;
};

type IndexInitOptions = Pick<
  InitOptions,
  'instantSearchInstance' | 'parent' | 'uiState'
>;

type IndexRenderOptions = Pick<RenderOptions, 'instantSearchInstance'>;

type LocalWidgetSearchParametersOptions = WidgetSearchParametersOptions & {
  initialSearchParameters: SearchParameters;
};

export type Index = Widget & {
  getIndexName(): string;
  getIndexId(): string;
  getHelper(): Helper | null;
  getResults(): SearchResults | null;
  getParent(): Index | null;
  getWidgets(): Widget[];
  addWidgets(widgets: Widget[]): Index;
  removeWidgets(widgets: Widget[]): Index;
  init(options: IndexInitOptions): void;
  render(options: IndexRenderOptions): void;
  dispose(): void;
  getWidgetState(uiState: UiState): UiState;
  getWidgetSearchParameters(
    searchParameters: SearchParameters,
    searchParametersOptions: { uiState: IndexUiState }
  ): SearchParameters;
  refreshUiState(): void;
};

export function isIndexWidget(widget: Widget): widget is Index {
  return widget.$$type === 'ais.index';
}

function getLocalWidgetsState(
  widgets: Widget[],
  widgetStateOptions: WidgetStateOptions
): IndexUiState {
  return widgets
    .filter(widget => !isIndexWidget(widget))
    .reduce<IndexUiState>((uiState, widget) => {
      if (!widget.getWidgetState) {
        return uiState;
      }

      return widget.getWidgetState(uiState, widgetStateOptions);
    }, {});
}

function getLocalWidgetsSearchParameters(
  widgets: Widget[],
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

function resolveScopedResultsFromWidgets(widgets: Widget[]): ScopedResult[] {
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

function resolveScopedResultsFromIndex(widget: Index): ScopedResult[] {
  const widgetParent = widget.getParent();
  // If the widget is the root, we consider itself as the only sibling.
  const widgetSiblings = widgetParent ? widgetParent.getWidgets() : [widget];

  return resolveScopedResultsFromWidgets(widgetSiblings);
}

const index = (props: IndexProps): Index => {
  if (props === undefined || props.indexName === undefined) {
    throw new Error(withUsage('The `indexName` option is required.'));
  }

  const { indexName, indexId = indexName } = props;

  let localWidgets: Widget[] = [];
  let localUiState: IndexUiState = {};
  let localInstantSearchInstance: InstantSearch | null = null;
  let localParent: Index | null = null;
  let searchManager: ReturnType<typeof createSearchManager> | null = null;

  const createURL = (nextState: SearchParameters) =>
    localInstantSearchInstance!._createURL!({
      [indexId]: getLocalWidgetsState(localWidgets, {
        searchParameters: nextState,
        helper: searchManager!.getLegacyHelper()!,
      }),
    });

  return {
    $$type: 'ais.index',

    getIndexName() {
      return indexName;
    },

    getIndexId() {
      return indexId;
    },

    getHelper() {
      return searchManager!.getLegacyHelper();
    },

    getResults() {
      return searchManager!.getResults();
    },

    getParent() {
      return localParent;
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
        searchManager!.setState(
          getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: searchManager!.getState(),
          })
        );

        widgets.forEach(widget => {
          if (localInstantSearchInstance && widget.init) {
            widget.init({
              helper: this.getHelper()!,
              parent: this,
              uiState: {},
              instantSearchInstance: localInstantSearchInstance,
              state: searchManager!.getState(),
              templatesConfig: localInstantSearchInstance.templatesConfig,
              createURL,
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
          const next = widget.dispose!({ helper: this.getHelper()!, state });

          return next || state;
        }, searchManager!.getState());

        localUiState = getLocalWidgetsState(localWidgets, {
          searchParameters: nextState,
          helper: this.getHelper()!,
        });

        searchManager!.setState(
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
      let isIndexInitialized = false;
      localInstantSearchInstance = instantSearchInstance;
      localParent = parent;
      localUiState = uiState[indexId] || {};

      const searchParameters = getLocalWidgetsSearchParameters(localWidgets, {
        uiState: localUiState,
        initialSearchParameters: new algoliasearchHelper.SearchParameters({
          index: indexName,
        }),
      });

      searchManager = createSearchManager({
        searchParameters,
        searchIndex: this,
        instantSearchInstance,
        getIsIndexInitialized: () => isIndexInitialized,
        onChange: ({ state }) => {
          localUiState = getLocalWidgetsState(localWidgets, {
            searchParameters: state,
            helper: this.getHelper()!,
          });
        },
        onSearch: () => {
          if (__DEV__) {
            checkIndexUiState({ index: this, indexUiState: localUiState });
          }
        },
      });

      localWidgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            uiState,
            helper: this.getHelper()!,
            parent: this,
            instantSearchInstance,
            state: searchManager!.getState(),
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL,
          });
        }
      });

      isIndexInitialized = true;
    },

    render({ instantSearchInstance }: IndexRenderOptions) {
      localWidgets.forEach(widget => {
        // At this point, all the variables used below are set. Both `helper`
        // and `derivedHelper` have been created at the `init` step. The attribute
        // `lastResults` might be `null` though. It's possible that a stalled render
        // happens before the result e.g with a dynamically added index the request might
        // be delayed. The render is triggered for the complete tree but some parts do
        // not have results yet.

        if (widget.render && this.getResults()) {
          widget.render({
            helper: this.getHelper()!,
            instantSearchInstance,
            results: this.getResults()!,
            scopedResults: resolveScopedResultsFromIndex(this),
            state: this.getResults()!._state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL,
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
            helper: this.getHelper()!,
            state: searchManager!.getState(),
          });
        }
      });

      localInstantSearchInstance = null;
      localParent = null;

      searchManager!.teardown();
    },

    getWidgetState(uiState: UiState) {
      return localWidgets
        .filter(isIndexWidget)
        .reduce<UiState>(
          (previousUiState, innerIndex) =>
            innerIndex.getWidgetState(previousUiState),
          {
            ...uiState,
            [this.getIndexId()]: localUiState,
          }
        );
    },

    getWidgetSearchParameters(searchParameters, { uiState }) {
      return getLocalWidgetsSearchParameters(localWidgets, {
        uiState,
        initialSearchParameters: searchParameters,
      });
    },

    refreshUiState() {
      localUiState = getLocalWidgetsState(localWidgets, {
        searchParameters: searchManager!.getState(),
        helper: this.getHelper()!,
      });
    },
  };
};

export default index;
