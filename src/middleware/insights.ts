import { Middleware } from '.';
import { InsightsClient } from '../types';
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
    return {
      onStateChange() {},
      subscribe() {
        const setUserTokenToSearch = (userToken?: string) => {
          // At the time this middleware is subscribed, `mainIndex.init()` is already called.
          // It means `mainIndex.getHelper()` exists.
          if (userToken) {
            instantSearchInstance.mainIndex
              .getHelper()!
              .setQueryParameter('userToken', userToken);
          }
        };

        instantSearchInstance.mainIndex
          .getHelper()!
          .setQueryParameter('clickAnalytics', true);

        insightsClient('_get', '_hasCredentials', (hasCredentials: boolean) => {
          if (!hasCredentials) {
            const [appId, apiKey] = getAppIdAndApiKey(
              instantSearchInstance.client
            );
            insightsClient('init', { appId, apiKey });
          }

          // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
          // We can set it as userToken.
          setUserTokenToSearch(getInsightsAnonymousUserToken());

          if (Array.isArray((insightsClient as any).queue)) {
            // Context: The umd build of search-insights is asynchronously loaded by the snippet.
            //
            // When user called `aa('setUserToken', 'my-user-token')` before `search-insights` is loaded,
            // it is stored in `aa.queue` and we are reading it to set userToken to search call.
            // This queue is meant to be consumed whenever `search-insights` is loaded and when it runs `processQueue()`.
            // But the reason why we handle it here is to prevent the first search API from being triggered
            // without userToken because search-insights is not loaded yet.
            (insightsClient as any).queue.forEach(([method, firstArgument]) => {
              if (method === 'setUserToken') {
                setUserTokenToSearch(firstArgument);
              }
            });
          }

          // This updates userToken which is set explicitly by `aa('setUserToken', userToken)`
          insightsClient('onUserTokenChange', setUserTokenToSearch, {
            immediate: true,
          });
        });
      },
      unsubscribe() {
        insightsClient('onUserTokenChange', undefined);
      },
    };
  };
};

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
