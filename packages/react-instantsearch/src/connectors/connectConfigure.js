import createConnector from '../core/createConnector.js';
import {omit, isEmpty, difference, keys} from 'lodash';

const namespace = 'configure';

export default createConnector({
  displayName: 'AlgoliaConfigure',
  getProvidedProps() {
    return {};
  },
  getSearchParameters(searchParameters, props) {
    const items = omit(props, 'children');
    return searchParameters.setQueryParameters(items);
  },
  transitionState(props, prevSearchState, nextSearchState) {
    const items = omit(props, 'children');
    const nonPresentKeys = this._props ? difference(keys(this._props), keys(props)) : [];
    this._props = props;
    return {
      ...nextSearchState,
      [namespace]: {...omit(nextSearchState[namespace], nonPresentKeys), ...items},
    };
  },
  cleanUp(props, searchState) {
    const configureKeys = searchState[namespace] ? Object.keys(searchState[namespace]) : [];
    const configureState = configureKeys.reduce((acc, item) => {
      if (!props[item]) {
        acc[item] = searchState[namespace][item];
      }
      return acc;
    }, {});
    return isEmpty(configureState) ? omit(searchState, namespace) : {...searchState, [namespace]: configureState};
  },
});
