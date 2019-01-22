import { checkRendering } from '../../lib/utils';
import { Theme } from '../../widgets/powered-by/powered-by';
import { Widget } from '../../types';

type ConnectPoweredByWidgetOptions = {
  url?: string;
  theme?: Theme;
};

export type PoweredByWidgetRenderParams = {
  theme?: Theme;
};

export type PoweredByRenderOptions = {
  widgetParams: PoweredByWidgetRenderParams;
  url: string;
};

type ConnectPoweredBy = (
  renderFn: (
    renderOptions: PoweredByRenderOptions,
    isFirstRender: boolean
  ) => void,
  unmountFn: () => void
) => (widgetParams: ConnectPoweredByWidgetOptions) => Widget;

const usage = `Usage:
var customPoweredBy = connectPoweredBy(function render(params, isFirstRendering) {
  // params = {
  //   url,
  //   widgetParams,
  // }
});
search.addWidget(customPoweredBy({
  [ url ],
}));
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectPoweredBy.html`;

const connectPoweredBy: ConnectPoweredBy = (renderFn, unmountFn) => {
  checkRendering(renderFn, usage);

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
};

export default connectPoweredBy;
