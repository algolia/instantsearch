import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * connectScrollTo connector provides the logic to build a widget that will
 * let the page scroll to a certain point.
 * @name connectScrollTo
 * @kind connector
 * @propType {string} [scrollOn="page"] - Widget state key on which to listen for changes, default to the pagination widget.
 * @providedPropType {any} value - the current refinement applied to the widget listened by scrollTo
 */
export default createConnector({
  displayName: 'AlgoliaScrollTo',

  propTypes: {
    scrollOn: PropTypes.string,
  },

  defaultProps: {
    scrollOn: 'page',
  },

  getProvidedProps(props, state) {
    const value = state[props.scrollOn];
    return {value};
  },
});
