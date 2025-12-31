import type { IndexUiState, SearchToolInput } from '../../types';

export function generateIndexUiState(
  input: SearchToolInput,
  currentUiState: IndexUiState
): IndexUiState {
  const indexUiState: IndexUiState = { ...currentUiState };

  if (input.query) {
    indexUiState.query = input.query;
  }

  if (input.facet_filters) {
    let uiStateToUpdate: 'refinementList' | 'menu' | null = null;

    if (indexUiState.refinementList) {
      uiStateToUpdate = 'refinementList';
    } else if (indexUiState.menu) {
      uiStateToUpdate = 'menu';
    }

    if (uiStateToUpdate) {
      input.facet_filters.forEach((facetFilter) => {
        facetFilter.forEach((filter) => {
          const [facet, value] = filter.split(':');

          if (indexUiState[uiStateToUpdate]?.[facet]) {
            indexUiState[uiStateToUpdate]![facet] = [];
            (indexUiState[uiStateToUpdate]![facet] as string[]).push(value);
          }
        });
      });
    }
  }

  return indexUiState;
}
