import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';
import { serialize } from '../helper-serializer';

test('should be able to serialize a helper', () => {
  const client = algoliaClient('appId', 'apiKey');
  const helper = algoliaHelper(client);

  helper.lastResults = new algoliaHelper.SearchResults(helper.state, [
    {
      nbHits: 666,
    },
  ]);
  const serialized = serialize(helper);

  expect(serialized.searchParameters).toEqual(expect.any(Object));
  expect(serialized.appId).toEqual('appId');
  expect(serialized.apiKey).toEqual('apiKey');
  expect(serialized.response).toEqual([
    {
      nbHits: 666,
    },
  ]);
});

test('should be able to serialize a helper that has done no query to Algolia yet', () => {
  const client = algoliaClient('appId', 'apiKey');
  const helper = algoliaHelper(client);

  const serialized = serialize(helper);

  expect(serialized.response).toBeNull();
});
