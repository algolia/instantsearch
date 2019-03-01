import { SearchParametersWithoutDefaults } from './stateManager';

const concat = (...args) => [].concat(...args);

const uniq = input =>
  input.filter((value, index) => input.indexOf(value) === index);

const dedupe = (left, right) => uniq(concat(left, right));

const mergeDisjunctiveFacetRefinements = (attributes, left, right) =>
  attributes.reduce(
    (acc, attribute) => ({
      ...acc,
      // Right takes over left for the same attribute
      [attribute]: right[attribute],
    }),
    left
  );

// const filterObject = fn => input =>
//   Object.keys(input)
//     .filter(key => fn(key, input))
//     .reduce(
//       (acc, key) => ({
//         ...acc,
//         [key]: input[key],
//       }),
//       {}
//     );

// const filterObjectWithUndefinedValues = filterObject(
//   (key, input) => typeof input[key] !== 'undefined'
// );

const mergeSearchParameters = (left, right) =>
  new SearchParametersWithoutDefaults({
    // Inherit from the parent
    // ...filterObjectWithUndefinedValues(left),
    ...left,
    // Take the value of the child
    // ...filterObjectWithUndefinedValues(right),
    ...right,
    // Merge the complex attributes
    disjunctiveFacets: dedupe(left.disjunctiveFacets, right.disjunctiveFacets),
    // Takes the right attributes
    disjunctiveFacetsRefinements: mergeDisjunctiveFacetRefinements(
      right.disjunctiveFacets,
      left.disjunctiveFacetsRefinements,
      right.disjunctiveFacetsRefinements
    ),
  });

export const resolveSingleLeafMerge = (...nodes) => {
  return nodes
    .map(node => node.state)
    .reduce((prevState, currentState) =>
      mergeSearchParameters(prevState, currentState)
    );
};
