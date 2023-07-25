import PropTypes from 'prop-types';

import connectConfigureRelatedItems from '../connectors/connectConfigureRelatedItems';

function ConfigureRelatedItems() {
  return null;
}

ConfigureRelatedItems.propTypes = {
  hit: PropTypes.object.isRequired,
  matchingPatterns: PropTypes.object.isRequired,
  transformSearchParameters: PropTypes.func,
};

export default connectConfigureRelatedItems(ConfigureRelatedItems, {
  $$widgetType: 'ais.configureRelatedItems',
});
