import {PropTypes} from 'react';

const valuePropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
]);

const metadataItemPropType = PropTypes.shape({
  value: valuePropTypes.isRequired,
  count: PropTypes.number.isRequired,
});

const valueItemPropType = valuePropTypes;

export const itemPropType = PropTypes.oneOfType([
  metadataItemPropType,
  valueItemPropType,
]);

export const itemsPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(metadataItemPropType),
  PropTypes.arrayOf(valueItemPropType),
]);

export const selectedItemsPropType = PropTypes.arrayOf(valuePropTypes);

export const configManagerPropType = PropTypes.shape({
  register: PropTypes.func.isRequired,
  swap: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
});
