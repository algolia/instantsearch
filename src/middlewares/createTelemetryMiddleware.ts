import { Middleware } from '../types';

type TelemetryWidget = {
  type: string;
  params: string[];
  officialWidget: boolean;
};

const ALGOLIA_CRAWLER_USER_AGENT = /Algolia Crawler\/[0-9]+.[0-9]+.[0-9]+/;

export function createTelemetryMiddleware(): Middleware {
  const isTelemetryEnabled =
    typeof window !== undefined &&
    ALGOLIA_CRAWLER_USER_AGENT.test(window.navigator.userAgent);

  if (!isTelemetryEnabled) {
    return () => ({
      onStateChange() {},
      subscribe() {},
      unsubscribe() {},
    });
  }

  const payload: { widgets: TelemetryWidget[] } = {
    widgets: [],
  };

  const payloadContainer = document.createElement('meta');
  const refNode = document.querySelector('head')!;
  payloadContainer.name = 'instantsearch:widgets';
  refNode.appendChild(payloadContainer);

  return ({ instantSearchInstance }) => {
    return {
      onStateChange() {},
      subscribe() {
        setTimeout(() => {
          const widgets = instantSearchInstance.mainIndex.getWidgets();

          const parent = instantSearchInstance.mainIndex;

          const initOptions = {
            instantSearchInstance,
            parent,
            // @TODO: https://github.com/algolia/instantsearch.js/pull/4609
            // scopedResults: parent.getScopedResults(),
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
            const widgetParams = widget.getWidgetRenderState
              ? (widget.getWidgetRenderState(initOptions) as any).widgetParams
              : {};

            // since we destructure in all widgets, the parameters with defaults are set to "undefined"
            const params = Object.keys(widgetParams).filter(
              key => widgetParams[key] !== undefined
            );

            payload.widgets.push({
              type: widget.$$type || 'custom.widget',
              params,
              officialWidget: Boolean(widget.$$officialWidget),
            });
          });

          payloadContainer.content = JSON.stringify(payload);
        }, 0);
      },

      unsubscribe() {
        payloadContainer.parentNode!.removeChild(payloadContainer);
      },
    };
  };
}
