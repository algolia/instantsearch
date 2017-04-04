import createConnector from '../core/createConnector';
import { PropTypes } from 'react';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getIndex,
} from '../core/indexUtils';

function getId() {
  return 'query';
}

function getCurrentRefinement(props, searchState, context) {
  const id = getId(props);
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    '',
    currentRefinement => {
      if (currentRefinement) {
        return currentRefinement;
      }
      return '';
    }
  );
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId();
  const nextValue = { [id]: nextRefinement };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, getId());
}

/**
 * connectSearchBox connector provides the logic to build a widget that will
 * let the user search for a query.
 * @name connectSearchBox
 * @kind connector
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the query to search for.
 */
export default createConnector({
  displayName: 'AlgoliaSearchBox',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, searchState) {
    return {
      currentRefinement: getCurrentRefinement(props, searchState, this.context),
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, this.context);
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, this.context);
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQuery(
      getCurrentRefinement(props, searchState, this.context)
    );
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this.context
    );
    return {
      id,
      index: getIndex(this.context),
      items: currentRefinement === null
        ? []
        : [
            {
              label: `${id}: ${currentRefinement}`,
              value: nextState => refine(props, nextState, '', this.context),
              currentRefinement,
            },
          ],
    };
  },
});
