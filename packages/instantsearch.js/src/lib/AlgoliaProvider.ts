import type { InstantSearch, Middleware, Widget } from '../types';

export type AlgoliaProviderOptions = {
  /**
   * Your Algolia application ID.
   */
  appId: string;
  /**
   * A search-only API key.
   */
  apiKey: string;
  /**
   * The user agent suffix sent with Agent Studio requests.
   */
  algoliaAgent?: string;
  /**
   * The main index of this implementation. Not used to search.
   */
  indexName?: string;
};

export type AlgoliaProvider = {
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
 * It implements only the part of the `InstantSearch` instance those widgets
 * read: the credentials, the shared `renderState` (how `chatTrigger` finds
 * `chat`), `scheduleRender` and `templatesConfig`.
 *
 * Widgets that depend on search state (`searchBox`, `hits`, recommend) are not
 * supported: they need the helper.
 */
export function createAlgoliaProvider({
  appId,
  apiKey,
  algoliaAgent = 'algolia-provider',
  indexName,
}: AlgoliaProviderOptions): AlgoliaProvider {
  let widgets: Widget[] = [];
  let middleware: Array<{
    creator: Middleware;
    instance: ReturnType<Middleware> & {
      subscribe(): void;
      started(): void;
      unsubscribe(): void;
    };
  }> = [];
  const listeners: Array<{
    event: string;
    listener: (...args: any[]) => void;
    once: boolean;
  }> = [];
  const createdAt = Date.now();
  const initialized = new Set<Widget>();
  let started = false;
  let renderScheduled = false;

  const renderState: Record<string, Record<string, unknown>> = {
    [PROVIDER_INDEX_ID]: {},
  };

  // `getAppIdAndApiKey` and `getAlgoliaAgent` read these two shapes.
  const client = {
    appId,
    apiKey,
    transporter: { userAgent: { value: algoliaAgent } },
  };

  const parent = {
    getIndexId: () => PROVIDER_INDEX_ID,
    setIndexUiState: () => {},
  };

  // There is no search helper. This is just enough of one for the parts that
  // read it without searching: the index name of hit events, and the Insights
  // middleware, which keeps the user token on the helper state.
  const helper: Record<string, any> = {
    state: { index: indexName ?? PROVIDER_INDEX_ID },
    lastResults: null,
    _recommendCache: {},
    derivedHelpers: [{ on() {} }],
    overrideStateWithoutTriggeringChangeEvent(nextState: unknown) {
      helper.state = nextState;
    },
  };

  const instance = {
    client,
    indexName,
    mainHelper: helper,
    mainIndex: { getWidgets: () => widgets },
    get middleware() {
      return middleware;
    },
    renderState,
    status: 'idle',
    templatesConfig: { helpers: {}, compileOptions: {} },
    sendEventToInsights: () => {},
    getUiState: () => ({ [PROVIDER_INDEX_ID]: {} }),
    scheduleSearch: () => {},
    use: (...newMiddleware: Middleware[]) => {
      useMiddleware(...newMiddleware);
      return instance;
    },
    unuse: (...oldMiddleware: Middleware[]) => {
      unuseMiddleware(...oldMiddleware);
      return instance;
    },
    _createdAt: createdAt,
    _initialResults: null,
    _initialOptions: undefined,
    emit(event: string, ...args: any[]) {
      listeners
        .filter((entry) => entry.event === event)
        .forEach((entry) => {
          if (entry.once) {
            listeners.splice(listeners.indexOf(entry), 1);
          }
          entry.listener(...args);
        });
      return instance;
    },
    on(event: string, listener: (...args: any[]) => void) {
      listeners.push({ event, listener, once: false });
      return instance;
    },
    once(event: string, listener: (...args: any[]) => void) {
      listeners.push({ event, listener, once: true });
      return instance;
    },
    removeListener(event: string, listener: (...args: any[]) => void) {
      const index = listeners.findIndex(
        (entry) => entry.event === event && entry.listener === listener
      );
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      return instance;
    },
    scheduleRender: () => {
      if (!started || renderScheduled) {
        return;
      }
      renderScheduled = true;
      Promise.resolve().then(() => {
        renderScheduled = false;
        renderWidgets();
      });
    },
  } as unknown as InstantSearch;

  function useMiddleware(...newMiddleware: Middleware[]) {
    const created = newMiddleware.map((creator) => {
      const entry = {
        $$type: '__unknown__',
        $$internal: false,
        subscribe() {},
        started() {},
        unsubscribe() {},
        onStateChange() {},
        ...creator({ instantSearchInstance: instance as any }),
      };
      middleware.push({ creator, instance: entry as any });
      return entry;
    });
    if (started) {
      created.forEach((entry) => {
        entry.subscribe();
        entry.started();
      });
    }
  }

  function unuseMiddleware(...oldMiddleware: Middleware[]) {
    middleware
      .filter((entry) => oldMiddleware.includes(entry.creator))
      .forEach((entry) => entry.instance.unsubscribe());
    middleware = middleware.filter(
      (entry) => !oldMiddleware.includes(entry.creator)
    );
  }

  function getOptions() {
    return {
      instantSearchInstance: instance,
      parent,
      helper,
      state: helper.state,
      results: undefined,
      scopedResults: [],
      uiState: {},
      templatesConfig: instance.templatesConfig,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
      status: 'idle',
      error: undefined,
    } as any;
  }

  // Mirrors what the index does after each widget lifecycle call: the widget's
  // render state is published so siblings can read it.
  function publishRenderState(widget: Widget, options: any) {
    if (widget.getRenderState) {
      renderState[PROVIDER_INDEX_ID] = widget.getRenderState(
        renderState[PROVIDER_INDEX_ID] as any,
        options
      ) as Record<string, unknown>;
    }
  }

  // Same order as the index: every widget's render state is published before
  // any widget runs, so siblings can read each other's state.
  function initWidgets() {
    const options = getOptions();
    const pending = widgets.filter((widget) => !initialized.has(widget));
    pending.forEach((widget) => publishRenderState(widget, options));
    pending.forEach((widget) => {
      initialized.add(widget);
      widget.init?.(options);
    });
  }

  function renderWidgets() {
    const options = getOptions();
    widgets.forEach((widget) => publishRenderState(widget, options));
    widgets.forEach((widget) => widget.render?.(options));
    instance.emit('render');
  }

  const provider: AlgoliaProvider = {
    addWidgets(newWidgets) {
      widgets = widgets.concat(newWidgets.flat());
      if (started) {
        // Widgets added after start() are initialized and rendered right away.
        initWidgets();
        renderWidgets();
      }
      return provider;
    },
    removeWidgets(oldWidgets) {
      const toRemove = oldWidgets.flat();
      widgets = widgets.filter((widget) => !toRemove.includes(widget));
      toRemove.forEach((widget) => {
        initialized.delete(widget);
        widget.dispose?.({} as any);
      });
      return provider;
    },
    use(...newMiddleware) {
      useMiddleware(...newMiddleware);
      return provider;
    },
    unuse(...oldMiddleware) {
      unuseMiddleware(...oldMiddleware);
      return provider;
    },
    start() {
      if (started) {
        return;
      }
      started = true;
      middleware.forEach((entry) => entry.instance.subscribe());
      initWidgets();
      middleware.forEach((entry) => entry.instance.started());
      renderWidgets();
    },
    dispose() {
      middleware.forEach((entry) => entry.instance.unsubscribe());
      widgets.forEach((widget) => widget.dispose?.({} as any));
      widgets = [];
      initialized.clear();
      started = false;
    },
  };

  return provider;
}
