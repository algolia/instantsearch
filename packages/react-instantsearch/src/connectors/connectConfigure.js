import createConnector from '../core/createConnector.js';
import {omit, isEmpty} from 'lodash';

const namespace = 'configure';

function getCurrentRefinement(props, searchState) {
  return Object.keys(props).reduce((acc, item) => {
    acc[item] = searchState[namespace] && searchState[namespace][item]
     ? searchState[namespace][item] : props[item];
    return acc;
  }, {});
}

export default createConnector({
  displayName: 'AlgoliaConfigure',
  getProvidedProps() {
    return {};
  },
  getSearchParameters(searchParameters, props, searchState) {
    const items = omit(props, 'children');
    const configuration = getCurrentRefinement(items, searchState);
    return searchParameters.setQueryParameters(configuration);
  },
  transitionState(props, prevSearchState, nextSearchState) {
    const items = omit(props, 'children');
    return {
      ...nextSearchState,
      [namespace]: {...items, ...nextSearchState[namespace]},
    };
  },
  cleanUp(props, searchState) {
    const configureState = Object.keys(searchState[namespace]).reduce((acc, item) => {
      if (!props[item]) {
        acc[item] = searchState[namespace][item];
      }
      return acc;
    }, {});
    return isEmpty(configureState) ? omit(searchState, namespace) : {...searchState, [namespace]: configureState};
  },
});
