import { has, omit, get } from 'lodash';

export function getIndex(context) {
  return context && context.multiIndexContext
    ? context.multiIndexContext.targetedIndex
    : context.ais.mainTargetedIndex;
}

export function getResults(searchResults, context) {
  const index = getIndex(context);
  if (searchResults.results && !searchResults.results.hits) {
    const results = searchResults.results[getIndex(context)];
    return results && index === results.index
      ? searchResults.results[getIndex(context)]
      : null;
  } else {
    return searchResults.results && searchResults.results.index === index
      ? searchResults.results
      : null;
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

function getNamespaceAndAttributeName(id) {
  const parts = id.match(/^([^.]*)\.(.*)/);
  const namespace = parts && parts[1];
  const attributeName = parts && parts[2];

  return { namespace, attributeName };
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
  const { namespace, attributeName } = getNamespaceAndAttributeName(id);
  const refinements =
    (hasMultipleIndex(context) &&
      searchState.indices &&
      namespace &&
      has(searchState.indices[`${index}`][namespace], `${attributeName}`)) ||
    (hasMultipleIndex(context) &&
      searchState.indices &&
      has(searchState, `indices.${index}.${id}`)) ||
    (!hasMultipleIndex(context) &&
      namespace &&
      has(searchState[namespace], attributeName)) ||
    (!hasMultipleIndex(context) && has(searchState, id));
  if (refinements) {
    let currentRefinement;

    if (hasMultipleIndex(context)) {
      currentRefinement = namespace
        ? get(searchState.indices[`${index}`][namespace], attributeName)
        : get(searchState.indices[index], id);
    } else {
      currentRefinement = namespace
        ? get(searchState[namespace], attributeName)
        : get(searchState, id);
    }

    return refinementsCallback(currentRefinement);
  }

  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }

  return defaultValue;
}

export function cleanUpValue(searchState, context, id) {
  const index = getIndex(context);
  const { namespace, attributeName } = getNamespaceAndAttributeName(id);
  if (hasMultipleIndex(context)) {
    return namespace
      ? {
          ...searchState,
          indices: {
            ...searchState.indices,
            [index]: {
              ...searchState.indices[index],
              [namespace]: omit(
                searchState.indices[index][namespace],
                `${attributeName}`
              ),
            },
          },
        }
      : omit(searchState, `indices.${index}.${id}`);
  } else {
    return namespace
      ? {
          ...searchState,
          [namespace]: omit(searchState[namespace], `${attributeName}`),
        }
      : omit(searchState, `${id}`);
  }
}
