import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  DerivedHelper,
  PlainSearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { Client } from 'algoliasearch';
import {
  InstantSearch,
  UiState,
  Widget,
  InitOptions,
  RenderOptions,
  WidgetStateOptions,
  ScopedResult,
} from '../../types';
import {
  createDocumentationMessageGenerator,
  resolveSearchParameters,
  enhanceConfiguration,
  mergeSearchParameters,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index',
});

type IndexProps = {
  indexName: string;
};

type IndexInitOptions = Pick<InitOptions, 'instantSearchInstance' | 'parent'>;
type IndexRenderOptions = Pick<RenderOptions, 'instantSearchInstance'>;

export type Index = Widget & {
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
};

function isIndexWidget(widget: Widget): widget is Index {
  return widget.$$type === 'ais.index';
}

function getLocalWidgetsState(
  widgets: Widget[],
  widgetStateOptions: WidgetStateOptions
): UiState {
  return widgets
    .filter(widget => !isIndexWidget(widget))
    .reduce<UiState>((uiState, widget) => {
      if (!widget.getWidgetState) {
        return uiState;
      }

      return widget.getWidgetState(uiState, widgetStateOptions);
    }, {});
}

function resetPageFromWidgets(widgets: Widget[]): void {
  const indexWidgets = widgets.filter(isIndexWidget);

  if (indexWidgets.length === 0) {
    return;
  }

  indexWidgets.forEach(widget => {
    const widgetHelper = widget.getHelper()!;

    widgetHelper.overrideStateWithoutTriggeringChangeEvent(
      // @ts-ignore @TODO: remove "ts-ignore" once `resetPage()` is typed in the helper
      widgetHelper.state.resetPage()
    );

    resetPageFromWidgets(widget.getWidgets());
  });
}

function resolveScopedResultsFromWidgets(widgets: Widget[]): ScopedResult[] {
  const indexWidgets = widgets.filter(isIndexWidget);

  return indexWidgets.reduce<ScopedResult[]>((scopedResults, current) => {
    return scopedResults.concat(
      {
        indexId: current.getIndexId(),
        results: current.getResults()!,
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
  const { indexName = null } = props || {};

  let localWidgets: Widget[] = [];
  let localUiState: UiState = {};
  let localInstantSearchInstance: InstantSearch | null = null;
  let localParent: Index | null = null;
  let helper: Helper | null = null;
  let derivedHelper: DerivedHelper | null = null;

  if (indexName === null) {
    throw new Error(withUsage('The `indexName` option is required.'));
  }

  return {
    $$type: 'ais.index',

    getIndexId() {
      return indexName;
    },

    getHelper() {
      return helper;
    },

    getResults() {
      return derivedHelper && derivedHelper.lastResults;
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

      // The routing manager widget is always added manually at the last position.
      // By removing it from the last position and adding it back after, we ensure
      // it keeps this position.
      // fixes #3148
      const lastWidget = localWidgets.pop();

      localWidgets = localWidgets.concat(widgets);

      if (lastWidget) {
        // Second part of the fix for #3148
        localWidgets = localWidgets.concat(lastWidget);
      }

      if (localInstantSearchInstance && Boolean(widgets.length)) {
        helper!.setState(
          localWidgets.reduce(enhanceConfiguration, helper!.state)
        );

        widgets.forEach(widget => {
          if (localInstantSearchInstance && widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              instantSearchInstance: localInstantSearchInstance,
              state: helper!.state,
              templatesConfig: localInstantSearchInstance.templatesConfig,
              createURL: localInstantSearchInstance._createAbsoluteURL!,
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
          const next = widget.dispose!({ helper: helper!, state });

          return next || state;
        }, helper!.state);

        helper!.setState(localWidgets.reduce(enhanceConfiguration, nextState));

        if (localWidgets.length) {
          localInstantSearchInstance.scheduleSearch();
        }
      }

      return this;
    },

    init({ instantSearchInstance, parent }: IndexInitOptions) {
      localInstantSearchInstance = instantSearchInstance;
      localParent = parent;

      // The `mainHelper` is already defined at this point. The instance is created
      // inside InstantSearch at the `start` method, which occurs before the `init`
      // step.
      const mainHelper = instantSearchInstance.mainHelper!;

      const initialSearchParameters = new algoliasearchHelper.SearchParameters(
        // Uses the `searchParameters` for the top level index only, it allows
        // us to have the exact same behaviour than before for the mono-index.
        parent === null ? instantSearchInstance._searchParameters : {}
      );

      // This Helper is only used for state management we do not care about the
      // `searchClient`. Only the "main" Helper created at the `InstantSearch`
      // level is aware of the client.
      helper = algoliasearchHelper(
        {} as Client,
        indexName,
        localWidgets.reduce(enhanceConfiguration, initialSearchParameters)
      );

      // We forward the call to `search` to the "main" instance of the Helper
      // which is responsible for managing the queries (it's the only one that is
      // aware of the `searchClient`).
      helper.search = () => mainHelper.search();

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

      helper.on('change', ({ state, isPageReset }) => {
        localUiState = getLocalWidgetsState(localWidgets, {
          searchParameters: state,
          helper: helper!,
        });

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
      });

      derivedHelper.on('result', () => {
        // The index does not render the results it schedules a new render
        // to let all the other indices emit their own results. It allows us to
        // run the render process in one pass.
        instantSearchInstance.scheduleRender();
      });

      localWidgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            helper: helper!,
            parent: this,
            instantSearchInstance,
            state: helper!.state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: instantSearchInstance._createAbsoluteURL!,
          });
        }
      });
    },

    render({ instantSearchInstance }: IndexRenderOptions) {
      localWidgets.forEach(widget => {
        // At this point, all the variables used below are set. Both `helper`
        // and `derivedHelper` have been created at the `init` step. The attribute
        // `lastResults` might be `null` though. It's possible that a stalled render
        // happens before the result e.g with a dynamically added index the request might
        // be delayed. The render is triggered for the complete tree but some parts do
        // not have results yet.

        if (widget.render && derivedHelper!.lastResults) {
          widget.render({
            helper: helper!,
            instantSearchInstance,
            results: derivedHelper!.lastResults,
            scopedResults: resolveScopedResultsFromIndex(this),
            state: derivedHelper!.lastResults._state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: instantSearchInstance._createAbsoluteURL!,
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
          widget.dispose({ helper: helper!, state: helper!.state });
        }
      });

      localInstantSearchInstance = null;
      localParent = null;
      helper!.removeAllListeners();
      helper = null;

      derivedHelper!.detach();
      derivedHelper = null;
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
  };
};

export default index;
