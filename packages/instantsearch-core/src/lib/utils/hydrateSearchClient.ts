import type {
  SearchClient,
  InitialResults,
  ClientV4,
  SearchOptions,
  SearchResponse,
  CompositionClient,
} from '../../types';

type ClientWithTransporter = ClientV4 & {
  transporter: { responsesCache: any };
  search: (requests: any, ...args: any[]) => any;
};

function getServerResults(entry: InitialResults[string]) {
  return entry.compositionFeedsResults?.length
    ? entry.compositionFeedsResults
    : entry.results || [];
}

export function hydrateSearchClient(
  client: (SearchClient | CompositionClient) & {
    _cacheHydrated?: boolean;
  },
  results?: InitialResults
) {
  if (!results) {
    return;
  }

  // Third-party clients have no `transporter` cache to hydrate.
  if (!('transporter' in client) || client._cacheHydrated) {
    return;
  }

  const cachedRequest = [
    Object.keys(results).reduce<
      Array<{
        params?: string;
        indexName?: string;
      }>
    >((acc, key) => {
      const entry = results[key];
      const { state, requestParams } = entry;
      const serverResults = getServerResults(entry);
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
      const res = getServerResults(results[key]);
      if (!res) {
        return acc;
      }
      return acc.concat(res);
    },
    []
  );

  // To hydrate the client we need to populate the cache with the data from
  // the server (done in `hydrateSearchClientWithMultiIndexRequest` or
  // `hydrateSearchClientWithSingleIndexRequest`). But since there is no way
  // for us to compute the key the same way as `algoliasearch-client` we need
  // to populate it on a custom key and override the `search` method to
  // search on it first.
  client._cacheHydrated = true;

  const baseMethod = client.search.bind(client) as unknown as (
    query: any,
    ...args: any[]
  ) => any;
  client.search = (
    requests: Parameters<(SearchClient | CompositionClient)['search']>[0],
    ...methodArgs: any[]
  ) => {
    const requestsWithSerializedParams = Array.isArray(requests)
      ? // search client
        requests.map((request) => ({
          ...request,
          params: serializeQueryParameters(request.params),
        }))
      : // composition client
        serializeQueryParameters(requests.requestBody.params);

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
