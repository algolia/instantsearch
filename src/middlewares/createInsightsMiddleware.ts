import {
  InsightsClient,
  InsightsClientMethod,
  InternalMiddleware,
  Hit,
} from '../types';
import { getInsightsAnonymousUserTokenInternal } from '../helpers';
import { warning, noop, getAppIdAndApiKey, find } from '../lib/utils';

export type InsightsEvent = {
  insightsMethod?: InsightsClientMethod;
  payload: any;
  widgetType: string;
  eventType: string; // 'view' | 'click' | 'conversion', but we're not restricting.
  hits?: Hit[];
  attribute?: string;
};

export type InsightsProps = {
  insightsClient: null | InsightsClient;
  insightsInitParams?: {
    userHasOptedOut?: boolean;
    useCookie?: boolean;
    cookieDuration?: number;
    region?: 'de' | 'us';
  };
  onEvent?: (
    event: InsightsEvent,
    insightsClient: null | InsightsClient
  ) => void;
};

export type CreateInsightsMiddleware = (
  props: InsightsProps
) => InternalMiddleware;

export const createInsightsMiddleware: CreateInsightsMiddleware = props => {
  const { insightsClient: _insightsClient, insightsInitParams, onEvent } =
    props || {};
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
    const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
    let queuedUserToken: string | undefined = undefined;
    let userTokenBeforeInit: string | undefined = undefined;

    if (Array.isArray(insightsClient.queue)) {
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
      [, queuedUserToken] =
        find(
          insightsClient.queue.slice().reverse(),
          ([method]) => method === 'setUserToken'
        ) || [];
    }
    insightsClient('getUserToken', null, (_error: any, userToken: string) => {
      // If user has called `aa('setUserToken', 'my-user-token')` before creating
      // the `insights` middleware, we store them temporarily and
      // set it later on.
      //
      // Otherwise, the `init` call might override it with anonymous user token.
      userTokenBeforeInit = userToken;
    });
    insightsClient('init', { appId, apiKey, ...insightsInitParams });

    return {
      onStateChange() {},
      subscribe() {
        insightsClient('addAlgoliaAgent', 'insights-middleware');

        // At the time this middleware is subscribed, `mainIndex.init()` is already called.
        // It means `mainIndex.getHelper()` exists.
        const helper = instantSearchInstance.mainIndex.getHelper()!;

        const setUserTokenToSearch = (userToken?: string) => {
          if (userToken) {
            helper.setState(
              helper.state.setQueryParameter('userToken', userToken)
            );
          }
        };
        const hasUserToken = () => Boolean((helper.state as any).userToken);

        helper.setState(helper.state.setQueryParameter('clickAnalytics', true));

        const anonymousUserToken = getInsightsAnonymousUserTokenInternal();
        if (hasInsightsClient && anonymousUserToken) {
          // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
          // We can set it as userToken.
          setUserTokenToSearch(anonymousUserToken);
        }

        // We consider the `userToken` coming from a `init` call to have a higher
        // importance than the one coming from the queue.
        if (userTokenBeforeInit) {
          insightsClient('setUserToken', userTokenBeforeInit);
        } else if (queuedUserToken) {
          insightsClient('setUserToken', queuedUserToken);
        }

        // This updates userToken which is set explicitly by `aa('setUserToken', userToken)`
        insightsClient('onUserTokenChange', setUserTokenToSearch, {
          immediate: true,
        });

        instantSearchInstance.sendEventToInsights = (event: InsightsEvent) => {
          if (onEvent) {
            onEvent(event, _insightsClient);
          } else if (event.insightsMethod) {
            if (hasUserToken()) {
              insightsClient(event.insightsMethod, event.payload);
            } else {
              warning(
                false,
                `
Cannot send event to Algolia Insights because \`userToken\` is not set.

See documentation: https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/js/#setting-the-usertoken
`
              );
            }
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
