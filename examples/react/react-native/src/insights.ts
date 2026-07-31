import type { InsightsClient } from 'instantsearch.js';

type InitParams = {
  appId: string;
  apiKey: string;
  initialUserToken?: string;
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
 */
export function createInsightsClient({
  appId,
  apiKey,
  initialUserToken,
}: InitParams): InsightsClient {
  let userToken: string | undefined = initialUserToken;
  let onUserTokenChange: ((token?: string) => void) | undefined;

  function sendEvents(events: unknown[]) {
    fetch('https://insights.algolia.io/1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({ events }),
    }).catch(() => {
      // Analytics are best-effort; never let a failed event break the UI.
    });
  }

  const client = (method: string, ...args: unknown[]): unknown => {
    switch (method) {
      case 'init':
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
        sendEvents(args[0] as unknown[]);
        return undefined;
      }

      default: {
        const payload = args[0] as Record<string, unknown>;
        sendEvents([
          { ...payload, eventType: inferEventType(method), userToken },
        ]);
        return undefined;
      }
    }
  };

  // Marks the client as "modern" (>= 2.6) so the middleware skips the forced
  // `init` call and passes credentials per event instead.
  (client as InsightsClient).version = '2.17.2';

  return client as unknown as InsightsClient;
}
