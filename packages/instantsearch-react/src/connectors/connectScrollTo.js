import {PropTypes} from 'react';

import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaScrollTo',

  propTypes: {
    listenTo: PropTypes.string,
  },

  defaultProps: {
    listenTo: 'p',
  },

  getProps(props, state, search) {
    const value = state[props.listenTo];
    return {value};
  },
});
