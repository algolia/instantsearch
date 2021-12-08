import type { PlainSearchParameters } from 'algoliasearch-helper';
import { noop } from '../../lib/utils/index.js';
import type {
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetDescription,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems.js';
import connectConfigureRelatedItems from '../../connectors/configure-related-items/connectConfigureRelatedItems.js';
import type { WidgetFactory } from '../../types/index.js';

export type ConfigureRelatedItemsWidget = WidgetFactory<
  ConfigureRelatedItemsWidgetDescription & {
    $$widgetType: 'ais.configureRelatedItems';
  },
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetParams
>;

export type ConfigureRelatedItemsWidgetParams = PlainSearchParameters;

const configureRelatedItems: ConfigureRelatedItemsWidget =
  function configureRelatedItems(widgetParams) {
    const makeWidget = connectConfigureRelatedItems(noop);

    return {
      ...makeWidget(widgetParams),
      $$widgetType: 'ais.configureRelatedItems',
    };
  };

export default configureRelatedItems;
