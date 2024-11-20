import {
  safelyRunOnBrowser,
  createDocumentationMessageGenerator,
  noop,
} from '../lib/public';
import { checkRendering } from '../lib/utils';

import type { Connector, WidgetRenderState } from '../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'powered-by',
  connector: true,
});

export type PoweredByRenderState = {
  /** the url to redirect to on click */
  url: string;
};

export type PoweredByConnectorParams = {
  /** the url to redirect to on click */
  url?: string;
};

export type PoweredByWidgetDescription = {
  $$type: 'ais.poweredBy';
  renderState: PoweredByRenderState;
  indexRenderState: {
    poweredBy: WidgetRenderState<
      PoweredByRenderState,
      PoweredByConnectorParams
    >;
  };
};

export type PoweredByConnector = Connector<
  PoweredByWidgetDescription,
  PoweredByConnectorParams
>;

/**
 * **PoweredBy** connector provides the logic to build a custom widget that will displays
 * the logo to redirect to Algolia.
 */
export const connectPoweredBy: PoweredByConnector = function connectPoweredBy(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  const defaultUrl =
    'https://www.algolia.com/?' +
    'utm_source=instantsearch.js&' +
    'utm_medium=website&' +
    `utm_content=${safelyRunOnBrowser<string>(
      ({ window }) => window.location?.hostname || '',
      { fallback: () => '' }
    )}&` +
    'utm_campaign=poweredby';

  return (widgetParams) => {
    const { url = defaultUrl } = widgetParams || {};

    return {
      $$type: 'ais.poweredBy',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          poweredBy: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState() {
        return {
          url,
          widgetParams,
        };
      },

      dispose() {
        unmountFn();
      },
    };
  };
};
