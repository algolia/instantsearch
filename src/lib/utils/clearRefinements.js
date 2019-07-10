/**
 * Clears the refinements of a SearchParameters object based on rules provided.
 * The included attributes list is applied before the excluded attributes list. If the list
 * is not provided, this list of all the currently refined attributes is used as included attributes.
 * @param {object} $0 parameters
 * @param {Helper} $0.helper instance of the Helper
 * @param {string[]} [$0.attributesToClear = []] list of parameters to clear
 * @returns {SearchParameters} search parameters with refinements cleared
 */
function clearRefinements({ helper, attributesToClear = [] }) {
  let finalState = helper.state;

  attributesToClear.forEach(attribute => {
    if (attribute === '_tags') {
      finalState = finalState.clearTags();
    } else {
      finalState = finalState.clearRefinements(attribute);
    }
  });

  if (attributesToClear.indexOf('query') !== -1) {
    finalState = finalState.setQuery('');
  }
  finalState = finalState.setPage(0);

  return finalState;
}

export default clearRefinements;
