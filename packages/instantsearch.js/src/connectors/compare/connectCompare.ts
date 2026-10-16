import { openChat } from '../../lib/chat/openChat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';

import type {
  Connector,
  InitOptions,
  InstantSearch,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from '../chat/connectChat';

const withUsage = createDocumentationMessageGenerator({
  name: 'compare',
  connector: true,
});

/**
 * A record selected for comparison. Only `objectID` is required — the other
 * attributes (e.g. `name`, `title`) label the item in the UI and travel to the
 * agent in the turn context.
 */
export type CompareItem = {
  objectID: string;
} & Record<string, unknown>;

export type CompareConnectorParams = {
  /**
   * Minimum number of items required before a comparison can start.
   *
   * The limits apply to the selection shared by every `compare` widget of the
   * InstantSearch instance, so set them on the widget that owns the hand-off
   * (the `compareBar` widget). Every other `compare` widget (per-hit toggles)
   * reads the shared value and can leave it out. While the widget that set it
   * is mounted, its value is used by all widgets; it is dropped when that
   * widget is disposed. Two widgets setting different values trigger a
   * development warning.
   * @default 2
   */
  minItems?: number;
  /**
   * Maximum number of items that can be selected. Adding an item beyond the
   * limit is a no-op until one is removed. Shared like `minItems`: set it on
   * the `compareBar` widget, other `compare` widgets read it from there.
   * @default 3
   */
  maxItems?: number;
  /**
   * ID of the comparison configuration created in the Agent Studio dashboard
   * (Components > Comparison). The chat hand-off sends the
   * `__ALGOLIA_COMPARISON_<id>__` placeholder, which the backend replaces
   * with the configuration's instructions for the agent; the chat shows no
   * user message for it, so the shopper goes straight to the comparison.
   *
   * Required to start a comparison. Set it on the widget that triggers the
   * hand-off (the `compareBar` widget); the other `compare` widgets of the
   * same InstantSearch instance (per-hit toggles) share it and can leave it
   * out. It is removed when the widget that set it is disposed.
   */
  configurationId?: string;
};

export type CompareRenderState = {
  /**
   * Ordered selection, one entry per record (insertion order).
   */
  items: CompareItem[];
  /**
   * Whether a record is currently selected.
   */
  isSelected: (objectID: string) => boolean;
  /**
   * Adds a record to the selection. No-op when the record is already selected
   * or when the shared `maxItems` limit is reached.
   */
  addItem: (item: CompareItem) => void;
  /**
   * Removes a record from the selection.
   */
  removeItem: (objectID: string) => void;
  /**
   * Adds the record when unselected, removes it otherwise.
   */
  toggleItem: (item: CompareItem) => void;
  /**
   * Clears the whole selection.
   */
  clearItems: () => void;
  /**
   * Whether more items can be added (the shared `maxItems` limit is not
   * reached).
   */
  canAddItems: boolean;
  /**
   * Whether a comparison can start (at least the shared `minItems` items are
   * selected).
   */
  canCompare: boolean;
  /**
   * The `minItems` limit in effect for the shared selection: the value set by
   * a mounted `compare` widget (typically the `compareBar`), otherwise 2.
   */
  minItems: number;
  /**
   * The `maxItems` limit in effect for the shared selection: the value set by
   * a mounted `compare` widget (typically the `compareBar`), otherwise 3.
   */
  maxItems: number;
  /**
   * Opens the sibling `chat` widget and sends the comparison placeholder for
   * the current selection. Returns `true` when the message was submitted
   * (`false` when the selection is too small, the chat is missing or busy).
   * Throws when no mounted `compare` widget of the instance set a
   * `configurationId`.
   */
  compare: () => boolean;
  widgetParams: CompareConnectorParams;
};

export type CompareWidgetDescription = {
  $$type: 'ais.compare';
  renderState: CompareRenderState;
  indexRenderState: {
    compare: WidgetRenderState<CompareRenderState, CompareConnectorParams>;
  };
};

export type CompareConnector = Connector<
  CompareWidgetDescription,
  CompareConnectorParams
>;

/**
 * Builds the placeholder message for a dashboard-configured comparison. The
 * Agent Studio backend resolves it against the agent's comparison
 * configuration: the LLM gets the configured instructions, and the persisted
 * user row holds no text, so the chat renders no user bubble for the hand-off.
 */
export function getComparisonPlaceholderMessage(
  configurationId: string
): string {
  return `__ALGOLIA_COMPARISON_${configurationId}__`;
}

// Turn-context payload for the comparison hand-off, per the Agent Studio
// contract: the selection rides `selected_products` (JSON-encoded records,
// `_`-prefixed internal metadata stripped) so the agent grounds the comparison
// in what the shopper actually selected — both the agent and the builtin
// `algolia_compare_products` table read them, no search round-trip needed —
// and `comparison_configuration_id` identifies the dashboard configuration.
function buildComparisonTurnContext(
  items: CompareItem[],
  configurationId: string
): Record<string, string> {
  const records = items.map((item) => {
    const clean: Record<string, unknown> = {};
    Object.keys(item).forEach((key) => {
      if (!key.startsWith('_')) {
        clean[key] = item[key];
      }
    });
    return clean;
  });

  return {
    selected_products: JSON.stringify(records),
    comparison_configuration_id: configurationId,
  };
}

const DEFAULT_MIN_ITEMS = 2;
const DEFAULT_MAX_ITEMS = 3;

// What a single widget contributes to the shared configuration.
type CompareConfig = {
  configurationId?: string;
  minItems?: number;
  maxItems?: number;
};

type CompareStore = {
  items: CompareItem[];
  listeners: Set<() => void>;
  // Configuration contributed by each mounted widget, keyed by the widget so
  // that disposing it removes exactly what it added. Read by every widget of
  // the instance through `resolveConfig`.
  configs: Map<object, CompareConfig>;
};

function resolveConfig(store: CompareStore): {
  configurationId?: string;
  minItems: number;
  maxItems: number;
} {
  const resolved: CompareConfig = {};
  // Later contributors win; conflicts are reported when they register.
  store.configs.forEach((config) => {
    (['configurationId', 'minItems', 'maxItems'] as const).forEach((key) => {
      if (config[key] !== undefined) {
        (resolved as Record<string, unknown>)[key] = config[key];
      }
    });
  });
  return {
    configurationId: resolved.configurationId,
    minItems: resolved.minItems ?? DEFAULT_MIN_ITEMS,
    maxItems: resolved.maxItems ?? DEFAULT_MAX_ITEMS,
  };
}

// The selection is shared by every `compare` widget of the same InstantSearch
// instance (per-hit toggles, the compare bar, a picker modal, ...), so it
// lives in a store keyed by the instance rather than in any single widget.
const compareStores = new WeakMap<InstantSearch, CompareStore>();

function getCompareStore(instantSearchInstance: InstantSearch): CompareStore {
  let store = compareStores.get(instantSearchInstance);
  if (!store) {
    store = { items: [], listeners: new Set(), configs: new Map() };
    compareStores.set(instantSearchInstance, store);
  }
  return store;
}

// Reads the sibling chat widget's render state from the live cross-index
// `instantSearchInstance.renderState` map. Resolved at call time so that
// `compare` always sees the latest `open`/`sendMessage` values.
function getChatRenderState(
  options: InitOptions | RenderOptions
): ChatRenderState | undefined {
  const indexId = options.parent?.getIndexId();
  if (!indexId) return undefined;
  return options.instantSearchInstance.renderState[indexId]?.chat;
}

/**
 * Compare connector.
 *
 * Owns the "products selected for comparison" state and the hand-off into the
 * chat: `compare()` opens the sibling `chat` widget and sends the configured
 * comparison's placeholder with the selected records in the turn context,
 * which the agent answers with the grounded `algolia_compare_products` table.
 *
 * The selection is shared across all `compare` widgets mounted on the same
 * InstantSearch instance, so per-hit "Compare" toggles and the `compareBar`
 * widget stay in sync. The widget is marked with `opensChat`, so it satisfies
 * the `chat` widget's entry-point validation.
 */
const connectCompare: CompareConnector = function connectCompare(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const { minItems, maxItems, configurationId } = widgetParams || {};

    if (minItems !== undefined && minItems < 2) {
      throw new Error(withUsage('The `minItems` option must be at least 2.'));
    }

    if (maxItems !== undefined && maxItems < (minItems ?? DEFAULT_MIN_ITEMS)) {
      throw new Error(
        withUsage('The `maxItems` option must be greater than `minItems`.')
      );
    }

    let lastOptions: InitOptions | RenderOptions | null = null;
    let unsubscribe: (() => void) | null = null;
    // Identity under which this widget's configuration is stored.
    const owner = {};

    function getStore(): CompareStore | null {
      if (!lastOptions) return null;
      return getCompareStore(lastOptions.instantSearchInstance);
    }

    // Re-renders every subscribed `compare` widget, then schedules a full
    // render so anything else reading `renderState.compare` catches up.
    function notify(store: CompareStore) {
      store.listeners.forEach((listener) => listener());
      lastOptions?.instantSearchInstance.scheduleRender();
    }

    function isSelected(objectID: string): boolean {
      const store = getStore();
      return Boolean(store?.items.some((item) => item.objectID === objectID));
    }

    function addItem(item: CompareItem) {
      const store = getStore();
      if (
        !store ||
        store.items.length >= resolveConfig(store).maxItems ||
        isSelected(item.objectID)
      ) {
        return;
      }
      store.items = [...store.items, item];
      notify(store);
    }

    function removeItem(objectID: string) {
      const store = getStore();
      if (!store || !isSelected(objectID)) return;
      store.items = store.items.filter((item) => item.objectID !== objectID);
      notify(store);
    }

    function toggleItem(item: CompareItem) {
      if (isSelected(item.objectID)) {
        removeItem(item.objectID);
      } else {
        addItem(item);
      }
    }

    function clearItems() {
      const store = getStore();
      if (!store || store.items.length === 0) return;
      store.items = [];
      notify(store);
    }

    function compare(): boolean {
      const store = getStore();
      if (!store || !lastOptions) return false;

      const config = resolveConfig(store);
      if (store.items.length < config.minItems) {
        return false;
      }

      if (!config.configurationId) {
        throw new Error(
          withUsage(
            'The `configurationId` option is required to start a comparison. Set it on the `compareBar` widget to the ID of a comparison configuration created in the Agent Studio dashboard (Components > Comparison).'
          )
        );
      }

      return openChat(getChatRenderState(lastOptions), {
        message: getComparisonPlaceholderMessage(config.configurationId),
        referer: 'compare',
        turnContext: buildComparisonTurnContext(
          store.items,
          config.configurationId
        ),
      });
    }

    return {
      $$type: 'ais.compare',
      opensChat: true as const,

      init(initOptions) {
        lastOptions = initOptions;

        const store = getCompareStore(initOptions.instantSearchInstance);
        const contribution: CompareConfig = {};
        if (configurationId !== undefined) {
          contribution.configurationId = configurationId;
        }
        if (minItems !== undefined) contribution.minItems = minItems;
        if (maxItems !== undefined) contribution.maxItems = maxItems;

        (['configurationId', 'minItems', 'maxItems'] as const).forEach(
          (key) => {
            if (contribution[key] === undefined) return;
            store.configs.forEach((other) => {
              warning(
                other[key] === undefined || other[key] === contribution[key],
                withUsage(
                  `Several \`compare\` widgets set a different \`${key}\` (${String(
                    other[key]
                  )} and ${String(
                    contribution[key]
                  )}). The selection is shared, so set it on a single widget (the \`compareBar\`); the last one mounted is used.`
                )
              );
            });
          }
        );
        if (Object.keys(contribution).length > 0) {
          store.configs.set(owner, contribution);
        }
        const listener = () => {
          if (!lastOptions) return;
          renderFn(
            {
              ...this.getWidgetRenderState(lastOptions),
              instantSearchInstance: lastOptions.instantSearchInstance,
            },
            false
          );
        };
        store.listeners.add(listener);
        unsubscribe = () => store.listeners.delete(listener);

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        lastOptions = renderOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unsubscribe?.();
        unsubscribe = null;
        // Only remove what this widget contributed. The selection itself stays:
        // toggles unmount and remount as hits re-render or paginate.
        const store = getStore();
        if (store?.configs.delete(owner)) {
          // The remaining widgets may now resolve different limits.
          notify(store);
        }
        unmountFn();
      },

      getWidgetRenderState(renderOptions) {
        lastOptions = renderOptions;
        const store = getCompareStore(renderOptions.instantSearchInstance);
        const config = resolveConfig(store);

        return {
          items: store.items,
          isSelected,
          addItem,
          removeItem,
          toggleItem,
          clearItems,
          canAddItems: store.items.length < config.maxItems,
          canCompare: store.items.length >= config.minItems,
          minItems: config.minItems,
          maxItems: config.maxItems,
          compare,
          widgetParams: widgetParams || {},
        };
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          compare: this.getWidgetRenderState(renderOptions),
        };
      },
    };
  };
};

export default connectCompare;
