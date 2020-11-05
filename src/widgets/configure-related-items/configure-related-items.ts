import { PlainSearchParameters } from 'algoliasearch-helper';
import { noop } from '../../lib/utils';
import connectConfigureRelatedItems, {
  ConfigureRelatedItemsConnectorParams,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import { ConfigureRendererOptions } from '../../connectors/configure/connectConfigure';
import { WidgetFactory } from '../../types';

export type ConfigureRelatedItemsWidget = WidgetFactory<
  ConfigureRendererOptions,
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
    $$officialWidget: true,
  };
};

export default configureRelatedItems;
