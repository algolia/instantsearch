import { SearchParameters } from 'algoliasearch-helper';

export function convertNumericRefinementsToFilters(
  state: SearchParameters | null,
  attribute: string
) {
  if (!state) {
    return null;
  }
  const filtersObj = state.numericRefinements[attribute];
  /*
    filtersObj === {
      "<=": [10],
      "=": [],
      ">=": [5]
    }
  */
  const filters: string[] = [];
  Object.keys(filtersObj)
    .filter(
      operator =>
        Array.isArray(filtersObj[operator]) && filtersObj[operator].length > 0
    )
    .forEach(operator => {
      filtersObj[operator].forEach(value => {
        filters.push(`${attribute}${operator}${value}`);
      });
    });
  return filters;
}
