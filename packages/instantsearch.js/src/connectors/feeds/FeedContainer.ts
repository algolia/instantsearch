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
import type { SearchParameters } from 'algoliasearch-helper';

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
          parentHelper.state = withChildParams;
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

      flatWidgets.forEach((widget) => {
        if (widget.dispose && helper) {
          widget.dispose({
            helper,
            state: helper.state,
            recommendState: helper.recommendState,
            parent: container,
          });
        }
      });

      localWidgets = localWidgets.filter((w) => !flatWidgets.includes(w));
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
      const widgetUiStateOptions = {
        searchParameters: helper.state,
        helper,
      };
      return localWidgets.reduce<TUiState>(
        (state, widget) =>
          widget.getWidgetUiState
            ? (widget.getWidgetUiState(state, widgetUiStateOptions) as TUiState)
            : state,
        uiState
      );
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

    refreshUiState() {
      // no-op: FeedContainer doesn't own UI state
    },

    setIndexUiState() {
      // no-op: FeedContainer delegates to parent
    },
  };

  return container;
}
