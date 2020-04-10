import { PlainSearchParameters } from 'algoliasearch-helper';
import connectConfigure from '../../connectors/configure/connectConfigure';
import { WidgetFactory } from '../../types';
import { noop } from '../../lib/utils';

/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */
export type ConfigureWidgetOptions = PlainSearchParameters;

export type ConfigureWidget = WidgetFactory<{}, ConfigureWidgetOptions>;

const configure: ConfigureWidget = widgetParams => {
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  const makeWidget = connectConfigure(noop);

  return makeWidget({ searchParameters: widgetParams });
};

export default configure;
