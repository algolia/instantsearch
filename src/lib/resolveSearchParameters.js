import { SearchParameters } from 'algoliasearch-helper';

// Note about widget driven approach:
// 1. Only rely on the widgets to build the querries we lost the power to play
// with the helper directly. Only the uiState is the source of truth for the
// SearchParemters. It means that extra parameters set through  the helper
// are ignored.
// 2. Note thtat it has the advantage to not be able to build a widget that
// does not sync with the URL. Right now it's possible to "forget" this part
// and built a widget out of the URL Sync. If we do move to a widget driven
// approach we don't have this issue anymore.
//
// Blocker with the current implementation:
// 3. Right now the issue we have is tied to how the `widgetState` and the
// `widgetSearchParameters` are computed. Those functions are not enough to
// build the `searchParameters`. We implicitly rely on the "initial" state
// computed with `getConfiguration` e.g. with facets. Possible solutions:
//   - If we drop configure and choose to rely on widget we don't have the
//   issue. Note that it's not easy to migrate to such solutions.
//   - Do a "smart" merge of the SearchParameters that combine widget driven
//   approach + merge of the "complex" strucutre of the parameters that ignore
//   the keys with default values. Does it work?

const concat = (...args) => [].concat(...args);

const uniq = input =>
  input.filter((value, index) => input.indexOf(value) === index);

const dedupe = (left, right) => uniq(concat(left, right));

const mergeObject = (left, right, fn) =>
  Object.entries(right).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: fn(acc[key], value),
    }),
    left
  );

const filterObject = (input, excludedKeys) =>
  Object.keys(input)
    // Exclude keys with default value
    .filter(key => !excludedKeys.includes(key))
    // Exclude keys without value
    .filter(key => typeof input[key] !== 'undefined')
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: input[key],
      }),
      {}
    );

const mergeSearchParameters = (left, right) =>
  new SearchParameters({
    // Inherit from the parent
    ...left,
    // Merge the primitive withtout the default value
    ...filterObject(right, ['query', 'pagination']),
    // Merge the deep attributes
    disjunctiveFacets: dedupe(left.disjunctiveFacets, right.disjunctiveFacets),
    disjunctiveFacetsRefinements: mergeObject(
      left.disjunctiveFacetsRefinements,
      right.disjunctiveFacetsRefinements,
      (l = [], r = []) => dedupe(l, r)
    ),
  });

export const resolveSingleLeaf = (...nodes) => {
  const uiState = nodes.reduce((state, node) => {
    return node.widgets
      .filter(w => Boolean(w.getWidgetState))
      .reduce((innerState, widget) => {
        const nextState = widget.getWidgetState(innerState, {
          searchParameters: node.state,
        });

        return nextState;
      }, state);
  }, {});

  const searchParameters = nodes.reduce((state, node) => {
    return node.widgets
      .filter(w => Boolean(w.getWidgetSearchParameters))
      .reduce((innerState, widget) => {
        // Retrieve the configutation for the widget from the state
        const innerStateWithConfiguration = new SearchParameters(
          widget.getConfiguration
            ? widget.getConfiguration({ ...innerState })
            : {}
        );

        const nextState = widget.getWidgetSearchParameters(
          // Merge the parent with the configuration of the widget
          mergeSearchParameters(innerState, innerStateWithConfiguration),
          {
            uiState,
          }
        );

        return nextState;
      }, state);
  }, new SearchParameters());

  return searchParameters;
};
