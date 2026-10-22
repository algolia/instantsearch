import algoliasearchHelper from 'algoliasearch-helper';

import {
  createInitArgs,
  createRenderArgs,
  storeRenderState,
} from '../../lib/utils';

import type {
  InstantSearch,
  UiState,
  IndexUiState,
  Widget,
  IndexWidget,
  DisposeOptions,
  RenderOptions,
} from '../../types';
import type {
  AlgoliaSearchHelper,
  SearchParameters,
} from 'algoliasearch-helper';

function reduceChildrenUiState(
  widgets: Array<Widget | IndexWidget>,
  uiState: IndexUiState,
  widgetUiStateOptions: {
    searchParameters: SearchParameters;
    helper: AlgoliaSearchHelper;
  }
): IndexUiState {
  return widgets.reduce<IndexUiState>(
    (state, widget) =>
      widget.getWidgetUiState
        ? widget.getWidgetUiState(state, widgetUiStateOptions)
        : state,
    uiState
  );
}

export function createFeedContainer(
  feedID: string,
  parentIndex: IndexWidget,
  instantSearchInstance: InstantSearch
): IndexWidget {
  let localWidgets: Array<Widget | IndexWidget> = [];
  let initialized = false;

  const container: IndexWidget = {
    $$type: 'ais.feedContainer',
    $$widgetType: 'ais.feedContainer',
    _isolated: true,

    getIndexName: () => parentIndex.getIndexName(),
    getIndexId: () => feedID,
    getHelper: () => parentIndex.getHelper(),

    getResults() {
      const parentResults = parentIndex.getResults();
      if (!parentResults) return null;
      if (!parentResults.feeds) {
        // Single-feed backward compat: no feeds array means the parent result
        // itself is the only feed.
        if (feedID === '') {
          parentResults._state = parentIndex.getHelper()!.state;
          return parentResults;
        }
        return null;
      }
      const feed = parentResults.feeds.find((f) => f.feedID === feedID);
      if (!feed) return null;
      // Optimistic state patching — same as index widget (index.ts:365-370)
      feed._state = parentIndex.getHelper()!.state;
      return feed;
    },

    getResultsForWidget() {
      return this.getResults();
    },

    getParent: () => parentIndex,
    getWidgets: () => localWidgets,
    getScopedResults: () => parentIndex.getScopedResults(),
    getPreviousState: () => null,
    createURL: (
      nextState: SearchParameters | ((state: IndexUiState) => IndexUiState)
    ) => parentIndex.createURL(nextState),
    scheduleLocalSearch: () => parentIndex.scheduleLocalSearch(),

    addWidgets(widgets) {
      const flatWidgets = widgets.reduce<Array<Widget | IndexWidget>>(
        (acc, w) => acc.concat(Array.isArray(w) ? w : [w]),
        []
      );
      flatWidgets.forEach((widget) => {
        widget.parent = container;
      });
      localWidgets = localWidgets.concat(flatWidgets);

      if (initialized) {
        flatWidgets.forEach((widget) => {
          if (widget.getRenderState) {
            const renderState = widget.getRenderState(
              instantSearchInstance.renderState[container.getIndexId()] || {},
              createInitArgs(
                instantSearchInstance,
                container,
                instantSearchInstance._initialUiState
              )
            );
            storeRenderState({
              renderState,
              instantSearchInstance,
              parent: container,
            });
          }
        });

        flatWidgets.forEach((widget) => {
          if (widget.init) {
            widget.init(
              createInitArgs(
                instantSearchInstance,
                container,
                instantSearchInstance._initialUiState
              )
            );
          }
        });

        // Merge children's search params (e.g. disjunctiveFacets) into the
        // parent's helper state so they're included in the composition request.
        // uiState is {} because URL-derived refinements are already on the
        // parent state; children only need to declare structural params.
        const parentHelper = parentIndex.getHelper()!;
        const withChildParams = container.getWidgetSearchParameters(
          parentHelper.state,
          { uiState: {} }
        );
        if (withChildParams !== parentHelper.state) {
          parentHelper.setState(withChildParams);
        }
      }

      return container;
    },

    removeWidgets(widgets) {
      const flatWidgets = widgets.reduce<Array<Widget | IndexWidget>>(
        (acc, w) => acc.concat(Array.isArray(w) ? w : [w]),
        []
      );
      const helper = parentIndex.getHelper();

      if (!helper) {
        localWidgets = localWidgets.filter((w) => !flatWidgets.includes(w));
        return container;
      }

      // Chain through children's dispose so widgets clean up the
      // SearchParameters they declared (e.g. RefinementList removes its
      // disjunctiveFacet) instead of leaving them stale on the parent helper.
      let cleanedState: SearchParameters = helper.state;

      flatWidgets.forEach((widget) => {
        if (widget.dispose) {
          const next = widget.dispose({
            helper,
            state: cleanedState,
            recommendState: helper.recommendState,
            parent: container,
          });

          if (next instanceof algoliasearchHelper.RecommendParameters) {
            // ignore — FeedContainer doesn't manage recommend state
          } else if (next) {
            cleanedState = next;
          }
        }
      });

      localWidgets = localWidgets.filter((w) => !flatWidgets.includes(w));

      if (cleanedState !== helper.state) {
        helper.setState(cleanedState);
      }

      return container;
    },

    init() {
      initialized = true;

      localWidgets.forEach((widget) => {
        if (widget.getRenderState) {
          const renderState = widget.getRenderState(
            instantSearchInstance.renderState[container.getIndexId()] || {},
            createInitArgs(
              instantSearchInstance,
              container,
              instantSearchInstance._initialUiState
            )
          );
          storeRenderState({
            renderState,
            instantSearchInstance,
            parent: container,
          });
        }
      });

      localWidgets.forEach((widget) => {
        if (widget.init) {
          widget.init(
            createInitArgs(
              instantSearchInstance,
              container,
              instantSearchInstance._initialUiState
            )
          );
        }
      });
    },

    render() {
      localWidgets.forEach((widget) => {
        if (widget.getRenderState) {
          const renderState = widget.getRenderState(
            instantSearchInstance.renderState[container.getIndexId()] || {},
            createRenderArgs(
              instantSearchInstance,
              container,
              widget
            ) as RenderOptions
          );
          storeRenderState({
            renderState,
            instantSearchInstance,
            parent: container,
          });
        }
      });

      localWidgets.forEach((widget) => {
        if (widget.render) {
          widget.render(
            createRenderArgs(
              instantSearchInstance,
              container,
              widget
            ) as RenderOptions
          );
        }
      });
    },

    dispose(disposeOptions?: DisposeOptions) {
      const helper = parentIndex.getHelper();

      // Chain through children's dispose to return a cleaned state
      // (e.g. RefinementList.dispose removes its disjunctiveFacet declaration).
      // This mirrors how the index widget's removeWidgets chains dispose calls.
      let cleanedState = disposeOptions?.state ?? helper?.state;

      localWidgets.forEach((widget) => {
        if (widget.dispose && helper) {
          const next = widget.dispose({
            helper,
            state: cleanedState!,
            recommendState: helper.recommendState,
            parent: container,
          });

          if (next instanceof algoliasearchHelper.RecommendParameters) {
            // ignore — FeedContainer doesn't manage recommend state
          } else if (next) {
            cleanedState = next;
          }
        }
      });

      localWidgets = [];
      initialized = false;
      return cleanedState;
    },

    getWidgetState(uiState: UiState) {
      return this.getWidgetUiState(uiState);
    },

    getWidgetUiState<TUiState extends UiState = UiState>(
      uiState: TUiState
    ): TUiState {
      const helper = parentIndex.getHelper()!;
      return reduceChildrenUiState(localWidgets, uiState, {
        searchParameters: helper.state,
        helper,
      }) as TUiState;
    },

    getWidgetSearchParameters(
      searchParameters: SearchParameters,
      { uiState }: { uiState: IndexUiState }
    ) {
      return localWidgets.reduce(
        (params, widget) =>
          widget.getWidgetSearchParameters
            ? widget.getWidgetSearchParameters(params, { uiState })
            : params,
        searchParameters
      );
    },

    updateWidget(previousWidget, nextWidget) {
      const helper = parentIndex.getHelper();

      // The `uiState` the children own, read before the previous widget is
      // detached, so that the state it owns can be handed over to the next one.
      const previousUiState = helper
        ? reduceChildrenUiState(
            localWidgets,
            {},
            { searchParameters: helper.state, helper }
          )
        : {};

      previousWidget.parent = undefined;
      nextWidget.parent = container;

      // The next widget takes the place of the previous one, so that the order
      // in which children contribute to the search parameters is unchanged.
      const nextWidgets = localWidgets.slice();
      const position = nextWidgets.indexOf(previousWidget);
      if (position === -1) {
        nextWidgets.push(nextWidget);
      } else {
        nextWidgets[position] = nextWidget;
      }
      localWidgets = nextWidgets;

      if (!helper || !initialized) {
        return container;
      }

      // We still dispose the previous widget, for its side effects and so that
      // it drops the search parameters it declared on the parent helper.
      let cleanedState = helper.state;
      if (previousWidget.dispose) {
        const next = previousWidget.dispose({
          helper,
          state: cleanedState,
          recommendState: helper.recommendState,
          parent: container,
        });

        if (
          next &&
          !(next instanceof algoliasearchHelper.RecommendParameters)
        ) {
          cleanedState = next;
        }
      }

      // We hand the previous `uiState` over to the children, then read the
      // `uiState` back from them, so that state no mounted child claims anymore
      // is dropped. This mirrors the index widget's `updateWidget`.
      const narrowedUiState = reduceChildrenUiState(
        localWidgets,
        {},
        {
          searchParameters: container.getWidgetSearchParameters(cleanedState, {
            uiState: previousUiState,
          }),
          helper,
        }
      );

      // The search parameters are then computed again from that narrowed
      // `uiState`, so that they can't hold state the `uiState` doesn't describe.
      const newState = container.getWidgetSearchParameters(cleanedState, {
        uiState: narrowedUiState,
      });

      if (nextWidget.getRenderState) {
        const renderState = nextWidget.getRenderState(
          instantSearchInstance.renderState[container.getIndexId()] || {},
          createInitArgs(
            instantSearchInstance,
            container,
            instantSearchInstance._initialUiState
          )
        );
        storeRenderState({
          renderState,
          instantSearchInstance,
          parent: container,
        });
      }

      if (nextWidget.init) {
        nextWidget.init(
          createInitArgs(
            instantSearchInstance,
            container,
            instantSearchInstance._initialUiState
          )
        );
      }

      if (newState !== helper.state) {
        helper.setState(newState);
      }

      return container;
    },

    refreshUiState() {
      // no-op: FeedContainer doesn't own UI state
    },

    setIndexUiState() {
      // no-op: FeedContainer delegates to parent
    },
  };

  return container;
}
