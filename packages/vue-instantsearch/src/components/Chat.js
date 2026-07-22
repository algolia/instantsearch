import {
  createChatComponent,
  createStickToBottom,
} from 'instantsearch-ui-components';
import { connectChat } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { createHooksStore } from '../util/hooks';
import { Fragment, isVue3, renderReactCompat } from '../util/vue-compat';

import { createDefaultTools } from './chat/tools';

export default {
  name: 'AisChat',
  mixins: [
    createWidgetMixin({ connector: connectChat }, { $$widgetType: 'ais.chat' }),
    createSuitMixin({ name: 'Chat' }),
  ],
  props: {
    // Transport (one of these is required by the connector)
    agentId: { type: String, required: false, default: undefined },
    transport: { type: Object, required: false, default: undefined },
    chat: { type: Object, required: false, default: undefined },
    // Connector options
    tools: { type: Object, required: false, default: undefined },
    initialMessages: { type: Array, required: false, default: undefined },
    initialUserMessage: { type: String, required: false, default: undefined },
    context: { type: [Object, Function], required: false, default: undefined },
    persistence: { type: Boolean, required: false, default: undefined },
    requiresSearch: { type: Boolean, required: false, default: undefined },
    resume: { type: Boolean, required: false, default: undefined },
    type: { type: String, required: false, default: undefined },
    disableTriggerValidation: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    // Rendering
    title: { type: String, required: false, default: undefined },
    itemComponent: { type: Function, required: false, default: undefined },
    getSearchPageURL: { type: Function, required: false, default: undefined },
    layoutComponent: { type: Function, required: false, default: undefined },
    classNames: { type: Object, required: false, default: undefined },
    translations: { type: Object, required: false, default: undefined },
  },
  created() {
    this.hooksStore = createHooksStore(() => this.$forceUpdate());
    this.useStickToBottom = createStickToBottom(this.hooksStore.hooks);
  },
  mounted() {
    this.hooksStore.flushEffects();
  },
  updated() {
    this.hooksStore.flushEffects();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.hooksStore.cleanup();
  },
  computed: {
    widgetParams() {
      const tools = Object.assign(
        {},
        createDefaultTools(this.itemComponent, this.getSearchPageURL),
        this.tools
      );

      // Only include defined options; the connector requires exactly one of
      // `chat` / `agentId` / `transport`.
      const params = { tools };
      const optional = {
        agentId: this.agentId,
        transport: this.transport,
        chat: this.chat,
        initialMessages: this.initialMessages,
        initialUserMessage: this.initialUserMessage,
        context: this.context,
        persistence: this.persistence,
        requiresSearch: this.requiresSearch,
        resume: this.resume,
        type: this.type,
        disableTriggerValidation: this.disableTriggerValidation,
      };
      Object.keys(optional).forEach((key) => {
        if (optional[key] !== undefined) {
          params[key] = optional[key];
        }
      });
      return params;
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const { useState, useRef, useEffect, memo } = this.hooksStore.hooks;

    this.hooksStore.beginRender();

    const ChatUiComponent = createChatComponent({
      createElement: h,
      Fragment,
      memo,
      useState,
    });

    const [maximized, setMaximized] = useState(false);
    const promptRef = useRef(null);
    const { scrollRef, contentRef, scrollToBottom, isAtBottom } =
      this.useStickToBottom({ initial: 'smooth', resize: 'smooth' });

    const state = this.state;

    // Focus the prompt when the chat transitions from closed to open.
    useEffect(() => {
      if (!this.wasOpen && state.open) {
        window.requestAnimationFrame(() => {
          if (promptRef.current) {
            promptRef.current.focus();
          }
        });
      }
      this.wasOpen = state.open;
    }, [state.open]);

    // Keep pinned to the bottom while streaming (carousels grow horizontally
    // without changing height, so re-pin on every message/status change).
    useEffect(() => {
      if (state.status === 'streaming' || state.status === 'submitted') {
        scrollToBottom({ preserveScrollPosition: true });
      }
    }, [state.messages, state.status, scrollToBottom]);

    const headerTranslations = this.translations && this.translations.header;
    const promptTranslations = this.translations && this.translations.prompt;
    const messageTranslations = this.translations && this.translations.message;
    const messagesTranslations =
      this.translations && this.translations.messages;

    const tree = h(ChatUiComponent, {
      title: this.title,
      open: state.open,
      maximized,
      sendMessage: state.sendMessage,
      regenerate: state.regenerate,
      stop: state.stop,
      error: state.error,
      layoutComponent: this.layoutComponent,
      classNames: this.classNames,
      headerProps: {
        onClose: () => state.setOpen(false),
        maximized,
        onToggleMaximize: () => setMaximized(!maximized),
        onClear: state.clearMessages,
        canClear: Boolean(state.messages && state.messages.length),
        translations: headerTranslations,
      },
      messagesProps: {
        status: state.status,
        onReload: (messageId) => state.regenerate({ messageId }),
        onNewConversation: state.clearMessages,
        onClose: () => state.setOpen(false),
        sendMessage: state.sendMessage,
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
        translations: messagesTranslations,
        messageTranslations,
        error: state.error,
      },
      promptProps: {
        promptRef,
        status: state.status,
        value: state.input,
        translations: promptTranslations,
        onInput: (event) => {
          state.setInput(event.currentTarget.value);
        },
        onSubmit: () => {
          state.sendMessage({ text: state.input });
          state.setInput('');
        },
        onStop: () => {
          state.stop();
        },
      },
      suggestionsProps: {
        suggestions: state.suggestions,
        onSuggestionClick: (suggestion) => {
          state.sendMessage({ text: suggestion });
        },
      },
    });

    this.hooksStore.endRender();

    return tree;
  }),
};
