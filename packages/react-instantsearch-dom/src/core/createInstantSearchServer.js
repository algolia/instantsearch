import { isEmpty, zipWith } from 'lodash';
import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import {
  createInstantSearch,
  version,
  HIGHLIGHT_TAGS,
} from 'react-instantsearch-core';

const getIndexId = context =>
  context && context.multiIndexContext
    ? context.multiIndexContext.targetedIndex
    : context.ais.mainTargetedIndex;

const hasMultipleIndices = context => context && context.multiIndexContext;

const getSearchParameters = (indexName, searchParameters) => {
  const sharedParameters = searchParameters
    .filter(searchParameter => !hasMultipleIndices(searchParameter.context))
    .reduce(
      (acc, searchParameter) =>
        searchParameter.getSearchParameters(
          acc,
          searchParameter.props,
          searchParameter.searchState
        ),
      new SearchParameters({
        ...HIGHLIGHT_TAGS,
        index: indexName,
      })
    );

  const derivedParameters = searchParameters
    .filter(searchParameter => hasMultipleIndices(searchParameter.context))
    .reduce((acc, searchParameter) => {
      const indexId = getIndexId(searchParameter.context);

      return {
        ...acc,
        [indexId]: searchParameter.getSearchParameters(
          acc[indexId] || sharedParameters,
          searchParameter.props,
          searchParameter.searchState
        ),
      };
    }, {});

  return {
    sharedParameters,
    derivedParameters,
  };
};

const singleIndexSearch = (helper, parameters) => helper.searchOnce(parameters);

const multiIndexSearch = (
  indexName,
  client,
  helper,
  sharedParameters,
  { [indexName]: mainParameters, ...derivedParameters }
) => {
  const search = [
    helper.searchOnce({
      ...sharedParameters,
      ...mainParameters,
    }),
  ];

  const indexIds = Object.keys(derivedParameters);

  search.push(
    ...indexIds.map(indexId => {
      const parameters = derivedParameters[indexId];

      return algoliasearchHelper(client, parameters.index).searchOnce(
        parameters
      );
    })
  );

  return Promise.all(search).then(results =>
    zipWith([indexName, ...indexIds], results, (indexId, result) =>
      // We attach `indexId` on the results to be able to reconstruct the
      // object client side. We cannot rely on `state.index` anymore because
      // we may have multiple times the same index.
      ({
        ...result,
        _internalIndexId: indexId,
      })
    )
  );
};

const createInstantSearchServer = algoliasearch => {
  const InstantSearch = createInstantSearch(algoliasearch, {
    Root: 'div',
    props: {
      className: 'ais-InstantSearch__root',
    },
  });

  let client = null;
  let indexName = '';
  let searchParameters = [];

  const findResultsState = function(App, props) {
    searchParameters = [];

    renderToString(<App {...props} />);

    const { sharedParameters, derivedParameters } = getSearchParameters(
      indexName,
      searchParameters
    );

    const helper = algoliasearchHelper(client, sharedParameters.index);

    if (isEmpty(derivedParameters)) {
      return singleIndexSearch(helper, sharedParameters);
    }

    return multiIndexSearch(
      indexName,
      client,
      helper,
      sharedParameters,
      derivedParameters
    );
  };

  class CreateInstantSearchServer extends Component {
    static propTypes = {
      algoliaClient: PropTypes.object,
      searchClient: PropTypes.object,
      appId: PropTypes.string,
      apiKey: PropTypes.string,
      indexName: PropTypes.string.isRequired,
      resultsState: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    };

    constructor(...args) {
      super(...args);

      if (this.props.searchClient) {
        if (this.props.appId || this.props.apiKey || this.props.algoliaClient) {
          throw new Error(
            'react-instantsearch:: `searchClient` cannot be used with `appId`, `apiKey` or `algoliaClient`.'
          );
        }
      }

      if (this.props.algoliaClient) {
        // eslint-disable-next-line no-console
        console.warn(
          '`algoliaClient` option was renamed `searchClient`. Please use this new option before the next major version.'
        );
      }

      client =
        this.props.searchClient ||
        this.props.algoliaClient ||
        algoliasearch(this.props.appId, this.props.apiKey);

      if (typeof client.addAlgoliaAgent === 'function') {
        client.addAlgoliaAgent(`react-instantsearch ${version}`);
      }

      indexName = this.props.indexName;
    }

    onSearchParameters(getWidgetSearchParameters, context, props, searchState) {
      searchParameters.push({
        getSearchParameters: getWidgetSearchParameters,
        index: getIndexId(context),
        context,
        props,
        searchState,
      });
    }

    hydrateResultsState() {
      const { resultsState = [] } = this.props;

      if (Array.isArray(resultsState)) {
        return resultsState.reduce(
          (acc, result) => ({
            ...acc,
            [result._internalIndexId]: new SearchResults(
              new SearchParameters(result.state),
              result._originalResponse.results
            ),
          }),
          {}
        );
      }

      return new SearchResults(
        new SearchParameters(resultsState.state),
        resultsState._originalResponse.results
      );
    }

    render() {
      const resultsState = this.hydrateResultsState();

      return (
        <InstantSearch
          {...this.props}
          resultsState={resultsState}
          onSearchParameters={this.onSearchParameters}
        />
      );
    }
  }

  return {
    InstantSearch: CreateInstantSearchServer,
    findResultsState,
  };
};

export default createInstantSearchServer;
