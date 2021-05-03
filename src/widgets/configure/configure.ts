import connectConfigure, {
  ConfigureConnectorParams,
  ConfigureWidgetDescription,
} from '../../connectors/configure/connectConfigure';
import { Widget } from '../../types';
import { noop } from '../../lib/utils';

/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */
export type ConfigureWidgetParams = ConfigureConnectorParams['searchParameters'];

export type ConfigureWidget = (
  widgetParams: ConfigureWidgetParams
) => Widget<
  ConfigureWidgetDescription & {
    $$widgetType: 'ais.configure';
    widgetParams: ConfigureConnectorParams;
  }
>;

const configure: ConfigureWidget = function configure(widgetParams) {
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  const makeWidget = connectConfigure(noop);

  return {
    ...makeWidget({ searchParameters: widgetParams }),
    $$widgetType: 'ais.configure',
  };
};

export default configure;
