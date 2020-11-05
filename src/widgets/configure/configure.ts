import { PlainSearchParameters } from 'algoliasearch-helper';
import connectConfigure, {
  ConfigureRendererOptions,
  ConfigureConnectorParams,
} from '../../connectors/configure/connectConfigure';
import { Widget, WidgetRenderState } from '../../types';
import { noop } from '../../lib/utils';

/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */
export type ConfigureWidgetParams = PlainSearchParameters;

export type ConfigureWidget = (
  widgetParams: ConfigureConnectorParams['searchParameters']
) => Widget<{
  renderState: WidgetRenderState<
    ConfigureRendererOptions,
    ConfigureWidgetParams
  >;
}>;

const configure: ConfigureWidget = function configure(widgetParams) {
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  const makeWidget = connectConfigure(noop);

  return {
    ...makeWidget({ searchParameters: widgetParams }),
    $$officialWidget: true,
  };
};

export default configure;
