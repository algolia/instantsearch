import { InstantSearch, Middleware, Widget } from '../types';
import { Index } from '../widgets/index/index';

type WidgetMetaData = {
  type: string | undefined;
  widgetType: string | undefined;
  params: string[];
};

type Payload = {
  widgets: WidgetMetaData[];
};

function extractPayload(
  widgets: Array<Widget<{ renderState: any }>>,
  instantSearchInstance: InstantSearch,
  payload: Payload
) {
  const parent = instantSearchInstance.mainIndex;

  const initOptions = {
    instantSearchInstance,
    parent,
    scopedResults: [],
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
      type: widget.$$type,
      widgetType: widget.$$widgetType,
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

export function isMetadataEnabled() {
  return (
    typeof window !== 'undefined' &&
    window.navigator.userAgent.indexOf('Algolia Crawler') > -1
  );
}

/**
 * Exposes the metadata of mounted widgets in a custom
 * `<meta name="instantsearch:widgets" />` tag. The metadata per widget is:
 * - applied parameters
 * - widget name
 * - connector name
 */
export function createMetadataMiddleware(): Middleware {
  return ({ instantSearchInstance }) => {
    const payload: Payload = {
      widgets: [],
    };
    const payloadContainer = document.createElement('meta');
    const refNode = document.querySelector('head')!;
    payloadContainer.name = 'instantsearch:widgets';

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
        payloadContainer.remove();
      },
    };
  };
}
