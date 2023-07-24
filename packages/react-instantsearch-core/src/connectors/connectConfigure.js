import createConnector from '../core/createConnector';
import {
  refineValue,
  getIndexId,
  hasMultipleIndices,
} from '../core/indexUtils';
import { omit } from '../core/utils';

function getId() {
  return 'configure';
}

export default createConnector({
  displayName: 'AlgoliaConfigure',
  $$type: 'ais.configure',
  getProvidedProps() {
    return {};
  },
  getSearchParameters(searchParameters, props) {
    const { children, contextValue, indexContextValue, ...items } = props;
    return searchParameters.setQueryParameters(items);
  },
  transitionState(props, prevSearchState, nextSearchState) {
    const id = getId();
    const { children, contextValue, indexContextValue, ...items } = props;
    const propKeys = Object.keys(props);
    const nonPresentKeys = this._props
      ? Object.keys(this._props).filter((prop) => propKeys.indexOf(prop) === -1)
      : [];
    this._props = props;
    const nextValue = {
      [id]: { ...omit(nextSearchState[id], nonPresentKeys), ...items },
    };
    return refineValue(nextSearchState, nextValue, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },
  cleanUp(props, searchState) {
    const id = getId();
    const indexId = getIndexId({
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    const subState =
      hasMultipleIndices({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }) && searchState.indices
        ? searchState.indices[indexId]
        : searchState;

    const configureKeys =
      subState && subState[id] ? Object.keys(subState[id]) : [];

    const configureState = configureKeys.reduce((acc, item) => {
      if (!props[item]) {
        acc[item] = subState[id][item];
      }
      return acc;
    }, {});

    const nextValue = { [id]: configureState };

    return refineValue(searchState, nextValue, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },
});
