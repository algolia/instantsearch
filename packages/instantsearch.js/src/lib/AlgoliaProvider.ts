import { createWidgetContainer } from './createWidgetContainer';
import { InstantSearchBase } from './InstantSearchBase';

import type { Middleware, SearchClient, Widget } from '../types';

export type AlgoliaProviderOptions = {
  /**
   * What the credentials are read from, like the search client of
   * `instantsearch()`: a search client, or any object it reads credentials
   * from, such as `{ appId, apiKey }`. It is never used to search.
   */
  searchClient: SearchClient | { appId: string; apiKey: string };
  /**
   * The main index of this implementation. Not used to search.
   */
  indexName?: string;
};

export type AlgoliaProvider = {
  /**
   * Whether `start()` has been called and `dispose()` hasn't.
   */
  readonly started: boolean;
  /**
   * Mounts widgets that don't run searches (`chat`, `chatTrigger`).
   */
  addWidgets(widgets: Array<Widget | Widget[]>): AlgoliaProvider;
  /**
   * Removes previously mounted widgets.
   */
  removeWidgets(widgets: Array<Widget | Widget[]>): AlgoliaProvider;
  /**
   * Hooks a middleware into the lifecycle, like `instantsearch().use()`. This
   * is how Insights is enabled: `provider.use(createInsightsMiddleware({ … }))`.
   */
  use(...middleware: Middleware[]): AlgoliaProvider;
  /**
   * Removes a middleware.
   */
  unuse(...middleware: Middleware[]): AlgoliaProvider;
  /**
   * Initializes and renders the mounted widgets.
   */
  start(): void;
  /**
   * Disposes of the mounted widgets.
   */
  dispose(): void;
};

const PROVIDER_INDEX_ID = 'algoliaProvider';

/**
 * A minimal stand-in for `instantsearch()` that hosts widgets which don't
 * search (`chat`, `chatTrigger`), without pulling in the search helper, the
 * routing and the index tree.
 *
 * It is `InstantSearchBase` with a container for the widgets, which is all an
 * instance needs when nothing searches.
 *
 * Widgets that depend on search state (`searchBox`, `hits`, recommend) are not
 * supported: they need the helper.
 */
export function algoliaProvider({
  searchClient,
  indexName,
}: AlgoliaProviderOptions): AlgoliaProvider {
  return new InstantSearchBase({
    client: searchClient,
    indexName: indexName ?? PROVIDER_INDEX_ID,
    mainIndex: createWidgetContainer({
      indexId: PROVIDER_INDEX_ID,
      indexName,
    }),
  }) as unknown as AlgoliaProvider;
}
