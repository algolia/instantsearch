import {
  createChatComponent,
  createChatInlineLayoutComponent,
  createChatSidePanelLayoutComponent,
  createStickToBottom,
} from 'instantsearch-ui-components';
import { connectChat } from 'instantsearch.js/es/connectors/index';
import {
  focusAfterReveal,
  getActiveContainerAnimations,
  holdContainerInertUntilReveal,
  restoreContainerInertUntilReveal,
} from 'instantsearch.js/es/lib/chat/focusAfterReveal';

import { createHooksMixin } from '../mixins/hooks';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import {
  Fragment,
  getScopedSlot,
  renderReactCompat,
  toRaw,
} from '../util/vue-compat';

import { createDefaultTools, mergeToolOptions } from './chat/tools';

// Overridable pieces of the chat UI. Each one can be customized either with a
// scoped slot (idiomatic Vue) or with the matching `*Component` prop (a Vue
// component, or a render function returning VNodes — handy when sharing a
// component between flavors).
const overridableComponents = [
  { slot: 'layout', prop: 'layoutComponent' },
  { slot: 'header', prop: 'headerComponent' },
  { slot: 'prompt', prop: 'promptComponent' },
  { slot: 'suggestions', prop: 'suggestionsComponent' },
  { slot: 'empty', prop: 'emptyComponent' },
  { slot: 'loader', prop: 'loaderComponent' },
  { slot: 'actions', prop: 'actionsComponent' },
  { slot: 'error', prop: 'messagesErrorComponent' },
  { slot: 'reasoning', prop: 'reasoningComponent' },
  { slot: 'prompt-header', prop: 'promptHeaderComponent' },
  { slot: 'prompt-footer', prop: 'promptFooterComponent' },
];

// `*Component` props that have no slot counterpart (rarely customized).
const componentOnlyProps = [
  'headerTitleIconComponent',
  'headerCloseIconComponent',
  'headerMinimizeIconComponent',
  'headerMaximizeIconComponent',
  'assistantMessageLeadingComponent',
  'assistantMessageFooterComponent',
  'userMessageLeadingComponent',
  'userMessageFooterComponent',
];

const componentProp = {
  type: [Function, Object],
  required: false,
  default: undefined,
};

function createComponentProps() {
  return overridableComponents
    .map(({ prop }) => prop)
    .concat(componentOnlyProps)
    .reduce((props, name) => {
      props[name] = componentProp;
      return props;
    }, {});
}

/**
 * Resolves an overridable component: the scoped slot wins, then the prop.
 * Slot content is adapted to the React-style `(props) => element` contract the
 * shared components call. The adapter is created once per slot and reads the
 * current slot content when called, so its identity is stable across renders
 * (the shared components memoize finished messages on it).
 */
function resolveComponent(vm, slotName, propName) {
  if (!getScopedSlot(vm, slotName)) {
    return vm[propName];
  }
  if (!vm.slotAdapters[slotName]) {
    vm.slotAdapters[slotName] = (props) => getScopedSlot(vm, slotName)(props);
  }
  return vm.slotAdapters[slotName];
}

// Callback props forwarded through stable wrappers, so an inline handler
// (`:on-error="(error) => …"`) doesn't re-create the widget on every render.
const callbackProps = ['onToolCall', 'onFinish', 'onError', 'onData'];

function isPlainObject(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Structural equality for the widget params, like React's `useStableValue`:
 * plain objects and arrays are compared by content, everything else
 * (functions, `Chat` instances, transports' class instances) by reference.
 */
function isEqualWidgetParams(first, second) {
  if (first === second) {
    return true;
  }
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every((item, index) => isEqualWidgetParams(item, second[index]))
    );
  }
  if (isPlainObject(first) && isPlainObject(second)) {
    const keys = Object.keys(first);
    return (
      keys.length === Object.keys(second).length &&
      keys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(second, key) &&
          isEqualWidgetParams(first[key], second[key])
      )
    );
  }
  return false;
}

export default {
  name: 'AisChat',
  mixins: [
    createWidgetMixin(
      { connector: connectChat, isEqualWidgetParams },
      { $$widgetType: 'ais.chat' }
    ),
    createSuitMixin({ name: 'Chat' }),
    createHooksMixin(),
  ],
  props: Object.assign(
    {
      // Transport (one of `agentId` / `transport` / `chat` is required by the
      // connector)
      agentId: { type: String, required: false, default: undefined },
      transport: { type: Object, required: false, default: undefined },
      chat: { type: Object, required: false, default: undefined },
      feedback: { type: Boolean, required: false, default: undefined },
      requestOptions: { type: Object, required: false, default: undefined },
      id: { type: String, required: false, default: undefined },
      onToolCall: { type: Function, required: false, default: undefined },
      onFinish: { type: Function, required: false, default: undefined },
      onError: { type: Function, required: false, default: undefined },
      onData: { type: Function, required: false, default: undefined },
      // Connector options
      tools: { type: Object, required: false, default: undefined },
      initialMessages: { type: Array, required: false, default: undefined },
      initialUserMessage: { type: String, required: false, default: undefined },
      context: {
        type: [Object, Function],
        required: false,
        default: undefined,
      },
      persistence: {
        type: [Boolean, Object],
        required: false,
        default: undefined,
      },
      requiresSearch: { type: Boolean, required: false, default: undefined },
      resume: { type: Boolean, required: false, default: undefined },
      type: { type: String, required: false, default: undefined },
      disableTriggerValidation: {
        type: Boolean,
        required: false,
        default: false,
      },
      // Rendering
      title: { type: String, required: false, default: undefined },
      /**
       * Built-in layout: `overlay` (default), `inline` (always visible, so it
       * doesn't require an `ais-chat-trigger`) or `sidePanel`. Use the
       * `layout` slot / `layoutComponent` prop for a custom one.
       */
      layout: {
        type: String,
        required: false,
        default: 'overlay',
        validator: (value) =>
          ['overlay', 'inline', 'sidePanel'].indexOf(value) !== -1,
      },
      /**
       * Extra props for the built-in `layout`, e.g.
       * `{ parentElement: '#main' }` for `sidePanel`.
       */
      layoutProps: { type: Object, required: false, default: undefined },
      itemComponent: componentProp,
      getSearchPageURL: { type: Function, required: false, default: undefined },
      headerProps: { type: Object, required: false, default: undefined },
      messagesProps: { type: Object, required: false, default: undefined },
      promptProps: { type: Object, required: false, default: undefined },
      loaderPosition: { type: String, required: false, default: undefined },
      shouldShowLoader: { type: Function, required: false, default: undefined },
      loaderShowDelay: { type: Number, required: false, default: undefined },
      loaderMinDuration: { type: Number, required: false, default: undefined },
      showReasoning: { type: Boolean, required: false, default: undefined },
      translations: { type: Object, required: false, default: undefined },
    },
    createComponentProps()
  ),
  beforeCreate() {
    // Read by `widgetParams`, which the widget mixin's `created` evaluates
    // before this component's own `created` runs.
    this.defaultTools = {};
    this.callbackForwarders = {};
  },
  created() {
    this.useStickToBottom = createStickToBottom(this.hooksStore.hooks);
    this.slotAdapters = {};
    this.promptRef = { current: null };
    this.focusRequestId = 0;
    this.animationsBeforeReveal = [];
    this.renderedOpen = false;
  },
  beforeUpdate() {
    // Equivalent of React's `getSnapshotBeforeUpdate`: capture the container
    // animations before the DOM is patched, so a reveal transition that's
    // already running when the prompt gets focus isn't cut short.
    this.animationsBeforeReveal = getActiveContainerAnimations(
      this.promptRef.current
    );
    this.openBeforeUpdate = this.renderedOpen;
  },
  updated() {
    if (!this.openBeforeUpdate && this.renderedOpen) {
      holdContainerInertUntilReveal(this.promptRef.current);
    } else if (this.renderedOpen) {
      restoreContainerInertUntilReveal(this.promptRef.current);
    }
  },
  computed: {
    isInlineLayout() {
      // Inline layouts are always visible, so they don't require an
      // `ais-chat-trigger` (or AI mode). Custom layouts opt in through the same
      // `$$inlineLayout` marker the other flavors use.
      const layoutComponent = this.layoutComponent;
      return (
        this.layout === 'inline' ||
        Boolean(layoutComponent && layoutComponent.$$inlineLayout === true)
      );
    },
    widgetParams() {
      const tools = mergeToolOptions(
        this.getDefaultTools(Boolean(this.getSearchPageURL)),
        this.tools
      );

      // Only include defined options: the connector requires exactly one of
      // `chat` / `agentId` / `transport`, and distinguishes `undefined` from
      // absent for some options.
      const params = {
        tools,
        disableTriggerValidation:
          this.disableTriggerValidation || this.isInlineLayout,
      };
      const optional = {
        agentId: this.agentId,
        transport: this.transport,
        chat: this.chat,
        feedback: this.feedback,
        requestOptions: this.requestOptions,
        id: this.id,
        initialMessages: this.initialMessages,
        initialUserMessage: this.initialUserMessage,
        context: this.context,
        persistence: this.persistence,
        requiresSearch: this.requiresSearch,
        resume: this.resume,
        type: this.type,
      };
      Object.keys(optional).forEach((key) => {
        if (optional[key] !== undefined) {
          params[key] = optional[key];
        }
      });
      callbackProps.forEach((key) => {
        if (this[key] !== undefined) {
          params[key] = this.getCallbackForwarder(key);
        }
      });
      return params;
    },
  },
  methods: {
    /**
     * The renderer for result items in the tool carousels/tables: the `item`
     * scoped slot, then the `itemComponent` prop, or `undefined` to let each
     * shared tool apply its own default.
     */
    getItemComponent() {
      return resolveComponent(this, 'item', 'itemComponent');
    },
    /**
     * The default tools, created once per `getSearchPageURL` presence (it
     * toggles the "View all" link). They only hold stable getters, read at
     * render time, so `item` slot or `getSearchPageURL` changes don't
     * re-create the tools (and with them the widget).
     */
    getDefaultTools(hasSearchPageURL) {
      const key = String(hasSearchPageURL);
      if (!this.defaultTools[key]) {
        this.defaultTools[key] = createDefaultTools(
          this.getItemComponent,
          hasSearchPageURL
            ? (...args) => this.getSearchPageURL(...args)
            : undefined
        );
      }
      return this.defaultTools[key];
    },
    getCallbackForwarder(key) {
      if (!this.callbackForwarders[key]) {
        this.callbackForwarders[key] = (...args) => this[key](...args);
      }
      return this.callbackForwarders[key];
    },
    // Imperative API, the counterpart of React's `ChatHandle`.
    setOpen(open) {
      if (this.state) {
        this.state.setOpen(open);
      }
    },
    sendMessage(params) {
      if (this.state) {
        this.scrollToBottom();
        return this.state.sendMessage(params);
      }
      return undefined;
    },
    setInput(input) {
      if (this.state) {
        this.state.setInput(input);
      }
    },
    scrollToBottom() {
      if (this.stickToBottom) {
        this.stickToBottom.scrollToBottom();
      }
    },
    requestPromptFocus() {
      const currentFocusRequestId = ++this.focusRequestId;
      const previousAnimations = this.animationsBeforeReveal;
      const { promptRef } = this;

      holdContainerInertUntilReveal(promptRef.current);
      window.requestAnimationFrame(() => {
        const prompt = promptRef.current;
        focusAfterReveal(
          prompt,
          previousAnimations,
          () =>
            this.focusRequestId === currentFocusRequestId &&
            promptRef.current === prompt,
          () => this.focusRequestId === currentFocusRequestId
        );
      });
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const { useEffect, useMemo, useState } = this.hooksStore.hooks;

    this.hooksStore.beginRender();

    // `useMemo` lets the shared component skip re-rendering finished messages
    // on every streaming delta. The memoized VNodes are reused across renders,
    // which both Vue versions support: Vue 2 skips a subtree whose vnode is
    // identical, Vue 3 clones it and skips components whose props didn't
    // change. The per-message hook calls come after the fixed ones, so the
    // store's call-order cells stay aligned as the conversation grows.
    const ChatUiComponent = this.getUiComponent('chat', () =>
      createChatComponent({
        createElement: h,
        Fragment,
        useMemo,
        useState,
        useEffect,
      })
    );

    // Vue 3 wraps `this.state` in deep reactive proxies. The chat runtime
    // relies on object identity (`~addToolResultForMessage` settles a tool
    // call on the message object it holds, tools carry Vue component
    // definitions), so render from the raw render state. Reading `this.state`
    // first keeps the dependency tracked.
    const state = toRaw(this.state);
    const open = state.open;
    const consumeInputFocus = state['~consumeInputFocus'];
    const isOpenStatePersistenceEnabled =
      state['~isOpenStatePersistenceEnabled'];

    const [maximized, setMaximized] = useState(false);
    const stickToBottom = this.useStickToBottom({
      initial: 'smooth',
      resize: 'smooth',
    });
    this.stickToBottom = stickToBottom;
    const { scrollRef, contentRef, scrollToBottom, isAtBottom } = stickToBottom;

    const sendMessageAndScrollToBottom = (...args) => {
      scrollToBottom();
      return state.sendMessage(...args);
    };

    // Focus the prompt when the connector asks for it (the chat was opened
    // through a trigger, `focusInput`, …), once the reveal animation is over.
    useEffect(() => {
      if (!open) {
        this.focusRequestId++;
        return;
      }
      if (consumeInputFocus && consumeInputFocus()) {
        this.requestPromptFocus();
      }
    });

    // Keep the conversation pinned to the bottom while streaming. The stick-
    // to-bottom ResizeObserver only reacts to content *height* changes, but
    // tool results such as a horizontally-growing carousel stream in without
    // changing height — so also re-pin on every message/status update.
    // `preserveScrollPosition` keeps the "only if already at the bottom" gate,
    // so this never fights a user who has scrolled up to read.
    useEffect(() => {
      if (state.status === 'streaming' || state.status === 'submitted') {
        scrollToBottom({ preserveScrollPosition: true });
      }
    }, [state.messages, state.status, scrollToBottom]);

    const translations = this.translations || {};
    const components = overridableComponents.reduce((acc, { slot, prop }) => {
      acc[prop] = resolveComponent(this, slot, prop);
      return acc;
    }, {});

    let layoutComponent = components.layoutComponent;
    if (!layoutComponent && this.layout !== 'overlay') {
      const BuiltInLayout = this.getUiComponent(`layout:${this.layout}`, () =>
        (this.layout === 'inline'
          ? createChatInlineLayoutComponent
          : createChatSidePanelLayoutComponent)({
          createElement: h,
          Fragment,
        })
      );
      const layoutProps = this.layoutProps;
      layoutComponent = layoutProps
        ? (props) => h(BuiltInLayout, Object.assign({}, props, layoutProps))
        : BuiltInLayout;
    }

    const userMessagesProps = this.messagesProps || {};
    const {
      assistantMessageProps: callerAssistantMessageProps,
      userMessageProps: callerUserMessageProps,
      ...restMessagesProps
    } = userMessagesProps;
    const userPromptProps = this.promptProps || {};

    const tree = h(ChatUiComponent, {
      title: this.title,
      open,
      maximized,
      sendMessage: sendMessageAndScrollToBottom,
      regenerate: state.regenerate,
      stop: state.stop,
      error: state.error,
      layoutComponent,
      headerComponent: components.headerComponent,
      promptComponent: components.promptComponent,
      suggestionsComponent: components.suggestionsComponent,
      classNames: this.classNames,
      headerProps: Object.assign(
        {
          onClose: () => state.setOpen(false),
          maximized,
          onToggleMaximize: () => setMaximized(!maximized),
          onClear: state.clearMessages,
          canClear: Boolean(state.messages && state.messages.length),
          titleIconComponent: this.headerTitleIconComponent,
          closeIconComponent: this.headerCloseIconComponent,
          minimizeIconComponent: this.headerMinimizeIconComponent,
          maximizeIconComponent: this.headerMaximizeIconComponent,
          translations: translations.header,
        },
        this.headerProps
      ),
      messagesProps: Object.assign(
        {
          status: state.status,
          onReload: (messageId) => state.regenerate({ messageId }),
          onNewConversation: state.clearMessages,
          onClose: () => state.setOpen(false),
          sendMessage: sendMessageAndScrollToBottom,
          setInput: state.setInput,
          onFeedback: state.sendChatMessageFeedback,
          feedbackState: state.feedbackState,
          messages: state.messages,
          tools: state.tools,
          indexUiState: state.indexUiState,
          setIndexUiState: state.setIndexUiState,
          isScrollAtBottom: isAtBottom,
          scrollRef,
          contentRef,
          onScrollToBottom: scrollToBottom,
          loaderComponent: components.loaderComponent,
          loaderPosition: this.loaderPosition,
          shouldShowLoader: this.shouldShowLoader,
          loaderShowDelay: this.loaderShowDelay,
          loaderMinDuration: this.loaderMinDuration,
          errorComponent: components.messagesErrorComponent,
          emptyComponent: components.emptyComponent,
          actionsComponent: components.actionsComponent,
          translations: translations.messages,
          messageTranslations: translations.message,
        },
        // The message props merge key by key rather than replace, so the
        // dedicated props still apply for keys the caller leaves unset.
        restMessagesProps,
        {
          assistantMessageProps: Object.assign(
            {
              leadingComponent: this.assistantMessageLeadingComponent,
              footerComponent: this.assistantMessageFooterComponent,
              showReasoning: this.showReasoning,
              reasoningComponent: components.reasoningComponent,
            },
            callerAssistantMessageProps
          ),
          userMessageProps: Object.assign(
            {
              leadingComponent: this.userMessageLeadingComponent,
              footerComponent: this.userMessageFooterComponent,
            },
            callerUserMessageProps
          ),
          error: state.error,
        }
      ),
      promptProps: Object.assign(
        {
          promptRef: this.promptRef,
          status: state.status,
          value: state.input,
          translations: translations.prompt,
          onInput: (event) => {
            state.setInput(event.currentTarget.value);
          },
          onSubmit: () => {
            sendMessageAndScrollToBottom({ text: state.input });
            state.setInput('');
          },
          onStop: () => {
            state.stop();
          },
          headerComponent: components.promptHeaderComponent,
          footerComponent: components.promptFooterComponent,
        },
        userPromptProps,
        {
          autoFocus:
            userPromptProps.autoFocus !== undefined
              ? userPromptProps.autoFocus
              : !isOpenStatePersistenceEnabled || this.isInlineLayout,
        }
      ),
      suggestionsProps: {
        suggestions: state.suggestions,
        onSuggestionClick: (suggestion) => {
          sendMessageAndScrollToBottom({ text: suggestion });
        },
      },
    });

    this.hooksStore.endRender();
    this.renderedOpen = open;

    return tree;
  }),
};
