import { PlainSearchParameters } from 'algoliasearch-helper';
import { noop } from '../../lib/utils';
import connectConfigureRelatedItems, {
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetDescription,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import { WidgetFactory } from '../../types';

export type ConfigureRelatedItemsWidget = WidgetFactory<
  ConfigureRelatedItemsWidgetDescription & {
    $$widgetType: 'ais.configureRelatedItems';
  },
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetParams
>;

export type ConfigureRelatedItemsWidgetParams = PlainSearchParameters;

const configureRelatedItems: ConfigureRelatedItemsWidget = function configureRelatedItems(
  widgetParams
) {
  const makeWidget = connectConfigureRelatedItems(noop);

  return {
    ...makeWidget(widgetParams),
    $$widgetType: 'ais.configureRelatedItems',
  };
};

export default configureRelatedItems;
