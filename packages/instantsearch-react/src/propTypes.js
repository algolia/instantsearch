import {PropTypes} from 'react';

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
