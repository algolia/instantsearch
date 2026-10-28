import { noop } from 'instantsearch-core';

import { connectConfigure } from '../../connectors';

import type {
  ConfigureConnectorParams,
  ConfigureWidgetDescription,
} from '../../connectors';
import type { Widget } from 'instantsearch-core';

/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */
export type ConfigureWidgetParams =
  ConfigureConnectorParams['searchParameters'];

export type ConfigureWidget = (widgetParams: ConfigureWidgetParams) => Widget<
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
