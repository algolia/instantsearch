import connectConfigureRelatedItems, {
  ConfigureRelatedItemsConnectorParams,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';
import { WidgetFactory } from '../../types';

type ConfigureRelatedItems = WidgetFactory<
  ConfigureRelatedItemsConnectorParams
>;

const configureRelatedItems: ConfigureRelatedItems = widgetParams => {
  const makeWidget = connectConfigureRelatedItems();

  return makeWidget(widgetParams);
};

export default configureRelatedItems;
