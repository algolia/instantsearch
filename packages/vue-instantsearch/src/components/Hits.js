import { createHitsComponent } from 'instantsearch-ui-components';
import { connectHits } from 'instantsearch.js/es/connectors';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectHits,
      },
      {
        $$widgetType: 'ais.hits',
      }
    ),
    createSuitMixin({ name: 'Hits' }),
  ],
  props: {
    showBanner: {
      type: Boolean,
      default: true,
    },
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
    widgetParams() {
      return {
        showBanner: this.showBanner,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    const itemSlot = getScopedSlot(this, 'item');
    const bannerSlot = getScopedSlot(this, 'banner');

    const itemComponent = ({
      hit,
      index,
      onClick,
      onAuxClick,
      // We don't want to pass the Preact key as a prop
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
          (itemSlot &&
            itemSlot({
              item: hit,
              index,
              sendEvent: this.state.sendEvent,
            })) ||
            `objectID: ${hit.objectID}, index: ${index}`,
        ]
      );
    };

    // We only want to render the default slot
    // if no other slots are defined
    if (!itemSlot && !bannerSlot && defaultSlot) {
      return h(
        'div',
        {
          attrs: {
            class: this.suit(),
          },
        },
        [
          defaultSlot({
            banner: this.state.banner,
            items: this.state.items,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    return h(createHitsComponent({ createElement: h }), {
      hits: this.state.items,
      itemComponent,
      banner: this.showBanner ? this.state.banner : undefined,
      bannerComponent: bannerSlot,
      sendEvent: this.state.sendEvent,
      classNames: this.classNames && {
        root: this.classNames['ais-Hits'],
        list: this.classNames['ais-Hits-list'],
        item: this.classNames['ais-Hits-item'],
        bannerRoot: this.classNames['ais-Hits-banner'],
        bannerImage: this.classNames['ais-Hits-banner-image'],
        bannerLink: this.classNames['ais-Hits-banner-link'],
      },
    });
  }),
};
