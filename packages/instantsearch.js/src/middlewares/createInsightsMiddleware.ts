import { getInsightsAnonymousUserTokenInternal } from '../helpers';
import {
  warning,
  noop,
  getAppIdAndApiKey,
  find,
  safelyRunOnBrowser,
} from '../lib/utils';

import type {
  InsightsClient,
  InsightsEvent as _InsightsEvent,
  InsightsMethod,
  InsightsMethodMap,
  InternalMiddleware,
} from '../types';
import type {
  AlgoliaSearchHelper,
  PlainSearchParameters,
} from 'algoliasearch-helper';

type ProvidedInsightsClient = InsightsClient | null | undefined;

export type InsightsEvent<TMethod extends InsightsMethod = InsightsMethod> =
  _InsightsEvent<TMethod>;

export type InsightsProps<
  TInsightsClient extends ProvidedInsightsClient = ProvidedInsightsClient
> = {
  insightsClient?: TInsightsClient;
  insightsInitParams?: Partial<InsightsMethodMap['init'][0]>;
  onEvent?: (event: InsightsEvent, insightsClient: TInsightsClient) => void;
  /**
   * @internal indicator for the default insights middleware
   */
  $$internal?: boolean;
  /**
   * @internal indicator for sending the `clickAnalytics` search parameter
   */
  $$automatic?: boolean;
};

const ALGOLIA_INSIGHTS_VERSION = '2.15.0';
const ALGOLIA_INSIGHTS_SRC = `https://cdn.jsdelivr.net/npm/search-insights@${ALGOLIA_INSIGHTS_VERSION}/dist/search-insights.min.js`;

export type InsightsClientWithGlobals = InsightsClient & {
  shouldAddScript?: boolean;
  version?: string;
};

export type CreateInsightsMiddleware = typeof createInsightsMiddleware;

export function createInsightsMiddleware<
  TInsightsClient extends ProvidedInsightsClient
>(props: InsightsProps<TInsightsClient> = {}): InternalMiddleware {
  const {
    insightsClient: _insightsClient,
    insightsInitParams,
    onEvent,
    $$internal = false,
    $$automatic = false,
  } = props;

  let potentialInsightsClient: ProvidedInsightsClient = _insightsClient;

  if (!_insightsClient && _insightsClient !== null) {
    safelyRunOnBrowser(({ window }: { window: any }) => {
      const pointer = window.AlgoliaAnalyticsObject || 'aa';

      if (typeof pointer === 'string') {
        potentialInsightsClient = window[pointer];
      }

      if (!potentialInsightsClient) {
        window.AlgoliaAnalyticsObject = pointer;

        if (!window[pointer]) {
          window[pointer] = (...args: any[]) => {
            if (!window[pointer].queue) {
              window[pointer].queue = [];
            }
            window[pointer].queue.push(args);
          };
          window[pointer].version = ALGOLIA_INSIGHTS_VERSION;
          window[pointer].shouldAddScript = true;
        }

        potentialInsightsClient = window[pointer];
      }
    });
  }
  // if still no insightsClient was found, we use a noop
  const insightsClient: InsightsClientWithGlobals =
    potentialInsightsClient || noop;

  return ({ instantSearchInstance }) => {
    // remove existing default insights middleware
    // user-provided insights middleware takes precedence
    const existingInsightsMiddlewares = instantSearchInstance.middleware
      .filter(
        (m) => m.instance.$$type === 'ais.insights' && m.instance.$$internal
      )
      .map((m) => m.creator);
    instantSearchInstance.unuse(...existingInsightsMiddlewares);

    const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

    // search-insights.js also throws an error so dev-only clarification is sufficient
    warning(
      Boolean(appId && apiKey),
      'could not extract Algolia credentials from searchClient in insights middleware.'
    );

    let queuedUserToken: string | undefined = undefined;
    let queuedAuthenticatedUserToken: string | undefined = undefined;
    let userTokenBeforeInit: string | undefined = undefined;
    let authenticatedUserTokenBeforeInit: string | undefined = undefined;

    const { queue } = insightsClient;

    if (Array.isArray(queue)) {
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
      [queuedUserToken, queuedAuthenticatedUserToken] = [
        'setUserToken',
        'setAuthenticatedUserToken',
      ].map((key) => {
        const [, value] =
          find(queue.slice().reverse(), ([method]) => method === key) || [];

        return value;
      });
    }

    // If user called `aa('setUserToken')` or `aa('setAuthenticatedUserToken')`
    // before creating the Insights middleware, we temporarily store the token
    // and set it later on.
    //
    // Otherwise, the `init` call might override them with anonymous user token.
    insightsClient('getUserToken', null, (_error, userToken) => {
      userTokenBeforeInit = normalizeUserToken(userToken);
    });

    insightsClient('getAuthenticatedUserToken', null, (_error, userToken) => {
      authenticatedUserTokenBeforeInit = normalizeUserToken(userToken);
    });

    // Only `init` if the `insightsInitParams` option is passed or
    // if the `insightsClient` version doesn't supports optional `init` calling.
    if (insightsInitParams || !isModernInsightsClient(insightsClient)) {
      insightsClient('init', {
        appId,
        apiKey,
        partial: true,
        ...insightsInitParams,
      });
    }

    let initialParameters: PlainSearchParameters;
    let helper: AlgoliaSearchHelper;

    return {
      $$type: 'ais.insights',
      $$internal,
      $$automatic,
      onStateChange() {},
      subscribe() {
        if (!insightsClient.shouldAddScript) return;

        const errorMessage =
          '[insights middleware]: could not load search-insights.js. Please load it manually following https://alg.li/insights-init';

        try {
          const script = document.createElement('script');
          script.async = true;
          script.src = ALGOLIA_INSIGHTS_SRC;
          script.onerror = () => {
            instantSearchInstance.emit('error', new Error(errorMessage));
          };
          document.body.appendChild(script);
          insightsClient.shouldAddScript = false;
        } catch (cause) {
          insightsClient.shouldAddScript = false;
          instantSearchInstance.emit('error', new Error(errorMessage));
        }
      },
      started() {
        insightsClient('addAlgoliaAgent', 'insights-middleware');

        helper = instantSearchInstance.mainHelper!;

        initialParameters = {
          userToken: (helper.state as PlainSearchParameters).userToken,
          clickAnalytics: helper.state.clickAnalytics,
        };

        // We don't want to force clickAnalytics when the insights is enabled from the search response.
        // This means we don't enable insights for indices that don't opt in
        if (!$$automatic) {
          helper.overrideStateWithoutTriggeringChangeEvent({
            ...helper.state,
            clickAnalytics: true,
          });
        }

        if (!$$internal) {
          instantSearchInstance.scheduleSearch();
        }

        const setUserTokenToSearch = (
          userToken?: string | number,
          immediate = false
        ) => {
          const normalizedUserToken = normalizeUserToken(userToken);

          if (!normalizedUserToken) {
            return;
          }

          const existingToken = (helper.state as PlainSearchParameters)
            .userToken;

          function applyToken() {
            helper.overrideStateWithoutTriggeringChangeEvent({
              ...helper.state,
              userToken: normalizedUserToken,
            });

            if (existingToken && existingToken !== userToken) {
              instantSearchInstance.scheduleSearch();
            }
          }

          // Delay the token application to the next render cycle
          if (!immediate) {
            setTimeout(applyToken, 0);
          } else {
            applyToken();
          }
        };

        const anonymousUserToken = getInsightsAnonymousUserTokenInternal();
        if (anonymousUserToken) {
          // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
          // We can set it as userToken.
          setUserTokenToSearch(anonymousUserToken, true);
        }

        function setUserToken(
          token: string | number,
          userToken?: string | number,
          authenticatedUserToken?: string | number
        ) {
          setUserTokenToSearch(token, true);

          if (userToken) {
            insightsClient('setUserToken', userToken);
          }
          if (authenticatedUserToken) {
            insightsClient('setAuthenticatedUserToken', authenticatedUserToken);
          }
        }

        // We consider the `userToken` or `authenticatedUserToken` before an
        // `init` call of higher importance than one from the queue.
        const tokenBeforeInit =
          authenticatedUserTokenBeforeInit || userTokenBeforeInit;
        const queuedToken = queuedAuthenticatedUserToken || queuedUserToken;

        if (tokenBeforeInit) {
          setUserToken(
            tokenBeforeInit,
            userTokenBeforeInit,
            authenticatedUserTokenBeforeInit
          );
        } else if (queuedToken) {
          setUserToken(
            queuedToken,
            queuedUserToken,
            queuedAuthenticatedUserToken
          );
        }

        // By the time the first query is sent, the token would not be set by the insights
        // onChange callbacks. It is explicitly being set here so that the first query
        // has the initial tokens set and inturn a second query isn't automatically made
        // when the onChange callback actually changes the state.
        if (
          typeof instantSearchInstance._insights !== 'boolean' &&
          instantSearchInstance._insights?.insightsInitParams
        ) {
          if (instantSearchInstance._insights.insightsInitParams.authenticatedUserToken) {
            setUserTokenToSearch(instantSearchInstance._insights.insightsInitParams.authenticatedUserToken, true);
          } else if (instantSearchInstance._insights.insightsInitParams.userToken) {
            setUserTokenToSearch(instantSearchInstance._insights.insightsInitParams.userToken, true);
          }
        }

        // This updates userToken which is set explicitly by `aa('setUserToken', userToken)`
        insightsClient('onUserTokenChange', setUserTokenToSearch, {
          immediate: true,
        });

        // This updates userToken which is set explicitly by `aa('setAuthenticatedtUserToken', authenticatedUserToken)`
        insightsClient(
          'onAuthenticatedUserTokenChange',
          (authenticatedUserToken) => {
            // If we're unsetting the `authenticatedUserToken`, we revert to the `userToken`
            if (!authenticatedUserToken) {
              insightsClient('getUserToken', null, (_, userToken) => {
                setUserTokenToSearch(userToken);
              });
            }

            setUserTokenToSearch(authenticatedUserToken);
          },
          {
            immediate: true,
          }
        );

        type InsightsClientWithLocalCredentials = <
          TMethod extends InsightsMethod
        >(
          method: TMethod,
          payload: InsightsMethodMap[TMethod][0]
        ) => void;

        let insightsClientWithLocalCredentials =
          insightsClient as InsightsClientWithLocalCredentials;

        if (isModernInsightsClient(insightsClient)) {
          insightsClientWithLocalCredentials = (method, payload) => {
            const extraParams = {
              headers: {
                'X-Algolia-Application-Id': appId,
                'X-Algolia-API-Key': apiKey,
              },
            };

            // @ts-ignore we are calling this only when we know that the client actually is correct
            return insightsClient(method, payload, extraParams);
          };
        }

        instantSearchInstance.sendEventToInsights = (event: InsightsEvent) => {
          if (onEvent) {
            onEvent(
              event,
              insightsClientWithLocalCredentials as TInsightsClient
            );
          } else if (event.insightsMethod) {
            // Source is used to differentiate events sent by instantsearch from those sent manually.
            (event.payload as any).algoliaSource = ['instantsearch'];
            if ($$automatic) {
              (event.payload as any).algoliaSource.push(
                'instantsearch-automatic'
              );
            }
            if (event.eventModifier === 'internal') {
              (event.payload as any).algoliaSource.push(
                'instantsearch-internal'
              );
            }

            insightsClientWithLocalCredentials(
              event.insightsMethod,
              event.payload
            );

            warning(
              Boolean((helper.state as PlainSearchParameters).userToken),
              `
Cannot send event to Algolia Insights because \`userToken\` is not set.

See documentation: https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/js/#setting-the-usertoken
`
            );
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
        insightsClient('onAuthenticatedUserTokenChange', undefined);
        instantSearchInstance.sendEventToInsights = noop;
        if (helper && initialParameters) {
          helper.overrideStateWithoutTriggeringChangeEvent({
            ...helper.state,
            ...initialParameters,
          });

          instantSearchInstance.scheduleSearch();
        }
      },
    };
  };
}

/**
 * Determines if a given insights `client` supports the optional call to `init`
 * and the ability to set credentials via extra parameters when sending events.
 */
function isModernInsightsClient(client: InsightsClientWithGlobals): boolean {
  const [major, minor] = (client.version || '').split('.').map(Number);

  /* eslint-disable @typescript-eslint/naming-convention */
  const v3 = major >= 3;
  const v2_6 = major === 2 && minor >= 6;
  const v1_10 = major === 1 && minor >= 10;
  /* eslint-enable @typescript-eslint/naming-convention */

  return v3 || v2_6 || v1_10;
}

/**
 * While `search-insights` supports both string and number user tokens,
 * the Search API only accepts strings. This function normalizes the user token.
 */
function normalizeUserToken(userToken?: string | number): string | undefined {
  if (!userToken) {
    return undefined;
  }

  return typeof userToken === 'number' ? userToken.toString() : userToken;
}
