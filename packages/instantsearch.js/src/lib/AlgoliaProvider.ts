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
 * It implements only the part of the `InstantSearch` instance those widgets
 * (and the React hooks wrapping them) read: the credentials, the shared
 * `renderState` (how `chatTrigger` finds `chat`), `scheduleRender`,
 * `templatesConfig`, the middleware lifecycle and a main index to attach
 * widgets to.
 *
 * Widgets that depend on search state (`searchBox`, `hits`, recommend) are not
 * supported: they need the helper.
 */
export function algoliaProvider({
  searchClient,
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

  const client = searchClient;

  // There is no search helper. This is just enough of one for the parts that
  // read it without searching: the index name of hit events, and the Insights
  // middleware, which keeps the user token on the helper state.
  const helper: Record<string, any> = {
    state: { index: indexName ?? PROVIDER_INDEX_ID },
    lastResults: null,
    lastRecommendResults: null,
    _recommendCache: {},
    derivedHelpers: [{ on() {} }],
    overrideStateWithoutTriggeringChangeEvent(nextState: unknown) {
      helper.state = nextState;
    },
  };

  // There are never results: the React hooks only read them as a fallback.
  const results = {
    __isArtificial: true,
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    query: '',
    index: indexName ?? PROVIDER_INDEX_ID,
  };

  function getOptions() {
    return {
      instantSearchInstance: provider,
      parent: mainIndex,
      helper,
      state: helper.state,
      results: undefined,
      scopedResults: [],
      uiState: {},
      templatesConfig: provider.templatesConfig,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
      status: 'idle',
      error: undefined,
    } as any;
  }

  // Mirrors what the index does after each widget lifecycle call: the widget's
  // render state is published so siblings can read it.
  function publishRenderState(widget: Widget, widgetOptions: any) {
    if (widget.getRenderState) {
      renderState[PROVIDER_INDEX_ID] = widget.getRenderState(
        renderState[PROVIDER_INDEX_ID] as any,
        widgetOptions
      ) as Record<string, unknown>;
    }
  }

  // Same order as the index: every widget's render state is published before
  // any widget runs, so siblings can read each other's state.
  function initWidgets() {
    const widgetOptions = getOptions();
    const pending = widgets.filter((widget) => !initialized.has(widget));
    pending.forEach((widget) => publishRenderState(widget, widgetOptions));
    pending.forEach((widget) => {
      initialized.add(widget);
      widget.init?.(widgetOptions);
    });
  }

  function renderWidgets() {
    const widgetOptions = getOptions();
    widgets.forEach((widget) => publishRenderState(widget, widgetOptions));
    widgets.forEach((widget) => widget.render?.(widgetOptions));
    provider.emit('render');
  }

  function addWidgets(newWidgets: Array<Widget | Widget[]>) {
    widgets = widgets.concat(newWidgets.flat());
    if (started) {
      // Widgets added after start() are initialized and rendered right away.
      initWidgets();
      renderWidgets();
    }
  }

  function removeWidgets(oldWidgets: Array<Widget | Widget[]>) {
    const toRemove = oldWidgets.flat();
    widgets = widgets.filter((widget) => !toRemove.includes(widget));
    toRemove.forEach((widget) => {
      initialized.delete(widget);
      widget.dispose?.({} as any);
    });
  }

  function useMiddleware(...newMiddleware: Middleware[]) {
    const created = newMiddleware.map((creator) => {
      const entry = {
        $$type: '__unknown__',
        $$internal: false,
        subscribe() {},
        started() {},
        unsubscribe() {},
        onStateChange() {},
        ...creator({ instantSearchInstance: provider as any }),
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

  // The part of an index the widgets and the React hooks talk to.
  const mainIndex = {
    getIndexId: () => PROVIDER_INDEX_ID,
    getIndexName: () => indexName ?? '',
    getHelper: () => helper,
    getResults: () => results,
    getScopedResults: () => [],
    getWidgets: () => widgets,
    getWidgetUiState: () => ({}),
    setIndexUiState: () => {},
    createURL: () => '#',
    addWidgets(newWidgets: Array<Widget | Widget[]>) {
      addWidgets(newWidgets);
      return mainIndex;
    },
    removeWidgets(oldWidgets: Array<Widget | Widget[]>) {
      removeWidgets(oldWidgets);
      return mainIndex;
    },
    updateWidget(previousWidget: Widget, nextWidget: Widget) {
      const position = widgets.indexOf(previousWidget);
      initialized.delete(previousWidget);
      previousWidget.dispose?.({} as any);
      if (position === -1) {
        widgets = widgets.concat(nextWidget);
      } else {
        widgets = widgets.slice();
        widgets[position] = nextWidget;
      }
      if (started) {
        initWidgets();
        renderWidgets();
      }
      return mainIndex;
    },
  };

  // Both the public API and the instance the widgets and middleware receive,
  // like `InstantSearch` is.
  const provider = {
    client,
    indexName,
    mainIndex,
    mainHelper: helper,
    helper,
    renderState,
    status: 'idle',
    error: undefined,
    templatesConfig: { helpers: {}, compileOptions: {} },
    sendEventToInsights: () => {},
    getUiState: () => ({ [PROVIDER_INDEX_ID]: {} }),
    setUiState: () => {},
    refresh: () => {},
    scheduleSearch: () => {},
    _createdAt: createdAt,
    _initialResults: null,
    _initialOptions: undefined,
    get middleware() {
      return middleware;
    },
    get started() {
      return started;
    },
    scheduleRender() {
      if (!started || renderScheduled) {
        return;
      }
      renderScheduled = true;
      Promise.resolve().then(() => {
        renderScheduled = false;
        renderWidgets();
      });
    },
    emit(event: string, ...args: any[]) {
      listeners
        .filter((entry) => entry.event === event)
        .forEach((entry) => {
          if (entry.once) {
            listeners.splice(listeners.indexOf(entry), 1);
          }
          entry.listener(...args);
        });
      return provider;
    },
    on(event: string, listener: (...args: any[]) => void) {
      listeners.push({ event, listener, once: false });
      return provider;
    },
    // What the React hooks subscribe with.
    addListener(event: string, listener: (...args: any[]) => void) {
      return provider.on(event, listener);
    },
    once(event: string, listener: (...args: any[]) => void) {
      listeners.push({ event, listener, once: true });
      return provider;
    },
    removeListener(event: string, listener: (...args: any[]) => void) {
      const index = listeners.findIndex(
        (entry) => entry.event === event && entry.listener === listener
      );
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      return provider;
    },
    addWidgets(newWidgets: Array<Widget | Widget[]>) {
      addWidgets(newWidgets);
      return provider;
    },
    removeWidgets(oldWidgets: Array<Widget | Widget[]>) {
      removeWidgets(oldWidgets);
      return provider;
    },
    use(...newMiddleware: Middleware[]) {
      useMiddleware(...newMiddleware);
      return provider;
    },
    unuse(...oldMiddleware: Middleware[]) {
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

  return provider as unknown as AlgoliaProvider;
}
