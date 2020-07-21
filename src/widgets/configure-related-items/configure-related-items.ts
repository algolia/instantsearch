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
  widgetParams
) {
  const makeWidget = connectConfigureRelatedItems(noop);

  return {
    ...makeWidget(widgetParams),
    $$parms: widgetParams,
  };
};

export default configureRelatedItems;
