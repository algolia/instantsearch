import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaEmptyQuery',

  propTypes: {
    queryId: PropTypes.string,
  },

  defaultProps: {
    queryId: 'q',
  },

  getProps(props, state) {
    return {
      emptyQuery: !state[props.queryId],
    };
  },
});
