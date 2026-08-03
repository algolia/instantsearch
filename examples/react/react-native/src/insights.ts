import type { InsightsClient } from 'instantsearch.js';

type CreateInsightsClientOptions = {
  initialUserToken?: string;
};

type EventHeaders = {
  'X-Algolia-Application-Id'?: string;
  'X-Algolia-API-Key'?: string;
};

type EventExtraParams = {
  headers?: EventHeaders;
};

function inferEventType(method: string): 'click' | 'conversion' | 'view' {
  if (method.startsWith('clicked')) {
    return 'click';
  }
  if (method.startsWith('converted')) {
    return 'conversion';
  }
  return 'view';
}

/**
 * A minimal Algolia Insights client for React Native.
 *
 * The default behaviour of `insights={true}` injects the `search-insights` CDN
 * `<script>` and persists an anonymous token in `document.cookie` — neither of
 * which exist in React Native. This client instead posts events directly to the
 * Insights REST API with `fetch`, and keeps the user token in memory. Pass it as
 * `insights={{ insightsClient, insightsInitParams: { useCookie: false } }}`.
 *
 * Credentials are never stored here: the middleware extracts them from the
 * `searchClient` and provides them via `init` and as per-call headers (the
 * client reports itself as "modern", i.e. version >= 2.6).
 */
export function createInsightsClient({
  initialUserToken,
}: CreateInsightsClientOptions = {}): InsightsClient {
  let userToken: string | undefined = initialUserToken;
  let onUserTokenChange: ((token?: string) => void) | undefined;
  let appId: string | undefined;
  let apiKey: string | undefined;

  function sendEvents(events: unknown[], headers?: EventHeaders) {
    const eventAppId = headers?.['X-Algolia-Application-Id'] || appId;
    const eventApiKey = headers?.['X-Algolia-API-Key'] || apiKey;

    if (!eventAppId || !eventApiKey) {
      return;
    }

    fetch('https://insights.algolia.io/1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': eventAppId,
        'X-Algolia-API-Key': eventApiKey,
      },
      body: JSON.stringify({ events }),
    }).catch(() => {
      // Analytics are best-effort; never let a failed event break the UI.
    });
  }

  const client = (method: string, ...args: unknown[]): unknown => {
    switch (method) {
      case 'init': {
        const params = args[0] as
          | { appId?: string; apiKey?: string }
          | undefined;
        appId = params?.appId || appId;
        apiKey = params?.apiKey || apiKey;
        return undefined;
      }

      case 'addAlgoliaAgent':
        return undefined;

      case 'setUserToken': {
        userToken = args[0] as string;
        onUserTokenChange?.(userToken);
        return undefined;
      }

      case 'getUserToken': {
        const callback = args[1] as
          | ((error: unknown, token?: string) => void)
          | undefined;
        callback?.(null, userToken);
        return userToken;
      }

      case 'onUserTokenChange': {
        onUserTokenChange = args[0] as (token?: string) => void;
        const options = args[1] as { immediate?: boolean } | undefined;
        if (options?.immediate) {
          onUserTokenChange?.(userToken);
        }
        return undefined;
      }

      case 'sendEvents': {
        const extraParams = args[1] as EventExtraParams | undefined;
        sendEvents(args[0] as unknown[], extraParams?.headers);
        return undefined;
      }

      default: {
        const payload = args[0] as Record<string, unknown>;
        const extraParams = args[1] as EventExtraParams | undefined;
        sendEvents(
          [{ ...payload, eventType: inferEventType(method), userToken }],
          extraParams?.headers
        );
        return undefined;
      }
    }
  };

  // Marks the client as "modern" (>= 2.6) so the middleware skips the forced
  // `init` call and passes credentials per event instead.
  (client as InsightsClient).version = '2.17.2';

  return client as unknown as InsightsClient;
}
