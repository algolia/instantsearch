import algoliasearchHelper from 'algoliasearch-helper';
import { getPaginationSearchParameters } from '../connectors/pagination/connectPagination';

export const pagination = ({ state = 1 } = {}) => ({
  uiState,
  configuration,
}) => {
  const nextUiState = {
    ...uiState,
    page: parseInt(uiState.page, 10) || state,
  };

  return {
    uiState: nextUiState,
    configuration: {
      // Get an object back
      ...getPaginationSearchParameters(
        new algoliasearchHelper.SearchParameters(configuration),
        {
          uiState: nextUiState,
        }
      ),
    },
  };
};
