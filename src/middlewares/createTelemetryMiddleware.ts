import { Widget, Middleware } from '../types';
import { resolveScopedResultsFromIndex } from '../widgets/index/index';

type TelemetryWidget = {
  type: string;
  params: string[];
  officialWidget: boolean;
};

const ALGOLIA_CRAWLER_USER_AGENT = /Algolia Crawler\/[0-9]+.[0-9]+.[0-9]+/;

export const createTelemetryMiddleware = (): Middleware => {
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
  const refNode = document.querySelector('head');
  payloadContainer.name = 'instantsearch:widgets';
  refNode!.appendChild(payloadContainer);

  return ({ instantSearchInstance }) => {
    return {
      onStateChange() {},
      subscribe() {
        setTimeout(() => {
          const widgets: Array<Widget<{
            renderState: any;
          }>> = instantSearchInstance.mainIndex.getWidgets();

          const parent = instantSearchInstance.mainIndex;

          const initOptions = {
            instantSearchInstance,
            parent,
            results: parent.getResults()!,
            scopedResults: resolveScopedResultsFromIndex(parent),
            state: parent.getResults()!._state,
            helper: parent.getHelper()!,
            // @TODO: https://github.com/algolia/instantsearch.js/pull/4603
            // createURL: parent.createURL,
            uiState: instantSearchInstance._initialUiState,
            renderState: instantSearchInstance.renderState,
            templatesConfig: instantSearchInstance.templatesConfig,
            searchMetadata: {
              isSearchStalled: instantSearchInstance._isSearchStalled,
            },
          };

          widgets.forEach(widget => {
            payload.widgets.push({
              type: widget.$$type || 'custom.widget',
              params: widget.getWidgetRenderState
                ? Object.keys(
                    widget.getWidgetRenderState(initOptions).widgetParams
                  )
                : [],
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
};
