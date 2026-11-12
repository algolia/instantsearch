import { connectPromptSuggestions } from 'instantsearch-core';
import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

const NO_CHAT_WIDGET_MESSAGE =
  'No `ais-chat` widget is mounted on this index, so there is nothing to send a clicked suggestion to. Mount an `ais-chat` on the same index, or pass `onSuggestionClick` to handle the click yourself.';

// Connector params — forwarded to the connector, not the UI root.
const connectorProps = [
  'agentId',
  'transport',
  'configurationId',
  'transformHits',
  'context',
  'transformItems',
];

/**
 * Vue equivalent of react-instantsearch's `PromptSuggestions` and
 * instantsearch.js's `promptSuggestions` widget: the backend-generated prompt
 * pills rendered with the shared `createPromptSuggestionsComponent` factory.
 *
 * A clicked suggestion is handed to the `ais-chat` widget on the same index,
 * unless `onSuggestionClick` overrides the behavior (it receives the prompt
 * and a `sendToChat` helper to fall through to the default).
 *
 * Customize with the `layout` scoped slot / `layoutComponent` prop (owns the
 * full markup) or the `header` scoped slot / `headerComponent` prop (replaces
 * the header; `false` disables it).
 */
export default {
  name: 'AisPromptSuggestions',
  mixins: [
    createWidgetMixin(
      { connector: connectPromptSuggestions },
      { $$widgetType: 'ais.promptSuggestions' }
    ),
    createSuitMixin({ name: 'PromptSuggestions' }),
  ],
  props: {
    agentId: { type: String, required: false, default: undefined },
    transport: { type: Object, required: false, default: undefined },
    configurationId: { type: String, required: false, default: undefined },
    transformHits: { type: Function, required: false, default: undefined },
    context: { type: [Object, Function], required: false, default: undefined },
    transformItems: { type: Function, required: false, default: undefined },
    /**
     * Overrides the default click behavior (handoff to the chat widget).
     * Receives the prompt and a `sendToChat` callback you can use to fall
     * through to the default behavior after running custom logic.
     */
    onSuggestionClick: { type: Function, required: false, default: undefined },
    /**
     * Number of skeleton placeholder pills shown while loading.
     */
    skeletonCount: { type: Number, required: false, default: undefined },
    /**
     * Translations for the widget, e.g. `{ headerTitle: 'Ideas' }`.
     */
    translations: { type: Object, required: false, default: undefined },
    /**
     * CSS classes for the widget elements.
     */
    classNames: { type: Object, required: false, default: undefined },
    headerComponent: {
      type: [Function, Object, Boolean],
      required: false,
      default: undefined,
    },
    layoutComponent: {
      type: [Function, Object],
      required: false,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      // Only include defined options: the connector requires exactly one of
      // `agentId` / `transport` and distinguishes `undefined` from absent.
      const params = {};
      connectorProps.forEach((key) => {
        if (this[key] !== undefined) {
          params[key] = this[key];
        }
      });
      return params;
    },
  },
  methods: {
    /**
     * Resolves an overridable component: the scoped slot wins, then the prop.
     * Slot content is adapted to the React-style `(props) => element` contract
     * the shared components call, with the adapter cached per slot so its
     * identity stays stable across renders.
     */
    resolveComponent(slotName, propName) {
      if (!getScopedSlot(this, slotName)) {
        return this[propName];
      }
      if (!this.slotAdapters[slotName]) {
        this.slotAdapters[slotName] = (props) =>
          getScopedSlot(this, slotName)(props);
      }
      return this.slotAdapters[slotName];
    },
    handleSuggestionClick(prompt) {
      if (this.onSuggestionClick) {
        // `sendToChat` is only absent when the override owns the click, in
        // which case falling through to the chat is a no-op.
        this.onSuggestionClick(prompt, {
          sendToChat:
            this.state && this.state.sendToChat
              ? this.state.sendToChat
              : () => false,
        });
        return;
      }
      if (this.state) {
        this.state.onSuggestionClick(prompt);
      }
    },
  },
  created() {
    this.slotAdapters = {};
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const { suggestions, isLoading, error, sendToChat, isChatBusy } =
      this.state;

    if (!sendToChat && !this.onSuggestionClick) {
      throw new Error(NO_CHAT_WIDGET_MESSAGE);
    }

    if (!this.PromptSuggestionsComponent) {
      this.PromptSuggestionsComponent = createPromptSuggestionsComponent({
        createElement: h,
        Fragment,
      });
    }

    const layoutComponent = this.resolveComponent('layout', 'layoutComponent');
    if (layoutComponent) {
      return h(layoutComponent, {
        suggestions,
        isLoading,
        error,
        onSuggestionClick: (prompt) => this.handleSuggestionClick(prompt),
        isChatBusy,
      });
    }

    const resolvedHeaderComponent = this.resolveComponent(
      'header',
      'headerComponent'
    );
    let headerComponent;
    if (resolvedHeaderComponent === false) {
      headerComponent = false;
    } else if (resolvedHeaderComponent) {
      // The shared component calls it with the header props.
      headerComponent = (headerProps) => resolvedHeaderComponent(headerProps);
    }

    return h(this.PromptSuggestionsComponent, {
      suggestions,
      isLoading,
      onSuggestionClick: (prompt) => this.handleSuggestionClick(prompt),
      disabled: isChatBusy,
      skeletonCount: this.skeletonCount,
      translations: this.translations,
      classNames: this.classNames,
      headerComponent,
    });
  }),
};
