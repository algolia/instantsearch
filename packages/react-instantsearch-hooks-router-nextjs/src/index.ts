import history from 'instantsearch.js/es/lib/routers/history';
import { warn } from 'react-instantsearch-hooks';

import type { Router, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type { Router as NextRouter, SingletonRouter } from 'next/router';

warn(
  Date.now() < new Date('2023-08-09').getTime(),
  'The package `react-instantsearch-hooks-router-nextjs` is replaced by `react-instantsearch-router-nextjs`. The API is the same, but the package name has changed. Please update your dependencies.'
);

type BeforePopStateCallback = NonNullable<NextRouter['_bps']>;
type NextHistoryState = Parameters<BeforePopStateCallback>[0];

type CreateInstantSearchRouterNextOptions<TRouteState> = {
  /**
   * The Next.js singleton router instance.
   *
   * @example
   * import singletonRouter from 'next/router';
   * import { createInstantSearchNextRouter } from 'react-instantsearch-hooks-router-nextjs';
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
   * See https://www.algolia.com/doc/api-reference/widgets/history-router/react-hooks/
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
      getLocation() {
        return new URL(serverUrl!) as unknown as Location;
      },
      ...routerOptions,
    });
  }

  const router: Router<TRouteState> & { _isNextRouter?: boolean } = history({
    start(onUpdate) {
      if (beforeStart) {
        beforeStart(onUpdate);
      }

      const initialPathname = singletonRouter.pathname;
      handler = () => {
        // Without this check, we would trigger an unnecessary search when navigating
        // to a page without InstantSearch
        if (singletonRouter.pathname === initialPathname) {
          onUpdate();
        }
      };
      singletonRouter.events.on('routeChangeComplete', handler);

      if (singletonRouter.router?._bps) {
        ownBeforePopState = singletonRouter.router._bps;
      }

      function libraryBeforePopState() {
        const previousPathname = singletonRouter.asPath.split('?')[0];
        let nextPathname = new URL(window.location.href).pathname;

        // We strip the locale from the pathname if it's present
        if (singletonRouter.locale) {
          nextPathname = nextPathname.replace(
            previousPathname === '/'
              ? singletonRouter.locale
              : `/${singletonRouter.locale}`,
            ''
          );
        }

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
      let url = newUrl;
      // We need to do this because there's an error when using i18n on the root path
      // it says for example `pages/fr.js` doesn't exist
      if (singletonRouter.locale) {
        url = url.replace(`/${singletonRouter.locale}`, '');
      }

      // No need to provide the second argument, Next.js will know what to do
      singletonRouter.push(url, undefined, {
        shallow: true,
      });
    },
    ...routerOptions,
  });
  router._isNextRouter = true;
  router.$$type = 'ais.nextjs';

  return router;
}
