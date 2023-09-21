import { createInitArgs, safelyRunOnBrowser } from '../lib/utils';

import type { InstantSearch, InternalMiddleware, Widget } from '../types';
import type { IndexWidget } from '../widgets/index/index';

type WidgetMetadata =
  | {
      type: string | undefined;
      widgetType: string | undefined;
      params: string[];
    }
  | {
      type: string;
      middleware: true;
      internal: boolean;
    };

type Payload = {
  widgets: WidgetMetadata[];
  ua?: string;
};

function extractWidgetPayload(
  widgets: Array<Widget | IndexWidget>,
  instantSearchInstance: InstantSearch,
  payload: Payload
) {
  const initOptions = createInitArgs(
    instantSearchInstance,
    instantSearchInstance.mainIndex,
    instantSearchInstance._initialUiState
  );

  widgets.forEach((widget) => {
    let widgetParams: Record<string, unknown> = {};

    if (widget.getWidgetRenderState) {
      const renderState = widget.getWidgetRenderState(initOptions);

      if (renderState && renderState.widgetParams) {
        // casting, as we just earlier checked widgetParams exists, and thus an object
        widgetParams = renderState.widgetParams as Record<string, unknown>;
      }
    }

    // since we destructure in all widgets, the parameters with defaults are set to "undefined"
    const params = Object.keys(widgetParams).filter(
      (key) => widgetParams[key] !== undefined
    );

    payload.widgets.push({
      type: widget.$$type,
      widgetType: widget.$$widgetType,
      params,
    });

    if (widget.$$type === 'ais.index') {
      extractWidgetPayload(
        (widget as IndexWidget).getWidgets(),
        instantSearchInstance,
        payload
      );
    }
  });
}

export function isMetadataEnabled() {
  return safelyRunOnBrowser(
    ({ window }) =>
      window.navigator?.userAgent?.indexOf('Algolia Crawler') > -1,
    { fallback: () => false }
  );
}

/**
 * Exposes the metadata of mounted widgets in a custom
 * `<meta name="instantsearch:widgets" />` tag. The metadata per widget is:
 * - applied parameters
 * - widget name
 * - connector name
 */
export function createMetadataMiddleware({
  $$internal = false,
}: {
  $$internal?: boolean;
} = {}): InternalMiddleware {
  return ({ instantSearchInstance }) => {
    const payload: Payload = {
      widgets: [],
    };
    const payloadContainer = document.createElement('meta');
    const refNode = document.querySelector('head')!;
    payloadContainer.name = 'instantsearch:widgets';

    return {
      $$type: 'ais.metadata',
      $$internal,
      onStateChange() {},
      subscribe() {
        // using setTimeout here to delay extraction until widgets have been added in a tick (e.g. Vue)
        setTimeout(() => {
          const client = instantSearchInstance.client as any;
          payload.ua =
            client.transporter && client.transporter.userAgent
              ? client.transporter.userAgent.value
              : client._ua;

          extractWidgetPayload(
            instantSearchInstance.mainIndex.getWidgets(),
            instantSearchInstance,
            payload
          );

          instantSearchInstance.middleware.forEach((middleware) =>
            payload.widgets.push({
              middleware: true,
              type: middleware.instance.$$type,
              internal: middleware.instance.$$internal,
            })
          );

          payloadContainer.content = JSON.stringify(payload);
          refNode.appendChild(payloadContainer);
        }, 0);
      },

      started() {},

      unsubscribe() {
        payloadContainer.remove();
      },
    };
  };
}
