const { createInMemoryCache } = require('@algolia/cache-in-memory');
const algoliasearch = require('algoliasearch');

const clients = new Map();
function getClient(appId, apiKey) {
  const key = [appId, apiKey].join('__');
  let client = clients.get(key);
  if (!client) {
    client = algoliasearch(appId, apiKey, {
      responsesCache: createInMemoryCache(),
      requestsCache: createInMemoryCache(),
    });

    clients.set(key, client);
  }

  return client;
}

async function getInformationFromIndex({ appId, apiKey, indexName }) {
  try {
    const client = getClient(appId, apiKey);
    return await client
      .search([
        {
          indexName,
          params: {
            hitsPerPage: 1,
            facets: '*',
            maxValuesPerFacet: 1,
          },
        },
      ])
      .then(({ results: [result] }) => result);
  } catch (err) {
    return {};
  }
}

module.exports = getInformationFromIndex;
