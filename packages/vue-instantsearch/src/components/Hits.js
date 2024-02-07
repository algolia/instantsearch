import { createHits } from 'instantsearch-ui-components';
import { connectHitsWithInsights } from 'instantsearch.js/es/connectors';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { renderCompat } from '../util/vue-compat';

export default {
  name: 'AisHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectHitsWithInsights,
      },
      {
        $$widgetType: 'ais.hits',
      }
    ),
    createSuitMixin({ name: 'Hits' }),
  ],
  props: {
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    items() {
      return this.state.hits;
    },
    widgetParams() {
      return {
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const itemComponent = ({
      hit,
      index,
      onClick,
      onAuxClick,
      // FIXME: Should this be removed by augmentCreateElement?
      key: _key,
      ...rootProps
    }) => {
      return h(
        'li',
        {
          key: hit.objectID,
          attrs: rootProps,
          on: {
            click: onClick,
            auxclick: onAuxClick,
          },
        },
        [
          // FIXME: This is not compatible with Vue 3?
          (this.$scopedSlots.item &&
            this.$scopedSlots.item({
              item: hit,
              index,
              insights: this.state.insights,
              sendEvent: this.state.sendEvent,
            })) ||
            `objectID: ${hit.objectID}, index: ${index}`,
        ]
      );
    };

    if (this.$scopedSlots.default) {
      return h(
        'div',
        {
          attrs: {
            class: this.suit(),
          },
        },
        [
          // FIXME: This is not compatible with Vue 3?
          this.$scopedSlots.default({
            items: this.state.hits,
            insights: this.state.insights,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    return h(createHits({ createElement: h }), {
      hits: this.state.hits,
      itemComponent,
      sendEvent: this.state.sendEvent,
      classNames: this.classNames && {
        root: this.classNames['ais-Hits'],
        list: this.classNames['ais-Hits-list'],
        item: this.classNames['ais-Hits-item'],
      },
    });
  }),
};
