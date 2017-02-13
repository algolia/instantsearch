import {has, omit, get} from 'lodash';

export function getIndex(context) {
  return context && context.multiIndexContext
  ? context.multiIndexContext.targettedIndex
  : context.ais.mainTargettedIndex;
}

export function hasMultipleIndex(context) {
  return context && context.multiIndexContext;
}

// eslint-disable-next-line max-params
export function refineValue(props, searchState, nextRefinement, context, resetPage, namespace) {
  if (hasMultipleIndex(context)) {
    return namespace
      ? refineMultiIndexWithNamespace(props, searchState, nextRefinement, context, namespace)
      : refineMultiIndex(props, searchState, nextRefinement, context, resetPage);
  } else {
    return namespace
      ? refineSingleIndexWithNamespace(props, searchState, nextRefinement, namespace)
      : refineSingleIndex(props, searchState, nextRefinement, resetPage);
  }
}

function refineMultiIndex(props, searchState, nextRefinement, context, resetPage) {
  const page = resetPage ? {page: 1} : {};
  const index = getIndex(context);
  const state = has(searchState, `indices.${index}`)
    ? {...searchState.indices, [index]: {...searchState.indices[index], ...nextRefinement, ...page}}
    : {...searchState.indices, ...{[index]: {...nextRefinement, ...page}}};
  return {...searchState, indices: state};
}

function refineSingleIndex(props, searchState, nextRefinement, resetPage) {
  const page = resetPage ? {page: 1} : {};
  return {...searchState, ...nextRefinement, ...page};
}

function refineMultiIndexWithNamespace(props, searchState, nextRefinement, context, namespace) {
  const index = getIndex(context);
  const state = has(searchState, `indices.${index}`)
    ? {...searchState.indices, [index]: {
      ...searchState.indices[index],
      ...{[namespace]: {...searchState.indices[index][namespace], ...nextRefinement},
        page: 1}}}
    : {...searchState.indices, ...{[index]: {[namespace]: nextRefinement, page: 1}}};
  return {...searchState, indices: state};
}

function refineSingleIndexWithNamespace(props, searchState, nextRefinement, namespace) {
  return {...searchState, [namespace]: {...searchState[namespace], ...nextRefinement}, page: 1};
}

// eslint-disable-next-line max-params
export function getCurrentRefinementValue(props, searchState, context, id, defaultValue, refinementsCallback) {
  const index = getIndex(context);
  const refinements = hasMultipleIndex(context) && has(searchState, `indices.${index}.${id}`)
    || !hasMultipleIndex(context) && has(searchState, id);
  if (refinements) {
    const currentRefinement = hasMultipleIndex(context) ? get(searchState.indices[index], id) : get(searchState, id);
    return refinementsCallback(currentRefinement);
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return defaultValue;
}

export function cleanUpValue(props, searchState, context, id) {
  const index = getIndex(context);
  return hasMultipleIndex(context)
    ? omit(searchState, `indices.${index}.${id}`)
    : omit(searchState, `${id}`);
}
