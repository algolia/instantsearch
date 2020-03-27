import { noop } from '../../lib/utils';
import connectConfigureRelatedItems from '../../connectors/configure-related-items/connectConfigureRelatedItems';

const configureRelatedItems = widgetParams => {
  const makeWidget = connectConfigureRelatedItems(noop);

  return makeWidget(widgetParams);
};

export default configureRelatedItems;
