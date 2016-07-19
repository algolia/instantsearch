import {PropTypes} from 'react';

const valuePropTypes = PropTypes.any;

export const itemsPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(
    PropTypes.shape({
      value: valuePropTypes.isRequired,
      count: PropTypes.number.isRequired,
    })
  ),
  PropTypes.arrayOf(valuePropTypes),
]);

export const selectedItemsPropType = PropTypes.arrayOf(valuePropTypes);

export const configManagerPropType = PropTypes.shape({
  register: PropTypes.func.isRequired,
  swap: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
});
