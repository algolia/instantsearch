import { openChat } from '../../lib/chat/openChat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
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
 * attributes (e.g. `name`, `title`) are used to label the item in the UI and
 * in the default comparison message.
 */
export type CompareItem = {
  objectID: string;
} & Record<string, unknown>;

export type CompareConnectorParams = {
  /**
   * Minimum number of items required before a comparison can start.
   * @default 2
   */
  minItems?: number;
  /**
   * Maximum number of items that can be selected. Adding an item beyond the
   * limit is a no-op until one is removed.
   * @default 3
   */
  maxItems?: number;
  /**
   * ID of the comparison configuration created in the Agent Studio dashboard
   * (Components > Comparison). When set, the chat hand-off sends the
   * `__INSTANTSEARCH_COMPARISON_<id>__` placeholder instead of a prose
   * message: the backend replaces it with the configuration's instructions
   * for the agent and a natural-language message for the transcript. Leave
   * unset to send the default prose message, which works with the default
   * shopping assistant prompt — no agent configuration required.
   */
  configurationId?: string;
  /**
   * Builds the user message sent to the chat when the comparison starts.
   * Defaults to the `configurationId` placeholder when one is set, and to a
   * message that names each selected item (name/title and objectID) so the
   * agent can retrieve them from the index and invoke the
   * `algolia_compare_products` tool otherwise. Provide your own to change the
   * initial prompt while keeping the rest of the flow.
   */
  getComparisonMessage?: (items: CompareItem[]) => string;
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
   * or when the `maxItems` limit is reached.
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
   * Whether more items can be added (the `maxItems` limit is not reached).
   */
  canAddItems: boolean;
  /**
   * Whether a comparison can start (at least `minItems` items are selected).
   */
  canCompare: boolean;
  /**
   * The resolved `minItems` value.
   */
  minItems: number;
  /**
   * The resolved `maxItems` value.
   */
  maxItems: number;
  /**
   * Opens the sibling `chat` widget and sends the comparison message for the
   * current selection. Returns `true` when the message was submitted (`false`
   * when the selection is too small, the chat is missing or busy).
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
 * configuration: the LLM gets the configured instructions and the transcript
 * keeps a natural-language message naming the selection.
 */
export function getComparisonPlaceholderMessage(
  configurationId: string
): string {
  return `__INSTANTSEARCH_COMPARISON_${configurationId}__`;
}

/**
 * Builds the default comparison message. It names each selected item so the
 * agent can ground the comparison: it re-retrieves the records with
 * `algolia_search_index` and renders them with the builtin
 * `algolia_compare_products` tool. Works with the default shopping assistant
 * prompt — no agent configuration required.
 */
export function getDefaultComparisonMessage(items: CompareItem[]): string {
  const labels = items.map((item) => {
    const name = item.name ?? item.title;
    return typeof name === 'string' && name !== ''
      ? `"${name}" (objectID: ${item.objectID})`
      : `the product with objectID "${item.objectID}"`;
  });

  return `Compare these products: ${labels.join(' vs ')}`;
}

// Turn-context payload for the comparison hand-off, per the Agent Studio
// contract: the selection rides `selected_products` (JSON-encoded records,
// `_`-prefixed internal metadata stripped) so the agent grounds the comparison
// in what the shopper actually selected, and `comparison_configuration_id`
// identifies the dashboard configuration when one is set.
function buildComparisonTurnContext(
  items: CompareItem[],
  configurationId: string | undefined
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
    ...(configurationId
      ? { comparison_configuration_id: configurationId }
      : {}),
  };
}

type CompareStore = {
  items: CompareItem[];
  listeners: Set<() => void>;
};

// The selection is shared by every `compare` widget of the same InstantSearch
// instance (per-hit toggles, the compare bar, a picker modal, ...), so it
// lives in a store keyed by the instance rather than in any single widget.
const compareStores = new WeakMap<InstantSearch, CompareStore>();

function getCompareStore(instantSearchInstance: InstantSearch): CompareStore {
  let store = compareStores.get(instantSearchInstance);
  if (!store) {
    store = { items: [], listeners: new Set() };
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
 * chat: `compare()` opens the sibling `chat` widget and sends a comparison
 * message naming the selected records, which the agent answers with the
 * grounded `algolia_compare_products` table.
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
    const {
      minItems = 2,
      maxItems = 3,
      configurationId,
      getComparisonMessage = configurationId
        ? (): string => getComparisonPlaceholderMessage(configurationId)
        : getDefaultComparisonMessage,
    } = widgetParams || {};

    if (minItems < 2) {
      throw new Error(withUsage('The `minItems` option must be at least 2.'));
    }

    if (maxItems < minItems) {
      throw new Error(
        withUsage('The `maxItems` option must be greater than `minItems`.')
      );
    }

    let lastOptions: InitOptions | RenderOptions | null = null;
    let unsubscribe: (() => void) | null = null;

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
        store.items.length >= maxItems ||
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
      if (!store || !lastOptions || store.items.length < minItems) {
        return false;
      }

      return openChat(getChatRenderState(lastOptions), {
        message: getComparisonMessage(store.items),
        referer: 'compare',
        turnContext: buildComparisonTurnContext(store.items, configurationId),
      });
    }

    return {
      $$type: 'ais.compare',
      opensChat: true as const,

      init(initOptions) {
        lastOptions = initOptions;

        const store = getCompareStore(initOptions.instantSearchInstance);
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
        unmountFn();
      },

      getWidgetRenderState(renderOptions) {
        lastOptions = renderOptions;
        const store = getCompareStore(renderOptions.instantSearchInstance);

        return {
          items: store.items,
          isSelected,
          addItem,
          removeItem,
          toggleItem,
          clearItems,
          canAddItems: store.items.length < maxItems,
          canCompare: store.items.length >= minItems,
          minItems,
          maxItems,
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
