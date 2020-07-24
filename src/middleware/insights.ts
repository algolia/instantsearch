import { Middleware } from '.';
import { InsightsClient, InstantSearch } from '../types';
import { getInsightsAnonymousUserToken } from '../helpers';

export type InsightsProps = {
  insightsClient: InsightsClient;
};

export type CreateInsightsMiddleware = (props: InsightsProps) => Middleware;

export const createInsightsMiddleware: CreateInsightsMiddleware = props => {
  const { insightsClient } = props;
  if (!insightsClient) {
    throw new Error('The `insightsClient` option is required.');
  }
  return ({ instantSearchInstance }) => {
    const setUserToken = (userToken?: string) => {
      // At the time this middleware is subscribed, `mainIndex.init()` is already called.
      // It means `mainIndex.getHelper()` exists.
      if (userToken) {
        instantSearchInstance.mainIndex
          .getHelper()!
          .setQueryParameter('userToken', userToken);
      }
    };

    return {
      onStateChange() {},
      subscribe() {
        updateQueryParameter(instantSearchInstance);
        ensureInitialization({
          instantSearchInstance,
          insightsClient,
          callback: () => {
            setUserTokenFromQueueOrCookie(insightsClient, setUserToken);
            watchUserToken(insightsClient, setUserToken);
          },
        });
      },
      unsubscribe() {
        insightsClient('onUserTokenChange', undefined);
      },
    };
  };
};

function ensureInitialization({
  instantSearchInstance,
  insightsClient,
  callback,
}: {
  instantSearchInstance: InstantSearch;
  insightsClient: InsightsClient;
  callback: () => void;
}) {
  insightsClient('_get', '_hasCredentials', (hasCredentials: boolean) => {
    if (hasCredentials) {
      callback();
    } else {
      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
      insightsClient('init', { appId, apiKey });
      callback();
    }
  });
}

function getAppIdAndApiKey(searchClient) {
  if (searchClient.transporter) {
    // searchClient v4
    const { headers, queryParameters } = searchClient.transporter;
    const APP_ID = 'x-algolia-application-id';
    const API_KEY = 'x-algolia-api-key';
    const appId = headers[APP_ID] || queryParameters[APP_ID];
    const apiKey = headers[API_KEY] || queryParameters[API_KEY];
    return [appId, apiKey];
  } else {
    // searchClient v3
    return [searchClient.applicationID, searchClient.apiKey];
  }
}

function updateQueryParameter(instantSearchInstance) {
  instantSearchInstance.mainIndex
    .getHelper()
    .setQueryParameter('clickAnalytics', true);
}

function setUserTokenFromQueueOrCookie(
  insightsClient,
  setUserToken: (userToken?: string) => void
) {
  if (Array.isArray(insightsClient.queue)) {
    // Context: The umd build of search-insights is asynchronously loaded by the snippet.
    //
    // When user called `aa('setUserToken', 'my-user-token')` before `search-insights` is loaded,
    // it is stored in `aa.queue` and we can read it to set user token.
    // This queue is meant to be consumed whenever `search-insights` is loaded and when it runs `processQueue()`.
    // But the reason why we handle it here is to prevent the first search API from triggering
    // without userToken because search-insights is not loaded yet.
    insightsClient.queue.forEach(([method, firstArgument]) => {
      if (method === 'setUserToken') {
        setUserToken(firstArgument);
        return;
      }
    });
  }

  // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
  // We can set it as userToken first.
  setUserToken(getInsightsAnonymousUserToken());
}

// This function updates userToken which is set explicitly by `aa('setUserToken', userToken)`
function watchUserToken(
  insightsClient: InsightsClient,
  setUserToken: (userToken?: string) => void
) {
  insightsClient('onUserTokenChange', setUserToken, { immediate: true });
}
