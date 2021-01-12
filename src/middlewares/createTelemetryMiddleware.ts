import { InstantSearch, Middleware, Widget } from '../types';
import { Index } from '../widgets/index/index';

type TelemetryWidget = {
  type: string;
  params: string[];
};

type TelemetryPayload = {
  widgets: TelemetryWidget[];
};

function extractPayload(
  widgets: Array<Widget<{ renderState: any }>>,
  instantSearchInstance: InstantSearch,
  payload: TelemetryPayload
) {
  const parent = instantSearchInstance.mainIndex;

  const initOptions = {
    instantSearchInstance,
    parent,
    scopedResults: parent.getScopedResults(),
    state: parent.getHelper()!.state,
    helper: parent.getHelper()!,
    createURL: parent.createURL,
    uiState: instantSearchInstance._initialUiState,
    renderState: instantSearchInstance.renderState,
    templatesConfig: instantSearchInstance.templatesConfig,
    searchMetadata: {
      isSearchStalled: instantSearchInstance._isSearchStalled,
    },
  };

  widgets.forEach(widget => {
    let widgetParams = {};

    if (widget.getWidgetRenderState) {
      const renderState = widget.getWidgetRenderState(initOptions);

      if (renderState && renderState.widgetParams) {
        widgetParams = renderState.widgetParams;
      }
    }

    // since we destructure in all widgets, the parameters with defaults are set to "undefined"
    const params = Object.keys(widgetParams).filter(
      key => widgetParams[key] !== undefined
    );

    payload.widgets.push({
      type: widget.$$type || 'custom.widget',
      params,
    });

    if (widget.$$type === 'ais.index') {
      extractPayload(
        (widget as Index).getWidgets(),
        instantSearchInstance,
        payload
      );
    }
  });
}

export function isTelemetryEnabled() {
  return (
    typeof window !== 'undefined' &&
    window.navigator.userAgent.indexOf('Algolia Crawler') > -1
  );
}

export function createTelemetryMiddleware(): Middleware {
  const payload: TelemetryPayload = {
    widgets: [],
  };

  const payloadContainer = document.createElement('meta');
  const refNode = document.querySelector('head')!;
  payloadContainer.name = 'instantsearch:widgets';

  return ({ instantSearchInstance }) => {
    return {
      onStateChange() {},
      subscribe() {
        // using setTimeout here to delay extraction until widgets have been added in a tick (e.g. Vue)
        setTimeout(() => {
          extractPayload(
            instantSearchInstance.mainIndex.getWidgets(),
            instantSearchInstance,
            payload
          );

          payloadContainer.content = JSON.stringify(payload);
          refNode.appendChild(payloadContainer);
        }, 0);
      },

      unsubscribe() {
        payloadContainer.parentNode?.removeChild(payloadContainer);
      },
    };
  };
}
