import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  DerivedHelper,
  SearchParameters,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import {
  InstantSearch,
  Widget,
  UiState,
  InitOptions,
  RenderOptions,
  DisposeOptions,
  Client,
} from '../../types';
import {
  createDocumentationMessageGenerator,
  resolveSearchParameters,
  // enhanceConfiguration,
  mergeSearchParameters,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index',
});

type IndexProps = {
  indexName: string;
};

type GetSearchParametersOptions = {
  parameters: SearchParameters;
};

type GetUiStateOptions = {
  parameters: SearchParameters;
};

export type Index = Widget & {
  $$type: string;
  getIndexName(): string;
  getUiState(): UiState;
  setUiState(uiState: UiState): void;
  getSearchParameters(options: GetSearchParametersOptions): SearchParameters;
  getHelper(): Helper | null;
  getParent(): Index | null;
  getWidgets(): Widget[];
  addWidgets(widgets: Widget[]): Index;
  removeWidgets(widgets: Widget[]): Index;
  init(options: InitOptions): void;
  render(options: RenderOptions): void;
  dispose(options: DisposeOptions): void;
};

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

  const getLocalSearchParameters = (
    options: GetSearchParametersOptions
  ): SearchParameters => {
    return localWidgets
      .filter(widget => {
        // @ts-ignore: Use classic widget vs index
        return widget.$$type !== 'ais.index';
      })
      .reduce((previous, widget) => {
        if (!widget.getWidgetSearchParameters) {
          return previous;
        }

        return widget.getWidgetSearchParameters(previous, {
          uiState: localUiState,
        });
      }, options.parameters);
  };

  const getLocalUiState = (options: GetUiStateOptions): UiState => {
    return localWidgets
      .filter(widget => {
        // @ts-ignore: Use classic widget vs index
        return widget.$$type !== 'ais.index';
      })
      .reduce<UiState>((previous, widget) => {
        if (!widget.getWidgetState) {
          return previous;
        }

        return widget.getWidgetState(previous, {
          searchParameters: options.parameters,
          helper: helper!,
        });
      }, {});
  };

  const createURL = (state: SearchParameters): string => {
    return localInstantSearchInstance!._createAbsoluteURL({
      indexId: parent === null ? null : indexName,
      uiState: getLocalUiState({
        parameters: state,
      }),
    });
  };

  return {
    $$type: 'ais.index',

    getIndexName() {
      return indexName;
    },

    getUiState() {
      return localUiState;
    },

    setUiState(uiState) {
      localUiState = uiState;
    },

    getSearchParameters({ parameters }) {
      return getLocalSearchParameters({
        parameters,
      });
    },

    getHelper() {
      return helper;
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
          // localWidgets.reduce(enhanceConfiguration, {
          //   ...helper!.state,
          // })
          getLocalSearchParameters({
            parameters: helper!.state,
          })
        );

        widgets.forEach(widget => {
          if (localInstantSearchInstance && widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              instantSearchInstance: localInstantSearchInstance,
              state: helper!.state,
              templatesConfig: localInstantSearchInstance.templatesConfig,
              createURL: localInstantSearchInstance._createAbsoluteURL,
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

        helper!.setState(
          // localWidgets.reduce(enhanceConfiguration, {
          //   ...nextState,
          // })
          getLocalSearchParameters({
            parameters: nextState,
          })
        );

        if (localWidgets.length) {
          localInstantSearchInstance.scheduleSearch();
        }
      }

      return this;
    },

    init({ instantSearchInstance, parent }: InitOptions) {
      localUiState =
        // @ts-ignore
        instantSearchInstance._routingManager.getInitialWidgetState(
          parent === null ? null : indexName
        ) || {};

      localInstantSearchInstance = instantSearchInstance;
      localParent = parent;

      // The `mainHelper` is already defined at this point. The instance is created
      // inside InstantSearch at the `start` method, which occurs before the `init`
      // step.
      const mainHelper = instantSearchInstance.mainHelper!;

      const initialSearchParameters =
        // Uses the `searchParameters` for the top level index only, it allows
        // us to have the exact same behaviour than before for the mono-index.
        parent === null ? instantSearchInstance._searchParameters : {};

      // This Helper is only used for state management we do not care about the
      // `searchClient`. Only the "main" Helper created at the `InstantSearch`
      // level is aware of the client.
      helper = algoliasearchHelper(
        {} as Client,
        indexName,
        // localWidgets.reduce(enhanceConfiguration, initialSearchParameters)
        getLocalSearchParameters({
          parameters: algoliasearchHelper.SearchParameters.make(
            initialSearchParameters
          ),
        })
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

      helper.on('change', ({ state }) => {
        localUiState = getLocalUiState({
          parameters: state,
        });

        // @ts-ignore
        localInstantSearchInstance._routingManager.onChange(localUiState);

        console.log('localUiState', indexName, localUiState);
      });

      derivedHelper = mainHelper.derive(() =>
        mergeSearchParameters(...resolveSearchParameters(this))
      );

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
            // createURL: instantSearchInstance._createAbsoluteURL,
            createURL,
          });
        }
      });
    },

    render({ instantSearchInstance }: RenderOptions) {
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
            state: derivedHelper!.lastResults._state,
            templatesConfig: instantSearchInstance.templatesConfig,
            // createURL: instantSearchInstance._createAbsoluteURL,
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
  };
};

export default index;
