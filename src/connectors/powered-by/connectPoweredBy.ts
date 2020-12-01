import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'powered-by',
  connector: true,
});

export type PoweredByRendererOptions = {
  /** the url to redirect to on click */
  url: string;
};

export type PoweredByConnectorParams = {
  /** the url to redirect to on click */
  url?: string;
};

export type PoweredByConnector = Connector<
  PoweredByRendererOptions,
  PoweredByConnectorParams
>;

/**
 * **PoweredBy** connector provides the logic to build a custom widget that will displays
 * the logo to redirect to Algolia.
 */
const connectPoweredBy: PoweredByConnector = function connectPoweredBy(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  const defaultUrl =
    'https://www.algolia.com/?' +
    'utm_source=instantsearch.js&' +
    'utm_medium=website&' +
    `utm_content=${
      typeof window !== 'undefined' && window.location
        ? window.location.hostname
        : ''
    }&` +
    'utm_campaign=poweredby';

  return widgetParams => {
    const { url = defaultUrl } = widgetParams || ({} as typeof widgetParams);

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

export default connectPoweredBy;
