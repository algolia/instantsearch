import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { version, HIGHLIGHT_TAGS } from 'react-instantsearch-core';

const hasMultipleIndices = (context) => context && context.multiIndexContext;

const getIndexId = (context) =>
  hasMultipleIndices(context)
    ? context.multiIndexContext.targetedIndex
    : context.ais.mainTargetedIndex;

function createWidgetsCollector(accumulator) {
  return (props) => {
    accumulator.push({
      ...props,
      index: getIndexId(props.context),
    });
  };
}

function getMetadata(widgets) {
  return widgets
    .filter((widget) => widget.getMetadata)
    .map((widget) => {
      return widget.getMetadata(widget.props, widget.searchState);
    });
}

const getSearchParameters = (indexName, widgets) => {
  const sharedParameters = widgets
    .filter((widget) => !hasMultipleIndices(widget.context))
    .reduce(
      (acc, widget) =>
        widget.getSearchParameters(acc, widget.props, widget.searchState),
      new algoliasearchHelper.SearchParameters({
        ...HIGHLIGHT_TAGS,
        index: indexName,
      })
    );

  const derivedParameters = widgets
    .filter((widget) => hasMultipleIndices(widget.context))
    .reduce((acc, widget) => {
      const indexId = getIndexId(widget.context);

      return {
        ...acc,
        [indexId]: widget.getSearchParameters(
          acc[indexId] || sharedParameters,
          widget.props,
          widget.searchState
        ),
      };
    }, {});

  return {
    sharedParameters,
    derivedParameters,
  };
};

/**
 * The engine can return params: "query=xxx&query=yyy" if e.g. a query rule modifies it.
 * This however will cause us to miss the cache hydration, so we make sure to keep
 * only the first query (always the one from the parameters).
 * @param {string} params the parameters to clean
 * @returns {string} the parameters without duplicate query
 */
function removeDuplicateQuery(params) {
  if (!params) {
    return params;
  }
  let hasFoundQuery = false;
  const queryParamRegex = /&?query=[^&]*/g;
  return params.replace(queryParamRegex, function replacer(match) {
    if (hasFoundQuery) {
      return '';
    }
    hasFoundQuery = true;
    return match;
  });
}

function cleanRawResults(rawResults) {
  return rawResults.map((res) => {
    return {
      ...res,
      params: removeDuplicateQuery(res.params),
    };
  });
}

const singleIndexSearch = (helper, parameters) =>
  helper.searchOnce(parameters).then((res) => ({
    rawResults: cleanRawResults(res.content._rawResults),
    state: res.content._state,
  }));

const multiIndexSearch = (
  indexName,
  client,
  sharedParameters,
  { [indexName]: mainParameters, ...derivedParameters }
) => {
  const helper = algoliasearchHelper(client, indexName);
  const indexIds = Object.keys(derivedParameters);

  const searches = [
    new SearchParameters({ ...sharedParameters, ...mainParameters }),
    ...indexIds.map((indexId) => derivedParameters[indexId]),
  ].map(
    (params) =>
      new Promise((resolve) =>
        helper.derive(() => params).once('result', resolve)
      )
  );

  helper.searchOnlyWithDerivedHelpers();

  // We attach `indexId` on the results to be able to reconstruct the object
  // on the client side. We cannot rely on `state.index` anymore because we
  // may have multiple times the same index.
  return Promise.all(searches).then((results) =>
    [indexName, ...indexIds].map((indexId, i) => ({
      rawResults: cleanRawResults(results[i].results._rawResults),
      state: results[i].results._state,
      _internalIndexId: indexId,
    }))
  );
};

export const findResultsState = function (App, props) {
  if (!props) {
    throw new Error(
      'The function `findResultsState` must be called with props: `findResultsState(App, props)`'
    );
  }

  if (!props.searchClient) {
    throw new Error(
      'The props provided to `findResultsState` must have a `searchClient`'
    );
  }

  if (!props.indexName) {
    throw new Error(
      'The props provided to `findResultsState` must have an `indexName`'
    );
  }

  let widgets = [];
  // eslint-disable-next-line no-shadow
  function execute(props) {
    widgets = [];
    renderToString(
      <App {...props} widgetsCollector={createWidgetsCollector(widgets)} />
    );

    if (widgets.length === 0) {
      throw new Error(
        '[ssr]: no widgets were added, you likely did not pass the `widgetsCollector` down to the InstantSearch component.'
      );
    }

    const { sharedParameters, derivedParameters } = getSearchParameters(
      props.indexName,
      widgets
    );

    const metadata = getMetadata(widgets);

    const helper = algoliasearchHelper(
      props.searchClient,
      sharedParameters.index
    );

    if (typeof props.searchClient.addAlgoliaAgent === 'function') {
      props.searchClient.addAlgoliaAgent(
        `react-instantsearch-server (${version})`
      );
    }

    if (Object.keys(derivedParameters).length === 0) {
      return singleIndexSearch(helper, sharedParameters).then((res) => {
        return {
          metadata,
          ...res,
        };
      });
    }

    return multiIndexSearch(
      props.indexName,
      props.searchClient,
      sharedParameters,
      derivedParameters
    ).then((results) => {
      return { metadata, results };
    });
  }

  return execute(props).then((resultsState) => {
    // <DynamicWidgets> requires another query to retrieve the dynamic widgets
    // to render.
    if (
      widgets.some((widget) => widget.displayName === 'AlgoliaDynamicWidgets')
    ) {
      return execute({ ...props, resultsState });
    }
    return resultsState;
  });
};
