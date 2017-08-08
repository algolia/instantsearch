import algoliaClient from 'algoliasearch/lite';
import algoliaHelper from 'algoliasearch-helper';

export const serialize = function(helper) {
  if (!(helper instanceof algoliaHelper.AlgoliaSearchHelper)) {
    throw new TypeError('Serialize expects an algolia helper instance.');
  }

  const client = helper.getClient();

  const response = helper.lastResults ? helper.lastResults._rawResults : null;

  const serialized = {
    searchParameters: Object.assign({}, helper.state),
    appId: client.applicationID,
    apiKey: client.apiKey,
    response,
  };

  return serialized;
};

export const deserialize = function(data) {
  const client = algoliaClient(data.appId, data.apiKey);
  const helper = algoliaHelper(
    client,
    data.searchParameters.index,
    data.searchParameters
  );

  if (data.response) {
    helper.lastResults = new algoliaHelper.SearchResults(
      helper.state,
      data.response
    );
  }

  return helper;
};
