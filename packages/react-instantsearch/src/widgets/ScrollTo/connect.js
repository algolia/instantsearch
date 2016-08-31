import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaScrollTo',

  propTypes: {
    /**
     * Widget state key on which to listen for changes.
     * @public
     */
    scrollOn: PropTypes.string,
  },

  defaultProps: {
    scrollOn: 'p',
  },

  getProps(props, state) {
    const value = state[props.scrollOn];
    return {value};
  },
});
