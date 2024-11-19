import { getInsightsAnonymousUserTokenInternal } from '../helpers';
import {
  warning,
  noop,
  getAppIdAndApiKey,
  find,
  safelyRunOnBrowser,
} from '../lib/utils';
import { createUUID } from '../lib/utils/uuid';

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
  insightsInitParams?: Partial<InsightsMethodMap['init'][0][0]>;
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

const ALGOLIA_INSIGHTS_VERSION = '2.17.2';
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

    let queuedInitParams: Partial<InsightsMethodMap['init'][0][0]> | undefined =
      undefined;
    let queuedUserToken: string | undefined = undefined;
    let userTokenBeforeInit: string | undefined = undefined;

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
      [queuedUserToken, queuedInitParams] = ['setUserToken', 'init'].map(
        (key) => {
          const [, value] =
            find(queue.slice().reverse(), ([method]) => method === key) || [];

          return value as any as NonNullable<typeof value>;
        }
      );
    }

    // If user called `aa('setUserToken')` before creating the Insights middleware,
    // we temporarily store the token and set it later on.
    //
    // Otherwise, the `init` call might override them with anonymous user token.
    insightsClient('getUserToken', null, (_error, userToken) => {
      userTokenBeforeInit = normalizeUserToken(userToken);
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

        const { queue: queueAtStart } = insightsClient;

        if (Array.isArray(queueAtStart)) {
          [queuedUserToken, queuedInitParams] = ['setUserToken', 'init'].map(
            (key) => {
              const [, value] =
                find(
                  queueAtStart.slice().reverse(),
                  ([method]) => method === key
                ) || [];

              return value;
            }
          );
        }

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

        function setUserToken(token: string | number) {
          setUserTokenToSearch(token, true);

          insightsClient('setUserToken', token);
        }

        let anonymousUserToken: string | undefined = undefined;
        const anonymousTokenFromInsights =
          getInsightsAnonymousUserTokenInternal();
        if (anonymousTokenFromInsights) {
          // When `aa('init', { ... })` is called, it creates an anonymous user token in cookie.
          // We can set it as userToken on instantsearch and insights. If it's not set as an insights
          // userToken before a sendEvent, insights automatically generates a new anonymous token,
          // causing a state change and an unnecessary query on instantsearch.
          anonymousUserToken = anonymousTokenFromInsights;
        } else {
          const token = `anonymous-${createUUID()}`;
          anonymousUserToken = token;
        }

        let userTokenFromInit: string | undefined;

        // With SSR, the token could be be set on the state. We make sure
        // that insights is in sync with that token since, there is no
        // insights lib on the server.
        const tokenFromSearchParameters = initialParameters.userToken;

        // When the first query is sent, the token is possibly not yet set by
        // the insights onChange callbacks (if insights isn't yet loaded).
        // It is explicitly being set here so that the first query has the
        // initial tokens set and ensure a second query isn't automatically
        // made when the onChange callback actually changes the state.
        if (insightsInitParams?.userToken) {
          userTokenFromInit = insightsInitParams.userToken;
        }

        if (userTokenFromInit) {
          setUserToken(userTokenFromInit);
        } else if (tokenFromSearchParameters) {
          setUserToken(tokenFromSearchParameters);
        } else if (userTokenBeforeInit) {
          setUserToken(userTokenBeforeInit);
        } else if (queuedUserToken) {
          setUserToken(queuedUserToken);
        } else if (anonymousUserToken) {
          setUserToken(anonymousUserToken);

          if (insightsInitParams?.useCookie || queuedInitParams?.useCookie) {
            saveTokenAsCookie(
              anonymousUserToken,
              insightsInitParams?.cookieDuration ||
                queuedInitParams?.cookieDuration
            );
          }
        }

        // This updates userToken which is set explicitly by `aa('setUserToken', userToken)`
        insightsClient(
          'onUserTokenChange',
          (token) => setUserTokenToSearch(token, true),
          {
            immediate: true,
          }
        );

        type InsightsClientWithLocalCredentials = <
          TMethod extends InsightsMethod
        >(
          method: TMethod,
          payload: InsightsMethodMap[TMethod][0][0]
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

        const viewedObjectIDs = new Set<string>();
        let lastQueryId: string | undefined;
        instantSearchInstance.mainHelper!.derivedHelpers[0].on(
          'result',
          ({ results }) => {
            if (!results.queryID || results.queryID !== lastQueryId) {
              lastQueryId = results.queryID;
              viewedObjectIDs.clear();
            }
          }
        );

        instantSearchInstance.sendEventToInsights = (event: InsightsEvent) => {
          if (onEvent) {
            onEvent(
              event,
              insightsClientWithLocalCredentials as TInsightsClient
            );
          } else if (event.insightsMethod) {
            if (event.insightsMethod === 'viewedObjectIDs') {
              const payload = event.payload as {
                objectIDs: string[];
              };
              const difference = payload.objectIDs.filter(
                (objectID) => !viewedObjectIDs.has(objectID)
              );
              if (difference.length === 0) {
                return;
              }
              difference.forEach((objectID) => viewedObjectIDs.add(objectID));
              payload.objectIDs = difference;
            }

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

function saveTokenAsCookie(token: string, cookieDuration?: number) {
  const MONTH = 30 * 24 * 60 * 60 * 1000;
  const d = new Date();
  d.setTime(d.getTime() + (cookieDuration || MONTH * 6));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `_ALGOLIA=${token};${expires};path=/`;
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
