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
});

export const stateManagerPropType = PropTypes.shape({
  createURL: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
  unlisten: PropTypes.func.isRequired,
});
