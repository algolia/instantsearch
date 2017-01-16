import createConnector from '../core/createConnector.js';
import omit from 'lodash/omit';

export default createConnector({
  displayName: 'AlgoliaConfigure',
  getProvidedProps() { return {}; },
  getSearchParameters(searchParameters, props) {
    const configuration = omit(props, 'children');
    return searchParameters.setQueryParameters(configuration);
  },
});
