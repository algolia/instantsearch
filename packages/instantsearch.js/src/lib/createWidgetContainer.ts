import type { IndexWidget, InstantSearch, Widget } from '../types';

// There is no search helper. This is just enough of one for the parts that
// read it without searching: the index name of hit events, the React hooks, and
// the Insights middleware, which keeps the user token on the helper state.
function createHelper(index: string): any {
  const helper: Record<string, any> = {
    state: { index },
    lastResults: null,
    lastRecommendResults: null,
    _recommendCache: {},
    derivedHelpers: [{ on() {} }],
    overrideStateWithoutTriggeringChangeEvent(nextState: unknown) {
      helper.state = nextState;
    },
  };

  return helper;
}

/**
 * The root of an instance that doesn't search: it holds widgets, and
 * initializes and renders them the way the `index` widget does, minus the
 * helper, the search state and the nested indices.
 *
 * It has the shape of the `index` widget that the instance, the widgets and the
 * React hooks talk to, so it is given to `InstantSearchBase` as `mainIndex`.
 */
export function createWidgetContainer({
  indexId,
  indexName = '',
}: {
  indexId: string;
  indexName?: string;
}): IndexWidget {
  let widgets: Widget[] = [];
  const initialized = new Set<Widget>();
  let instance: InstantSearch | null = null;

  // There are never results: the React hooks only read them as a fallback.
  const results = {
    __isArtificial: true,
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    query: '',
    index: indexName || indexId,
  };

  function getOptions() {
    const helper = instance!.mainHelper;
    return {
      instantSearchInstance: instance,
      parent: container,
      helper,
      state: helper?.state,
      results: undefined,
      scopedResults: [],
      uiState: {},
      templatesConfig: instance!.templatesConfig,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
      status: 'idle',
      error: undefined,
    } as any;
  }

  // Same order as the index: every widget's render state is published before
  // any widget runs, so siblings can read each other's state.
  function publishRenderState(widget: Widget, options: any) {
    if (widget.getRenderState) {
      instance!.renderState[indexId] = widget.getRenderState(
        instance!.renderState[indexId] || {},
        options
      ) as any;
    }
  }

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

  function started() {
    return Boolean(instance?.started);
  }

  const container = {
    $$type: 'ais.index',
    getIndexId: () => indexId,
    getIndexName: () => indexName,
    getHelper: () => instance?.mainHelper ?? null,
    getResults: () => results,
    getScopedResults: () => [],
    getWidgets: () => widgets,
    getWidgetUiState: () => ({}),
    setIndexUiState: () => {},
    createURL: () => '#',
    init({ instantSearchInstance }: { instantSearchInstance: InstantSearch }) {
      instance = instantSearchInstance;
      instance.renderState[indexId] = {};
      if (!instance.mainHelper) {
        instance.mainHelper = createHelper(indexName || indexId);
        (instance as any).helper = instance.mainHelper;
      }
      initWidgets();
      // Nothing else triggers the first render: there is no search to wait for.
      instance.scheduleRender();
    },
    render() {
      renderWidgets();
    },
    dispose() {
      widgets.forEach((widget) => widget.dispose?.({} as any));
      widgets = [];
      initialized.clear();
    },
    addWidgets(newWidgets: Array<Widget | Widget[]>) {
      widgets = widgets.concat(newWidgets.flat());
      if (started()) {
        // Widgets added after start() are initialized and rendered right away.
        initWidgets();
        instance!.scheduleRender();
      }
      return container;
    },
    removeWidgets(oldWidgets: Array<Widget | Widget[]>) {
      const toRemove = oldWidgets.flat();
      widgets = widgets.filter((widget) => !toRemove.includes(widget));
      toRemove.forEach((widget) => {
        initialized.delete(widget);
        widget.dispose?.({} as any);
      });
      return container;
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
      if (started()) {
        initWidgets();
        instance!.scheduleRender();
      }
      return container;
    },
  };

  return container as unknown as IndexWidget;
}
