import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'powered-by',
  connector: true,
});

/**
 * @typedef {Object} PoweredByWidgetOptions
 * @property {string} [theme] The theme of the logo ("light" or "dark").
 * @property {string} [url] The URL to redirect to.
 */

/**
 * @typedef {Object} PoweredByRenderingOptions
 * @property {Object} widgetParams All original `PoweredByWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **PoweredBy** connector provides the logic to build a custom widget that will displays
 * the logo to redirect to Algolia.
 *
 * @type {Connector}
 * @param {function(PoweredByRenderingOptions, boolean)} renderFn Rendering function for the custom **PoweredBy** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function} Re-usable widget factory for a custom **PoweredBy** widget.
 */
export default function connectPoweredBy(renderFn, unmountFn = noop) {
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

  return (widgetParams = {}) => {
    const { url = defaultUrl } = widgetParams;

    return {
      $$type: 'ais.poweredBy',

      init() {
        renderFn(
          {
            url,
            widgetParams,
          },
          true
        );
      },

      render() {
        renderFn(
          {
            url,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
}
