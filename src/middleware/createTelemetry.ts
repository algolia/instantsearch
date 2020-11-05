import { Middleware } from '.';

type TelemetryWidget = {
  type: string;
  params: string[];
  useConnector: boolean;
};

export const createTelemetry = (): Middleware => {
  let localInstantSearchInstance;

  const payload: { widgets: TelemetryWidget[] } = {
    widgets: [],
  };

  const payloadContainer = document.createElement('meta');
  const refNode = document.querySelector('script');
  payloadContainer.name = 'instantsearch:widgets';
  refNode!.parentNode!.insertBefore(payloadContainer, refNode);

  return ({ instantSearchInstance }) => {
    localInstantSearchInstance = instantSearchInstance;

    return {
      onStateChange() {},
      subscribe() {
        setTimeout(() => {
          const widgets = localInstantSearchInstance.mainIndex.getWidgets();

          const initOptions = {
            helper: localInstantSearchInstance.helper,
            uiState: localInstantSearchInstance._initialUiState,
            localInstantSearchInstance: localInstantSearchInstance!,
            state: localInstantSearchInstance.helper.state,
            renderState: localInstantSearchInstance.renderState,
            templatesConfig: localInstantSearchInstance.templatesConfig,
            createURL: localInstantSearchInstance._createURL,
            scopedResults: [],
            searchMetadata: {
              isSearchStalled: localInstantSearchInstance._isSearchStalled,
            },
          };

          widgets.forEach(widget => {
            // Compute widget data
            const type: TelemetryWidget['type'] =
              widget.$$type || 'custom widget';
            const params: TelemetryWidget['params'] = widget.getWidgetRenderState
              ? Object.keys(
                  widget.getWidgetRenderState(initOptions).widgetParams as any
                )
              : [];
            const useConnector: TelemetryWidget['useConnector'] = !widget.$$officialWidget;
            // Finds out if the widget is already in the payload and merge them if that's the case
            const existingWidget = payload.widgets.find(
              payloadWidget => payloadWidget.type === type
            );
            if (existingWidget) {
              existingWidget.params = [
                ...new Set([...existingWidget.params, ...params]),
              ];
              existingWidget.useConnector =
                existingWidget.useConnector || useConnector;
            } else {
              payload.widgets.push({ type, params, useConnector });
            }
          });
          // Update the DOM element
          payloadContainer.content = JSON.stringify(payload);
        }, 0);
      },

      unsubscribe() {
        payloadContainer.parentNode!.removeChild(payloadContainer);
      },
    };
  };
};
