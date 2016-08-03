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

export const withKeysPropType = keys => (props, propName, componentName) => {
  const prop = props[propName];
  if (prop) {
    for (const key of Object.keys(prop)) {
      if (!keys.indexOf(key)) {
        return new Error(
          `Unknown \`${propName}\` key \`${key}\`. Check the render method ` +
          `of \`${componentName}\`.`
        );
      }
    }
  }
  return undefined;
};
