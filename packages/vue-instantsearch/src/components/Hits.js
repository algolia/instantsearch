import { connectHits } from 'instantsearch-core';
import { createHitsComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

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
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        showBanner: this.showBanner,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    const itemSlot = getScopedSlot(this, 'item');
    const bannerSlot = getScopedSlot(this, 'banner');

    // We only want to render the default slot
    // if no other slots are defined
    if (!itemSlot && !bannerSlot && defaultSlot) {
      return h(
        'div',
        { className: this.suit() },
        defaultSlot({
          banner: this.state.banner,
          items: this.state.items,
          sendEvent: this.state.sendEvent,
        })
      );
    }

    const HitsUiComponent = createHitsComponent({ createElement: h, Fragment });

    return h(HitsUiComponent, {
      hits: this.state.items,
      // Without an `item` slot, the shared component renders its default hit.
      itemComponent:
        itemSlot &&
        (({ hit, index, ...rootProps }) =>
          h(
            'li',
            rootProps,
            itemSlot({
              item: hit,
              index,
              sendEvent: this.state.sendEvent,
            })
          )),
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
