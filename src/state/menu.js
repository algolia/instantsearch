import algoliasearchHelper from 'algoliasearch-helper';
import {
  getWidgetParams,
  getConfiguration,
  getMenuWidgetSearchParameters,
} from '../connectors/menu/connectMenu';

export const menu = ({ state = '', params }) => ({
  uiState,
  configuration,
}) => {
  const { attributeName, limit, showMoreLimit } = getWidgetParams(params);

  const initialState = (uiState.menu && uiState.menu[attributeName]) || state;

  const nextUiState = {
    ...uiState,
    menu: {
      ...uiState.menu,
      [attributeName]: initialState,
    },
  };

  const nextConfiguration = getConfiguration({
    attributeName,
    limit,
    showMoreLimit,
  })(configuration);

  return {
    uiState: nextUiState,
    configuration: {
      // Get an object back
      ...getMenuWidgetSearchParameters(attributeName)(
        new algoliasearchHelper.SearchParameters(nextConfiguration),
        {
          uiState: nextUiState,
        }
      ),
    },
  };
};
