import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getIndexId,
} from '../core/indexUtils';

function getId() {
  return 'query';
}

function getAdditionalId() {
  return 'additionalVoiceParameters';
}

function getCurrentRefinementQuery(props, searchState, context) {
  const id = getId();
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    ''
  );

  if (currentRefinement) {
    return currentRefinement;
  }
  return '';
}

function getCurrentRefinementAdditional(props, searchState, context) {
  const id = getAdditionalId();
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    ''
  );

  if (currentRefinement) {
    return currentRefinement;
  }
  return {};
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId();
  const voiceParams = getAdditionalId();
  const queryLanguages = props.language
    ? { queryLanguages: [props.language.split('-')[0]] }
    : {};
  const additionalQueryParameters =
    typeof props.additionalQueryParameters === 'function'
      ? {
          ignorePlurals: true,
          removeStopWords: true,
          optionalWords: nextRefinement,
          ...props.additionalQueryParameters({ query: nextRefinement }),
        }
      : {};
  const nextValue = {
    [id]: nextRefinement,
    [voiceParams]: {
      ...queryLanguages,
      ...additionalQueryParameters,
    },
  };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage);
}

function cleanUp(props, searchState, context) {
  const interimState = cleanUpValue(searchState, context, getId());
  return cleanUpValue(interimState, context, getAdditionalId());
}

export default createConnector({
  displayName: 'AlgoliaVoiceSearch',
  $$type: 'ais.voiceSearch',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, searchState, searchResults) {
    return {
      currentRefinement: getCurrentRefinementQuery(props, searchState, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      isSearchStalled: searchResults.isSearchStalled,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  getSearchParameters(searchParameters, props, searchState) {
    const query = getCurrentRefinementQuery(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    const additionalParams = getCurrentRefinementAdditional(
      props,
      searchState,
      {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }
    );

    return searchParameters
      .setQuery(query)
      .setQueryParameters(additionalParams);
  },

  getMetadata(props, searchState) {
    const id = getId();
    const currentRefinement = getCurrentRefinementQuery(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    return {
      id,
      index: getIndexId({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      items:
        currentRefinement === null
          ? []
          : [
              {
                label: `${id}: ${currentRefinement}`,
                value: (nextState) =>
                  refine(props, nextState, '', {
                    ais: props.contextValue,
                    multiIndexContext: props.indexContextValue,
                  }),
                currentRefinement,
              },
            ],
    };
  },
});
