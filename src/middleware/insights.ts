import { InsightsClient, Middleware } from '../types';
import { getInsightsAnonymousUserToken } from '../helpers';
import { warning, noop } from '../lib/utils';

export type InsightsProps = {
  insightsClient: false | InsightsClient;
};

export type CreateInsightsMiddleware = (props: InsightsProps) => Middleware;

export const createInsightsMiddleware: CreateInsightsMiddleware = props => {
  const { insightsClient: _insightsClient } = props;
  if (_insightsClient !== false && !_insightsClient) {
    if (__DEV__) {
      throw new Error(
        "The `insightsClient` option is required if you want userToken to be automatically set in search calls. If you don't want this behaviour, set it to `false`."
      );
    } else {
      throw new Error(
        'The `insightsClient` option is required. To disable, set it to `false`.'
      );
    }
  }

  const hasInsightsClient = Boolean(_insightsClient);
  const insightsClient =
    _insightsClient === false ? (noop as InsightsClient) : _insightsClient;

  return ({ instantSearchInstance }) => {
    insightsClient('_get', '_hasCredentials', (hasCredentials: boolean) => {
      if (!hasCredentials) {
        const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
        insightsClient('_get', '_userToken', (userToken: string) => {
          warning(
            !userToken,
            `You set userToken before \`createInsightsMiddleware()\` and it is ignored.
Please set the token after the \`createInsightsMiddleware()\` call.

createInsightsMiddleware({ /* ... */ });

insightsClient('setUserToken', 'your-user-token');
// or
aa('setUserToken', 'your-user-token');
            `
          );
        });
        insightsClient('init', { appId, apiKey });
      }
    });

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

        if (hasInsightsClient) {
          // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
          // We can set it as userToken.
          setUserTokenToSearch(getInsightsAnonymousUserToken());
        }

        if (Array.isArray((insightsClient as any).queue)) {
          // Context: The umd build of search-insights is asynchronously loaded by the snippet.
          //
          // When user calls `aa('setUserToken', 'my-user-token')` before `search-insights` is loaded,
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
