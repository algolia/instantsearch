import type { InstantSearch, Widget } from '../types';

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
}: AlgoliaProviderOptions): AlgoliaProvider {
  let widgets: Widget[] = [];
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

  // The search helper is only read by the search-driven parts of the chat
  // (applying filters, hit events), which have nothing to act on here.
  const helper = {
    state: { index: PROVIDER_INDEX_ID },
    lastResults: null,
  };

  const instance = {
    client,
    mainIndex: undefined,
    renderState,
    status: 'idle',
    templatesConfig: { helpers: {}, compileOptions: {} },
    sendEventToInsights: () => {},
    getUiState: () => ({ [PROVIDER_INDEX_ID]: {} }),
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
  }

  const provider: AlgoliaProvider = {
    addWidgets(newWidgets) {
      widgets = widgets.concat(newWidgets.flat() as Widget[]);
      if (started) {
        // Widgets added after start() are initialized and rendered right away.
        initWidgets();
        renderWidgets();
      }
      return provider;
    },
    removeWidgets(oldWidgets) {
      const toRemove = oldWidgets.flat() as Widget[];
      widgets = widgets.filter((widget) => !toRemove.includes(widget));
      toRemove.forEach((widget) => {
        initialized.delete(widget);
        widget.dispose?.({} as any);
      });
      return provider;
    },
    start() {
      if (started) {
        return;
      }
      started = true;
      initWidgets();
      renderWidgets();
    },
    dispose() {
      widgets.forEach((widget) => widget.dispose?.({} as any));
      widgets = [];
      initialized.clear();
      started = false;
    },
  };

  return provider;
}
