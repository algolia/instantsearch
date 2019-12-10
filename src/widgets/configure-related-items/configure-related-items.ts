import connectConfigureRelatedItems, {
  ConfigureRelatedItemsWidgetFactory,
} from '../../connectors/configure-related-items/connectConfigureRelatedItems';

type ConfigureRelatedItems = ConfigureRelatedItemsWidgetFactory<{}>;

const configureRelatedItems: ConfigureRelatedItems = widgetParams => {
  const makeWidget = connectConfigureRelatedItems();

  return makeWidget(widgetParams);
};

export default configureRelatedItems;
