import algoliasearchHelper from 'algoliasearch-helper';
import { getConfigureSearchParameters } from '../connectors/configure/connectConfigure';

export const configure = ({ params } = {}) => ({ uiState, configuration }) => {
  const nextUiState = {
    ...uiState,
    configure: params.searchParameters,
  };

  return {
    uiState: nextUiState,
    configuration: {
      // Get an object back
      ...getConfigureSearchParameters(
        new algoliasearchHelper.SearchParameters(configuration),
        {
          uiState: nextUiState,
        }
      ),
    },
  };
};
