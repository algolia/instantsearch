import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { version } from '../../package.json';
import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import ReactDom from 'react-dom/server';
import { getIndex, hasMultipleIndex } from './indexUtils';
import { isEmpty } from 'lodash';
import cis from './createInstantSearch';
import highlightTags from './highlightTags.js';

const createInstantSearch = function(algoliasearch) {
  const InstantSearch = cis(algoliasearch, {
    Root: 'div',
    props: { className: 'ais-InstantSearch__root' },
  });

  let searchParameters = [];
  let client;
  let indexName = '';

  const onSearchParameters = (
    getSearchParameters,
    context,
    props,
    searchState
  ) => {
    const index = getIndex(context);
    searchParameters.push({
      getSearchParameters,
      context,
      props,
      searchState,
      index,
    });
  };

  const findResultsState = function(App, props) {
    searchParameters = [];
    ReactDom.renderToString(<App {...props} />);
    const sharedSearchParameters = searchParameters
      .filter(
        searchParameter =>
          !hasMultipleIndex(searchParameter.context) &&
          (searchParameter.props.indexName === indexName ||
            !searchParameter.props.indexName)
      )
      .reduce(
        (acc, searchParameter) =>
          searchParameter.getSearchParameters.call(
            { context: searchParameter.context },
            acc,
            searchParameter.props,
            searchParameter.searchState
          ),
        new SearchParameters({ index: indexName, ...highlightTags })
      );

    const mergedSearchParameters = searchParameters
      .filter(searchParameter => hasMultipleIndex(searchParameter.context))
      .reduce((acc, searchParameter) => {
        const index = getIndex(searchParameter.context);
        const sp = searchParameter.getSearchParameters.call(
          { context: searchParameter.context },
          acc[index] ? acc[index] : sharedSearchParameters,
          searchParameter.props,
          searchParameter.searchState
        );
        acc[index] = sp;
        return acc;
      }, {});

    if (isEmpty(mergedSearchParameters)) {
      const helper = algoliasearchHelper(client, sharedSearchParameters.index);
      return helper.searchOnce(sharedSearchParameters);
    } else {
      const helper = algoliasearchHelper(client, sharedSearchParameters.index);
      const search = [];
      if (mergedSearchParameters[indexName]) {
        search.push(
          helper.searchOnce({
            ...sharedSearchParameters,
            ...mergedSearchParameters[sharedSearchParameters.index],
            index: mergedSearchParameters[sharedSearchParameters.index].index,
          })
        );
        delete mergedSearchParameters[indexName];
      } else {
        search.push(helper.searchOnce(sharedSearchParameters));
      }
      search.push(
        ...Object.keys(mergedSearchParameters).map(key => {
          const derivedHelper = algoliasearchHelper(
            client,
            mergedSearchParameters[key].index
          );
          return derivedHelper.searchOnce(mergedSearchParameters[key]);
        })
      );

      return Promise.all(search);
    }
  };

  const decorateResults = function(results) {
    if (!results) {
      return undefined;
    }
    return Array.isArray(results)
      ? results.reduce((acc, result) => {
          acc[result.state.index] = new SearchResults(
            new SearchParameters(result.state),
            result._originalResponse.results
          );
          return acc;
        }, [])
      : new SearchResults(
          new SearchParameters(results.state),
          results._originalResponse.results
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

    constructor(props) {
      super();

      if (props.searchClient) {
        if (props.appId || props.apiKey || props.algoliaClient) {
          throw new Error(
            'react-instantsearch:: `searchClient` cannot be used with `appId`, `apiKey` or `algoliaClient`.'
          );
        }
      }

      if (props.algoliaClient) {
        // eslint-disable-next-line no-console
        console.warn(
          '`algoliaClient` option was renamed `searchClient`. Please use this new option before the next major version.'
        );
      }

      client =
        props.searchClient ||
        props.algoliaClient ||
        algoliasearch(props.appId, props.apiKey);

      if (typeof client.addAlgoliaAgent === 'function') {
        client.addAlgoliaAgent(`react-instantsearch ${version}`);
      }

      indexName = props.indexName;
    }

    render() {
      const resultsState = decorateResults(this.props.resultsState);
      return (
        <InstantSearch
          {...this.props}
          resultsState={resultsState}
          onSearchParameters={onSearchParameters}
        />
      );
    }
  }

  return { InstantSearch: CreateInstantSearchServer, findResultsState };
};

export { createInstantSearch };
