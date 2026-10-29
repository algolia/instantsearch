import { createResultCardComponent } from 'instantsearch-ui-components';
import { connectResultCard } from 'instantsearch.js/es/connectors/index';

import { createHooksMixin } from '../mixins/hooks';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import {
  Fragment,
  getScopedSlot,
  isVue2,
  renderCompat,
  renderReactCompat,
  toRaw,
} from '../util/vue-compat';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-ResultCard'],
    header: classNames['ais-ResultCard-header'],
    headerTitle: classNames['ais-ResultCard-headerTitle'],
    minimizeButton: classNames['ais-ResultCard-minimizeButton'],
    body: classNames['ais-ResultCard-body'],
    loader: classNames['ais-ResultCard-loader'],
    message: classNames['ais-ResultCard-message'],
    suggestions: classNames['ais-ResultCard-suggestions'],
    expandButton: classNames['ais-ResultCard-expandButton'],
    continueButton: classNames['ais-ResultCard-continueButton'],
  };
}

// The default card, in its own component so that its hooks (a resize
// listener, an expansion timer) are cleaned up when a `layout` slot replaces
// it.
const AisResultCardUi = {
  name: 'AisResultCardUi',
  mixins: [createHooksMixin()],
  props: {
    // The shared component's props in one object: as props of this component,
    // its React-style `on*` callbacks would become listeners.
    uiProps: {
      type: Object,
      required: true,
    },
  },
  render: renderReactCompat(function (h) {
    const { useEffect, useState } = this.hooksStore.hooks;

    this.hooksStore.beginRender();

    const ResultCardUiComponent = this.getUiComponent('resultCard', () =>
      createResultCardComponent({
        createElement: h,
        Fragment,
        useState,
        useEffect,
      })
    );
    const tree = h(ResultCardUiComponent, this.uiProps);

    this.hooksStore.endRender();

    return tree;
  }),
};

/**
 * An AI answer about the current search, shown when a Rule managed by Agent
 * Studio enables it. "Continue in chat" hands the conversation to the
 * `<ais-chat>` with the same `agentId` on the index.
 *
 * The `layout` scoped slot replaces the whole card and receives the render
 * state, including the retry and handoff actions.
 */
export default {
  name: 'AisResultCard',
  mixins: [
    createWidgetMixin(
      { connector: connectResultCard },
      { $$widgetType: 'ais.resultCard' }
    ),
    createSuitMixin({ name: 'ResultCard' }),
  ],
  props: {
    agentId: {
      type: String,
      required: true,
    },
    /**
     * Custom endpoint, with the same shape as the `<ais-chat>` `transport`.
     * Mutually exclusive with `requestOptions`.
     */
    transport: {
      type: Object,
      required: false,
      default: undefined,
    },
    /**
     * Headers or query parameters for the built-in Agent Studio transport.
     */
    requestOptions: {
      type: Object,
      required: false,
      default: undefined,
    },
    translations: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  data() {
    // Kept across renders, so a minimized card stays minimized for new
    // queries until the widget is removed.
    return { minimized: false };
  },
  computed: {
    widgetParams() {
      // Forwarded as-is so the connector rejects `transport` + `requestOptions`.
      return {
        agentId: this.agentId,
        transport: this.transport,
        requestOptions: this.requestOptions,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null;
    }

    // Vue 3 wraps `this.state` in deep reactive proxies: like `AisChat`, render
    // the streamed messages from the raw render state.
    const state = toRaw(this.state);

    const layoutSlot = getScopedSlot(this, 'layout');
    if (layoutSlot) {
      const layout = layoutSlot({
        status: state.status,
        query: state.query,
        messages: state.messages,
        error: state.error,
        suggestions: state.suggestions,
        retry: state.retry,
        canContinueInChat: state.canContinueInChat,
        continueInChat: state.continueInChat,
        expanded: state.expanded,
        setExpanded: state.setExpanded,
        sendEvent: state.sendEvent,
      });

      // A Vue 2 component renders a single root element.
      return isVue2 && layout && layout.length > 1
        ? h('div', {}, layout)
        : layout;
    }

    return h(AisResultCardUi, {
      props: {
        uiProps: {
          classNames: mapClassNames(this.classNames),
          translations: this.translations,
          status: state.status,
          messages: state.messages,
          error: state.error,
          suggestions: state.suggestions,
          onRetry: state.retry,
          minimized: this.minimized,
          onToggleMinimize: () => {
            this.minimized = !this.minimized;
          },
          canContinueInChat: state.canContinueInChat,
          onContinueInChat: state.continueInChat,
          expanded: state.expanded,
          onExpandedChange: state.setExpanded,
        },
      },
    });
  }),
};
