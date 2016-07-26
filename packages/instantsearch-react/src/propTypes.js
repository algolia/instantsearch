import {PropTypes} from 'react';

const valuePropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
]);

const metadataItemPropType = PropTypes.shape({
  value: valuePropTypes.isRequired,
  count: PropTypes.number.isRequired,
});

export const hierarchicalItemPropType = (...args) => PropTypes.shape({
  label: PropTypes.node,
  value: valuePropTypes.isRequired,
  count: PropTypes.number.isRequired,
  children: PropTypes.arrayOf(hierarchicalItemPropType),
})(...args);

const valueItemPropType = valuePropTypes;

export const itemPropType = PropTypes.oneOfType([
  metadataItemPropType,
  valueItemPropType,
]);

export const itemsPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(metadataItemPropType),
  PropTypes.arrayOf(valueItemPropType),
]);

export const hierarchicalItemsPropType =
  PropTypes.arrayOf(hierarchicalItemPropType);

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
