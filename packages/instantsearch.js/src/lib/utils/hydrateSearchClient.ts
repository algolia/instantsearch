import type {
  SearchClient,
  InitialResults,
  ClientV3_4,
  SearchOptions,
  SearchResponse,
} from '../../types';

type ClientWithCache = SearchClient & { cache: Record<string, string> };
type ClientWithTransporter = ClientV3_4 & {
  transporter: { responsesCache: any };
  search: (requests: any, ...args: any[]) => any;
};

export function hydrateSearchClient(
  client: SearchClient & {
    _cacheHydrated?: boolean;
    _useCache?: boolean;
  },
  results?: InitialResults
) {
  if (!results) {
    return;
  }

  // Disable cache hydration on:
  // - Algoliasearch API Client < v4 with cache disabled
  // - Third party clients (detected by the `addAlgoliaAgent` function missing)

  if (
    (!('transporter' in client) || client._cacheHydrated) &&
    (!client._useCache || typeof client.addAlgoliaAgent !== 'function')
  ) {
    return;
  }

  const cachedRequest = [
    Object.keys(results).reduce<
      Array<{
        params?: string;
        indexName?: string;
      }>
    >((acc, key) => {
      const { state, requestParams, results: serverResults } = results[key];
      const mappedResults =
        serverResults && state
          ? serverResults.map((result, idx) => ({
              indexName: state.index || result.index,
              // We normalize the params received from the server as they can
              // be serialized differently depending on the engine.
              // We use search parameters from the server request to craft the cache
              // if possible, and fallback to those from results if not.
              ...(requestParams?.[idx] || result.params
                ? {
                    params: serializeQueryParameters(
                      requestParams?.[idx] ||
                        deserializeQueryParameters(result.params)
                    ),
                  }
                : {}),
            }))
          : [];
      return acc.concat(mappedResults);
    }, []),
  ];

  const cachedResults = Object.keys(results).reduce<Array<SearchResponse<any>>>(
    (acc, key) => {
      const res = results[key].results;
      if (!res) {
        return acc;
      }
      return acc.concat(res);
    },
    []
  );

  // Algoliasearch API Client >= v4
  // To hydrate the client we need to populate the cache with the data from
  // the server (done in `hydrateSearchClientWithMultiIndexRequest` or
  // `hydrateSearchClientWithSingleIndexRequest`). But since there is no way
  // for us to compute the key the same way as `algoliasearch-client` we need
  // to populate it on a custom key and override the `search` method to
  // search on it first.
  if ('transporter' in client && !client._cacheHydrated) {
    client._cacheHydrated = true;

    const baseMethod = client.search.bind(client) as unknown as (
      query: any,
      ...args: any[]
    ) => any;
    // @ts-ignore wanting type checks for v3 on this would make this too complex
    client.search = (requests, ...methodArgs) => {
      const requestsWithSerializedParams = requests.map((request) => ({
        ...request,
        params: serializeQueryParameters(request.params),
      }));

      return (client as ClientWithTransporter).transporter.responsesCache.get(
        {
          method: 'search',
          args: [requestsWithSerializedParams, ...methodArgs],
        },
        () => {
          return baseMethod(requests, ...methodArgs);
        }
      );
    };

    (client as ClientWithTransporter).transporter.responsesCache.set(
      {
        method: 'search',
        args: cachedRequest,
      },
      {
        results: cachedResults,
      }
    );
  }

  // Algoliasearch API Client < v4
  // Prior to client v4 we didn't have a proper API to hydrate the client
  // cache from the outside. The following code populates the cache with
  // a single-index result. You can find more information about the
  // computation of the key inside the client (see link below).
  // https://github.com/algolia/algoliasearch-client-javascript/blob/c27e89ff92b2a854ae6f40dc524bffe0f0cbc169/src/AlgoliaSearchCore.js#L232-L240
  if (!('transporter' in client)) {
    const cacheKey = `/1/indexes/*/queries_body_${JSON.stringify({
      requests: cachedRequest,
    })}`;

    (client as ClientWithCache).cache = {
      ...(client as ClientWithCache).cache,
      [cacheKey]: JSON.stringify({
        results: Object.keys(results).map((key) => results[key].results),
      }),
    };
  }
}

function deserializeQueryParameters(parameters: string) {
  return parameters.split('&').reduce<Record<string, any>>((acc, parameter) => {
    const [key, value] = parameter.split('=');
    acc[key] = value ? decodeURIComponent(value) : '';
    return acc;
  }, {});
}

// This function is copied from the algoliasearch v4 API Client. If modified,
// consider updating it also in `serializeQueryParameters` from `@algolia/transporter`.
function serializeQueryParameters(parameters: SearchOptions) {
  const isObjectOrArray = (value: any) =>
    Object.prototype.toString.call(value) === '[object Object]' ||
    Object.prototype.toString.call(value) === '[object Array]';

  const encode = (format: string, ...args: [string, any]) => {
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
  };

  return Object.keys(parameters)
    .map((key) =>
      encode(
        '%s=%s',
        key,
        isObjectOrArray(parameters[key as keyof SearchOptions])
          ? JSON.stringify(parameters[key as keyof SearchOptions])
          : parameters[key as keyof SearchOptions]
      )
    )
    .join('&');
}
