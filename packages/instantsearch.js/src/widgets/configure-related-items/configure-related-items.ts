import { noop } from 'instantsearch-core';

import connectConfigureRelatedItems from '../../connectors/configure-related-items/connectConfigureRelatedItems';

import type {
  ConfigureRelatedItemsConnectorParams,
  ConfigureRelatedItemsWidgetDescription,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type { WidgetFactory } from 'instantsearch-core';

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

/** @deprecated use relatedItems instead */
export default configureRelatedItems;
