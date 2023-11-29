// @ts-nocheck (types to be fixed during actual implementation)
import qs from 'qs';

import type { InitialResults, SearchClient } from '../../types';

export function hydrateSearchClient(
  client: SearchClient,
  results?: InitialResults
) {
  if (!results) {
    return;
  }

  // Disable cache hydration on:
  // - Algoliasearch API Client < v4 with cache disabled
  // - Third party clients (detected by the `addAlgoliaAgent` function missing)

  if (
    (!client.transporter || client._cacheHydrated) &&
    (!client._useCache || typeof client.addAlgoliaAgent !== 'function')
  ) {
    return;
  }

  // Algoliasearch API Client >= v4
  // To hydrate the client we need to populate the cache with the data from
  // the server (done in `hydrateSearchClientWithMultiIndexRequest` or
  // `hydrateSearchClientWithSingleIndexRequest`). But since there is no way
  // for us to compute the key the same way as `algoliasearch-client` we need
  // to populate it on a custom key and override the `search` method to
  // search on it first.
  if (client.transporter && !client._cacheHydrated) {
    client._cacheHydrated = true;

    const baseMethod = client.search;
    client.search = (requests, ...methodArgs) => {
      const requestsWithSerializedParams = requests.map((request) => ({
        ...request,
        params: serializeQueryParameters(request.params),
      }));

      return client.transporter.responsesCache.get(
        {
          method: 'search',
          args: [requestsWithSerializedParams, ...methodArgs],
        },
        () => {
          return baseMethod(requests, ...methodArgs);
        }
      );
    };

    // Populate the cache with the data from the server
    client.transporter.responsesCache.set(
      {
        method: 'search',
        args: [
          Object.keys(results).reduce(
            (acc, key) =>
              acc.concat(
                results[key].results.map((result) => ({
                  indexName: result.index,
                  // We normalize the params received from the server as they can
                  // be serialized differently depending on the engine.
                  params: serializeQueryParameters(qs.parse(result.params)),
                }))
              ),
            []
          ),
        ],
      },
      {
        results: Object.keys(results).reduce(
          (acc, key) => acc.concat(results[key].results),
          []
        ),
      }
    );
  }

  // Algoliasearch API Client < v4
  // Prior to client v4 we didn't have a proper API to hydrate the client
  // cache from the outside. The following code populates the cache with
  // a single-index result. You can find more information about the
  // computation of the key inside the client (see link below).
  // https://github.com/algolia/algoliasearch-client-javascript/blob/c27e89ff92b2a854ae6f40dc524bffe0f0cbc169/src/AlgoliaSearchCore.js#L232-L240
  if (!client.transporter) {
    const cacheKey = `/1/indexes/*/queries_body_${JSON.stringify({
      requests: Object.keys(results).reduce(
        (acc, key) =>
          acc.concat(
            results[key].rawResults.map((result) => ({
              indexName: result.index,
              params: serializeQueryParameters(qs.parse(result.params)),
            }))
          ),
        []
      ),
    })}`;

    client.cache = {
      ...client.cache,
      [cacheKey]: JSON.stringify({
        results: Object.keys(results).reduce(
          (acc, key) => acc.concat(results[key].rawResults),
          []
        ),
      }),
    };
  }
}

// This function is copied from the algoliasearch v4 API Client. If modified,
// consider updating it also in `serializeQueryParameters` from `@algolia/transporter`.
function serializeQueryParameters(parameters) {
  const isObjectOrArray = (value) =>
    Object.prototype.toString.call(value) === '[object Object]' ||
    Object.prototype.toString.call(value) === '[object Array]';

  const encode = (format, ...args) => {
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
  };

  return Object.keys(parameters)
    .map((key) =>
      encode(
        '%s=%s',
        key,
        isObjectOrArray(parameters[key])
          ? JSON.stringify(parameters[key])
          : parameters[key]
      )
    )
    .join('&');
}
