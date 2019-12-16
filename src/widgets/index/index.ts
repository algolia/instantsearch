import algoliasearchHelper, {
  AlgoliaSearchHelper as Helper,
  DerivedHelper,
  PlainSearchParameters,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { Client } from 'algoliasearch';
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
import {
  createDocumentationMessageGenerator,
  resolveSearchParameters,
  mergeSearchParameters,
  warning,
  capitalize,
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
};

function isIndexWidget(widget: Widget): widget is Index {
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

function resetPageFromWidgets(widgets: Widget[]): void {
  const indexWidgets = widgets.filter(isIndexWidget);

  if (indexWidgets.length === 0) {
    return;
  }

  indexWidgets.forEach(widget => {
    const widgetHelper = widget.getHelper()!;

    // @ts-ignore @TODO: remove "ts-ignore" once `resetPage()` is typed in the helper
    widgetHelper.setState(widgetHelper.state.resetPage());

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
  let helper: Helper | null = null;
  let derivedHelper: DerivedHelper | null = null;

  const createURL = (nextState: SearchParameters) =>
    localInstantSearchInstance!._createURL!({
      [indexId]: getLocalWidgetsState(localWidgets, {
        searchParameters: nextState,
        helper: helper!,
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

      localWidgets = localWidgets.concat(widgets);

      if (localInstantSearchInstance && Boolean(widgets.length)) {
        helper!.setState(
          getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: helper!.state,
          })
        );

        widgets.forEach(widget => {
          if (localInstantSearchInstance && widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              uiState: {},
              instantSearchInstance: localInstantSearchInstance,
              state: helper!.state,
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
          const next = widget.dispose!({ helper: helper!, state });

          return next || state;
        }, helper!.state);

        localUiState = getLocalWidgetsState(localWidgets, {
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
      helper = algoliasearchHelper({} as Client, parameters.index, parameters);

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
          // Some connectors are responsible for multiple widgets so we need
          // to map them.
          // eslint-disable-next-line no-inner-declarations
          function getWidgetNames(connectorName: string): string[] {
            switch (connectorName) {
              case 'range':
                return ['rangeInput', 'rangeSlider'];

              case 'menu':
                return ['menu', 'menuSelect'];

              default:
                return [connectorName];
            }
          }

          type StateDescription = {
            connectors: string[];
            widgets: Array<Widget['$$type']>;
          };

          type StateToWidgets = {
            [TParameter in keyof IndexUiState]: StateDescription;
          };

          const stateToWidgetsMap: StateToWidgets = {
            query: {
              connectors: ['connectSearchBox'],
              widgets: ['ais.searchBox', 'ais.autocomplete', 'ais.voiceSearch'],
            },
            refinementList: {
              connectors: ['connectRefinementList'],
              widgets: ['ais.refinementList'],
            },
            menu: {
              connectors: ['connectMenu'],
              widgets: ['ais.menu'],
            },
            hierarchicalMenu: {
              connectors: ['connectHierarchicalMenu'],
              widgets: ['ais.hierarchicalMenu'],
            },
            numericMenu: {
              connectors: ['connectNumericMenu'],
              widgets: ['ais.numericMenu'],
            },
            ratingMenu: {
              connectors: ['connectRatingMenu'],
              widgets: ['ais.ratingMenu'],
            },
            range: {
              connectors: ['connectRange'],
              widgets: ['ais.rangeInput', 'ais.rangeSlider'],
            },
            toggle: {
              connectors: ['connectToggleRefinement'],
              widgets: ['ais.toggleRefinement'],
            },
            geoSearch: {
              connectors: ['connectGeoSearch'],
              widgets: ['ais.geoSearch'],
            },
            sortBy: {
              connectors: ['connectSortBy'],
              widgets: ['ais.sortBy'],
            },
            page: {
              connectors: ['connectPagination'],
              widgets: ['ais.pagination', 'ais.infiniteHits'],
            },
            hitsPerPage: {
              connectors: ['connectHitsPerPage'],
              widgets: ['ais.hitsPerPage'],
            },
            configure: {
              connectors: ['connectConfigure'],
              widgets: ['ais.configure'],
            },
            places: {
              connectors: [],
              widgets: ['ais.places'],
            },
          };

          const mountedWidgets = this.getWidgets()
            .map(widget => widget.$$type)
            .filter(Boolean);

          type MissingWidgets = Array<[string, StateDescription]>;

          const missingWidgets = Object.keys(localUiState).reduce<
            MissingWidgets
          >((acc, parameter) => {
            const requiredWidgets: Array<Widget['$$type']> | undefined =
              stateToWidgetsMap[parameter] &&
              stateToWidgetsMap[parameter].widgets;

            if (
              requiredWidgets &&
              !requiredWidgets.some(requiredWidget =>
                mountedWidgets.includes(requiredWidget)
              )
            ) {
              acc.push([
                parameter,
                {
                  connectors: stateToWidgetsMap[parameter].connectors,
                  widgets: stateToWidgetsMap[parameter].widgets.map(
                    (widgetIdentifier: string) =>
                      widgetIdentifier.split('ais.')[1]
                  ),
                },
              ]);
            }

            return acc;
          }, []);

          warning(
            missingWidgets.length === 0,
            `The UI state for the index "${this.getIndexId()}" is not consistent with the widgets mounted.

This can happen when the UI state is specified via \`initialUiState\` or \`routing\` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.

To fully reflect the state, some widgets need to be added to the index "${this.getIndexId()}":

${missingWidgets
  .map(([stateParameter, { widgets }]) => {
    return `- \`${stateParameter}\` needs one of these widgets: ${([] as string[])
      .concat(...widgets.map(name => getWidgetNames(name!)))
      .map((name: string) => `"${name}"`)
      .join(', ')}`;
  })
  .join('\n')}

If you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don't render anything:

\`\`\`
${missingWidgets
  .filter(([_stateParameter, { connectors }]) => {
    return connectors.length > 0;
  })
  .map(([_stateParameter, { connectors, widgets }]) => {
    const capitalizedWidget = capitalize(widgets[0]!);
    const connectorName = connectors[0];

    return `const virtual${capitalizedWidget} = ${connectorName}(() => null);`;
  })
  .join('\n')}

search.addWidgets([
  ${missingWidgets
    .filter(([_stateParameter, { connectors }]) => {
      return connectors.length > 0;
    })
    .map(([_stateParameter, { widgets }]) => {
      const capitalizedWidget = capitalize(widgets[0]!);

      return `virtual${capitalizedWidget}({ /* ... */ })`;
    })
    .join(',\n  ')}
]);
\`\`\`

If you're using custom widgets that do set these query parameters, we recommend using connectors instead.

See https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#customize-the-complete-ui-of-the-widgets`
          );
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

      localWidgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            uiState,
            helper: helper!,
            parent: this,
            instantSearchInstance,
            state: helper!.state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL,
          });
        }
      });

      // Subscribe to the Helper state changes for the `uiState` once widgets
      // are initialized. Until the first render, state changes are part of the
      // configuration step. This is mainly for backward compatibility with custom
      // widgets. When the subscription happens before the `init` step, the (static)
      // configuration of the widget is pushed in the URL. That's what we want to avoid.
      // https://github.com/algolia/instantsearch.js/pull/994/commits/4a672ae3fd78809e213de0368549ef12e9dc9454
      helper.on('change', ({ state }) => {
        localUiState = getLocalWidgetsState(localWidgets, {
          searchParameters: state,
          helper: helper!,
        });

        instantSearchInstance.onStateChange();
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
