import connectConfigureRelatedItems from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import { noop } from '../../lib/utils';

import type {
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetDescription,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import type { WidgetFactory } from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

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
