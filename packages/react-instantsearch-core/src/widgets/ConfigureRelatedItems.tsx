import connectConfigureRelatedItems from '../connectors/connectConfigureRelatedItems';
import PropTypes from 'prop-types';

function ConfigureRelatedItems() {
  return null;
}

ConfigureRelatedItems.propTypes = {
  hit: PropTypes.object.isRequired,
  matchingPatterns: PropTypes.object.isRequired,
  transformSearchParameters: PropTypes.func,
};

export default connectConfigureRelatedItems(ConfigureRelatedItems);
