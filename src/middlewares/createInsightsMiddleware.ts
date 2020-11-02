import { InsightsClient, InsightsClientMethod, Middleware } from '../types';
import { getInsightsAnonymousUserTokenInternal } from '../helpers';
import { warning, noop, getAppIdAndApiKey } from '../lib/utils';

export type InsightsEvent = {
  insightsMethod?: InsightsClientMethod;
  payload: any;
  widgetType: string;
  eventType: string; // 'view' | 'click' | 'conversion', but we're not restricting.
};

export type InsightsProps = {
  insightsClient: null | InsightsClient;
  onEvent?: (
    event: InsightsEvent,
    insightsClient: null | InsightsClient
  ) => void;
};

export type CreateInsightsMiddleware = (props: InsightsProps) => Middleware;

export const createInsightsMiddleware: CreateInsightsMiddleware = props => {
  const { insightsClient: _insightsClient, onEvent } = props || {};
  if (_insightsClient !== null && !_insightsClient) {
    if (__DEV__) {
      throw new Error(
        "The `insightsClient` option is required if you want userToken to be automatically set in search calls. If you don't want this behaviour, set it to `null`."
      );
    } else {
      throw new Error(
        'The `insightsClient` option is required. To disable, set it to `null`.'
      );
    }
  }

  const hasInsightsClient = Boolean(_insightsClient);
  const insightsClient =
    _insightsClient === null ? (noop as InsightsClient) : _insightsClient;

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
          setUserTokenToSearch(getInsightsAnonymousUserTokenInternal());
        }

        if (Array.isArray((insightsClient as any).queue)) {
          // Context: The umd build of search-insights is asynchronously loaded by the snippet.
          //
          // When user calls `aa('setUserToken', 'my-user-token')` before `search-insights` is loaded,
          // ['setUserToken', 'my-user-token'] gets stored in `aa.queue`.
          // Whenever `search-insights` is finally loaded, it will process the queue.
          //
          // But here's the reason why we handle it here:
          // At this point, even though `search-insights` is not loaded yet,
          // we still want to read the token from the queue.
          // Otherwise, the first search call will be fired without the token.
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

        instantSearchInstance.sendEventToInsights = (event: InsightsEvent) => {
          if (onEvent) {
            onEvent(event, _insightsClient);
          } else if (event.insightsMethod) {
            insightsClient(event.insightsMethod, event.payload);
          } else {
            warning(
              false,
              'Cannot send event to Algolia Insights because `insightsMethod` option is missing.'
            );
          }
        };
      },
      unsubscribe() {
        insightsClient('onUserTokenChange', undefined);
        instantSearchInstance.sendEventToInsights = noop;
      },
    };
  };
};
