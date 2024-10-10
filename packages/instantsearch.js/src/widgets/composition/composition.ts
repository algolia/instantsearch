import algoliasearchHelper from 'algoliasearch-helper';

import type {
  InitOptions,
  RenderOptions,
  UiState,
  IndexUiState,
  Widget,
} from '../../types';
import type {
  SearchParameters,
  AlgoliaSearchHelper as Helper,
} from 'algoliasearch-helper';

export default function composition(props: { compositionId: string }) {
  const localWidgets: Widget[] = [];
  const helper = algoliasearchHelper({} as any, props.compositionId);
  helper.search = () => helper;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let localUiState = {};

  return {
    $$type: 'ais.composition',
    $$widgetType: 'ais.composition',
    dependsOn: 'composition',
    getHelper() {
      return helper;
    },
    getCompositionId() {
      return props.compositionId;
    },
    addWidgets(widgets: Widget[]) {
      if (!Array.isArray(widgets)) {
        throw new Error('The `addWidgets` method expects an array of widgets.');
      }
      if (widgets.some((widget) => widget.$$type === 'ais.index')) {
        throw new Error(
          "You can't nest an index widget inside a composition widget."
        );
      }

      if (widgets.some((widget) => widget.$$type === 'ais.hitsPerPage')) {
        throw new Error(
          "You can't nest a hitsPerPage widget inside a composition widget."
        );
      }

      localWidgets.push(...widgets);

      return this;
    },
    getWidgetParameters(
      initialSearchParameters: SearchParameters,
      options: { uiState: IndexUiState }
    ) {
      return localWidgets.reduce((state, widget) => {
        if (
          !widget.getWidgetSearchParameters ||
          widget.$$type === 'ais.index'
        ) {
          return state;
        }

        if (widget.dependsOn === 'search' && widget.getWidgetParameters) {
          return widget.getWidgetParameters(state, options);
        }

        return widget.getWidgetSearchParameters(state, options);
      }, initialSearchParameters);
    },
    getWidgetUiState(
      uiState: UiState,
      options: { searchParameters: SearchParameters; helper: Helper }
    ) {
      return localWidgets.reduce<IndexUiState>((state, widget) => {
        if (!widget.getWidgetUiState) {
          return state;
        }

        return widget.getWidgetUiState(state, options);
      }, uiState);
    },
    init(params: InitOptions) {
      params.helper = helper;
      localUiState = params.uiState[props.compositionId] || {};

      helper.search = () => {
        params.instantSearchInstance.scheduleSearch();
        return helper;
      };
      helper.on('change', (event) => {
        const { state } = event;

        const _uiState = (event as any)._uiState;

        localUiState = getLocalWidgetsUiState(
          localWidgets,
          {
            searchParameters: state,
            helper,
          },
          _uiState || {}
        );

        // We don't trigger an internal change when controlled because it
        // becomes the responsibility of `setUiState`.
        if (!params.instantSearchInstance.onStateChange) {
          params.instantSearchInstance.onInternalStateChange();
        }
      });

      localWidgets.forEach((widget) => {
        widget.init?.(params);
      });
    },
    render(params: RenderOptions) {
      params.helper = helper;
      localWidgets.forEach((widget) => {
        widget.render?.(params);
      });
    },
  };
}

function getLocalWidgetsUiState(
  widgets: Widget[],
  options: {
    searchParameters: SearchParameters;
    helper: Helper;
  },
  initialUiState: IndexUiState
) {
  return widgets.reduce<IndexUiState>((uiState, widget) => {
    if (!widget.getWidgetUiState || widget.$$type === 'ais.index') {
      return uiState;
    }

    if (widget.dependsOn === 'search' && widget.getWidgetUiState) {
      return widget.getWidgetUiState(uiState, options);
    }

    return uiState;
  }, initialUiState);
}
