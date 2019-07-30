import { PlainSearchParameters } from 'algoliasearch-helper';
import connectConfigure from '../../connectors/configure/connectConfigure';
import { WidgetFactory } from '../../types';

/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */
type ConfigureWidgetParams = PlainSearchParameters;

type Configure = WidgetFactory<ConfigureWidgetParams>;

const configure: Configure = (widgetParams: ConfigureWidgetParams) => {
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  const makeWidget = connectConfigure();

  return makeWidget({ searchParameters: widgetParams });
};

export default configure;
