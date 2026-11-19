import {
  extractWidgetPayload,
  getAlgoliaAgent,
  safelyRunOnBrowser,
} from '../lib/utils';

import type { WidgetMetadata } from '../lib/utils/extractWidgetPayload';
import type { InternalMiddleware } from '../types';

type Payload = {
  widgets: WidgetMetadata[];
  ua?: string;
};

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
          payload.ua = getAlgoliaAgent(instantSearchInstance.client);

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
