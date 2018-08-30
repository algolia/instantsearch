import algoliasearchHelper from 'algoliasearch-helper';
import { getSearchBoxSearchParameters } from '../connectors/search-box/connectSearchBox';

export const searchBox = ({ state = '' } = {}) => ({
  uiState,
  configuration,
}) => {
  const initialState = uiState.query || state;

  const nextUiState = {
    ...uiState,
    query: initialState,
  };

  return {
    uiState: nextUiState,
    configuration: {
      // Get an object back
      ...getSearchBoxSearchParameters(
        new algoliasearchHelper.SearchParameters(configuration),
        {
          uiState: nextUiState,
        }
      ),
    },
  };
};
