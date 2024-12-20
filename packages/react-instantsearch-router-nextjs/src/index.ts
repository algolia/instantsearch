import { historyRouter as history } from 'instantsearch-core';

import { stripLocaleFromUrl } from './utils/stripLocaleFromUrl';

import type { Router, UiState, BrowserHistoryArgs } from 'instantsearch-core';
import type { Router as NextRouter, SingletonRouter } from 'next/router';

type BeforePopStateCallback = NonNullable<NextRouter['_bps']>;
type NextHistoryState = Parameters<BeforePopStateCallback>[0];

type CreateInstantSearchRouterNextOptions<TRouteState> = {
  /**
   * The Next.js singleton router instance.
   *
   * @example
   * import singletonRouter from 'next/router';
   * import { createInstantSearchNextRouter } from 'react-instantsearch-router-nextjs';
   *
   * const router = createInstantSearchNextRouter({ singletonRouter });
   */
  singletonRouter: SingletonRouter;

  /**
   * Required URL when rendering on the server.
   */
  serverUrl?: string;

  /**
   * If you need to add additional logic to the `beforePopState` method of the Next.js router,
   * you can use this option.
   **/
  beforePopState?: (options: {
    /**
     * The Next.js router's `beforePopState` method.
     */
    state: NextHistoryState;
    /**
     * The library's default `beforePopState` method.
     * It returns `false` if staying on the same page to avoid unnecessary SSR.
     */
    libraryBeforePopState: BeforePopStateCallback;
    /**
     * Your own `beforePopState` method if you had set one before.
     * You can use it to compose your own logic for whether to call SSR or not.
     */
    ownBeforePopState: BeforePopStateCallback;
  }) => boolean;

  /**
   * Called before the router starts.
   * Useful to add additional logic if you need the router to tell InstantSearch when to update.
   */
  beforeStart?: BrowserHistoryArgs<TRouteState>['start'];

  /**
   * Called before the router disposes.
   * Useful to detach what was attached in `beforeStart`.
   */
  beforeDispose?: () => void;

  /**
   * Options passed to the underlying history router.
   * See https://www.algolia.com/doc/api-reference/widgets/history-router/react/
   * for the list of available options.
   */
  routerOptions?: Partial<
    Omit<BrowserHistoryArgs<TRouteState>, 'start' | 'dispose'>
  >;
};

export function createInstantSearchRouterNext<TRouteState = UiState>(
  options: CreateInstantSearchRouterNextOptions<TRouteState>
): Router<TRouteState> {
  const {
    beforePopState,
    singletonRouter,
    serverUrl,
    beforeStart,
    beforeDispose,
    routerOptions,
  } = options || {};
  let handler: () => void;
  let ownBeforePopState: BeforePopStateCallback = () => true;

  // If we're rendering on the server, we create a simpler router
  if (typeof window === 'undefined') {
    return history({
      getCurrentURL() {
        return new URL(serverUrl!);
      },
      ...routerOptions,
    });
  }

  /**
   * Marker to skip `routeChangeComplete` event when the push comes from the router itself.
   */
  let lastPushFromThis = false;

  const router: Router<TRouteState> & { _isNextRouter?: boolean } = history({
    start(onUpdate) {
      if (beforeStart) {
        beforeStart(onUpdate);
      }

      const initialPathname = singletonRouter.pathname;
      handler = () => {
        // Without this check, we would trigger an unnecessary search when navigating
        // to a page without InstantSearch
        if (singletonRouter.pathname === initialPathname && !lastPushFromThis) {
          onUpdate();
        }
        lastPushFromThis = false;
      };
      singletonRouter.events.on('routeChangeComplete', handler);

      if (singletonRouter.router?._bps) {
        ownBeforePopState = singletonRouter.router._bps;
      }

      function libraryBeforePopState() {
        const previousPathname = singletonRouter.asPath.split('?')[0];
        let nextPathname = new URL(window.location.href).pathname;

        // We strip the locale from the pathname if it's present
        nextPathname = stripLocaleFromUrl(
          nextPathname,
          singletonRouter.locale,
          previousPathname !== '/'
        );

        // We only want to trigger a server request when going back/forward to a different page
        return previousPathname !== nextPathname;
      }

      singletonRouter.beforePopState((state) => {
        if (beforePopState) {
          return beforePopState({
            state,
            libraryBeforePopState,
            ownBeforePopState,
          });
        }

        return libraryBeforePopState();
      });
    },
    dispose() {
      if (beforeDispose) {
        beforeDispose();
      }

      singletonRouter.events.off('routeChangeComplete', handler);
      singletonRouter.beforePopState(ownBeforePopState);
    },
    push(newUrl) {
      // We need to do this because there's an error when using i18n on the
      // root path it says for example `pages/fr.js` doesn't exist
      const url = stripLocaleFromUrl(newUrl, singletonRouter.locale);

      // No need to provide the second argument, Next.js will know what to do
      singletonRouter.push(url, undefined, {
        shallow: true,
      });
      lastPushFromThis = true;
    },
    ...routerOptions,
  });
  router._isNextRouter = true;
  router.$$type = 'ais.nextjs';

  return router;
}
