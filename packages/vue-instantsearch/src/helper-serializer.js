import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';

export const serialize = function(helper) {
  if (!(helper instanceof algoliaHelper.AlgoliaSearchHelper)) {
    throw new TypeError('Serialize expects an algolia helper instance.');
  }

  const client = helper.getClient();

  const serialized = {
    searchParameters: Object.assign({}, helper.state),
    appId: client.applicationID,
    apiKey: client.apiKey,
    response: helper.lastResults._rawResults,
  };

  return serialized;
};

export const unserialize = function(data) {
  const client = algoliaClient(data.appId, data.apiKey);
  const helper = algoliaHelper(
    client,
    data.searchParameters.index,
    data.searchParameters
  );
  helper.lastResults = new algoliaHelper.SearchResults(
    helper.state,
    data.response
  );

  return helper;
};
