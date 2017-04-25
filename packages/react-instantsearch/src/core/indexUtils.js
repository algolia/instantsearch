import { has, omit, get } from 'lodash';

export function getIndex(context) {
  return context && context.multiIndexContext
    ? context.multiIndexContext.targetedIndex
    : context.ais.mainTargetedIndex;
}

export function getResults(searchResults, context) {
  if (searchResults.results && !searchResults.results.hits) {
    return searchResults.results[getIndex(context)]
      ? searchResults.results[getIndex(context)]
      : null;
  } else {
    return searchResults.results ? searchResults.results : null;
  }
}

export function hasMultipleIndex(context) {
  return context && context.multiIndexContext;
}

// eslint-disable-next-line max-params
export function refineValue(
  searchState,
  nextRefinement,
  context,
  resetPage,
  namespace
) {
  if (hasMultipleIndex(context)) {
    return namespace
      ? refineMultiIndexWithNamespace(
          searchState,
          nextRefinement,
          context,
          resetPage,
          namespace
        )
      : refineMultiIndex(searchState, nextRefinement, context, resetPage);
  } else {
    return namespace
      ? refineSingleIndexWithNamespace(
          searchState,
          nextRefinement,
          resetPage,
          namespace
        )
      : refineSingleIndex(searchState, nextRefinement, resetPage);
  }
}

function refineMultiIndex(searchState, nextRefinement, context, resetPage) {
  const page = resetPage ? { page: 1 } : undefined;
  const index = getIndex(context);
  const state = has(searchState, `indices.${index}`)
    ? {
        ...searchState.indices,
        [index]: { ...searchState.indices[index], ...nextRefinement, ...page },
      }
    : {
        ...searchState.indices,
        ...{ [index]: { ...nextRefinement, ...page } },
      };
  return { ...searchState, indices: state };
}

function refineSingleIndex(searchState, nextRefinement, resetPage) {
  const page = resetPage ? { page: 1 } : undefined;
  return { ...searchState, ...nextRefinement, ...page };
}

// eslint-disable-next-line max-params
function refineMultiIndexWithNamespace(
  searchState,
  nextRefinement,
  context,
  resetPage,
  namespace
) {
  const index = getIndex(context);
  const page = resetPage ? { page: 1 } : undefined;
  const state = has(searchState, `indices.${index}`)
    ? {
        ...searchState.indices,
        [index]: {
          ...searchState.indices[index],
          ...{
            [namespace]: {
              ...searchState.indices[index][namespace],
              ...nextRefinement,
            },
            page: 1,
          },
        },
      }
    : {
        ...searchState.indices,
        ...{ [index]: { [namespace]: nextRefinement, ...page } },
      };
  return { ...searchState, indices: state };
}

function refineSingleIndexWithNamespace(
  searchState,
  nextRefinement,
  resetPage,
  namespace
) {
  const page = resetPage ? { page: 1 } : undefined;
  return {
    ...searchState,
    [namespace]: { ...searchState[namespace], ...nextRefinement },
    ...page,
  };
}

// eslint-disable-next-line max-params
export function getCurrentRefinementValue(
  props,
  searchState,
  context,
  id,
  defaultValue,
  refinementsCallback
) {
  const index = getIndex(context);
  const refinements =
    (hasMultipleIndex(context) && has(searchState, `indices.${index}.${id}`)) ||
    (!hasMultipleIndex(context) && has(searchState, id));
  if (refinements) {
    const currentRefinement = hasMultipleIndex(context)
      ? get(searchState.indices[index], id)
      : get(searchState, id);
    return refinementsCallback(currentRefinement);
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return defaultValue;
}

export function cleanUpValue(searchState, context, id) {
  const index = getIndex(context);
  return hasMultipleIndex(context)
    ? omit(searchState, `indices.${index}.${id}`)
    : omit(searchState, `${id}`);
}
