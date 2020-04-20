import { noop } from '../../lib/utils';
import connectConfigureRelatedItems, {
  ConfigureRelatedItemsConnectorParams,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import { WidgetFactory } from '../../types';

export type ConfigureRelatedItemsWidget = WidgetFactory<
  ConfigureRelatedItemsConnectorParams,
  {}
>;

const configureRelatedItems: ConfigureRelatedItemsWidget = function configureRelatedItems(
  widgetOptions
) {
  const makeWidget = connectConfigureRelatedItems(noop);

  return makeWidget(widgetOptions);
};

export default configureRelatedItems;
