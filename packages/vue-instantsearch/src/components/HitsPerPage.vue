<script>
import { connectHitsPerPage } from 'instantsearch-core';
import { createHitsPerPageComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisHitsPerPage',
  mixins: [
    createSuitMixin({ name: 'HitsPerPage' }),
    createWidgetMixin(
      {
        connector: connectHitsPerPage,
      },
      {
        $$widgetType: 'ais.hitsPerPage',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    items: {
      type: Array,
      required: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        items: this.items,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    if (defaultSlot) {
      return h('div', { className: this.suit() }, [
        defaultSlot({
          items: this.state.items,
          refine: this.state.refine,
          canRefine: this.state.canRefine,
          createURL: this.state.createURL,
        }),
      ]);
    }

    const HitsPerPage = createHitsPerPageComponent({
      createElement: h,
      Fragment,
    });
    const currentItem = this.state.items.find((item) => item.isRefined);

    return h(HitsPerPage, {
      classNames: this.classNames && {
        root: this.classNames['ais-HitsPerPage'],
        select: this.classNames['ais-HitsPerPage-select'],
        option: this.classNames['ais-HitsPerPage-option'],
      },
      items: this.state.items,
      currentValue: currentItem && currentItem.value,
      onChange: this.state.refine,
    });
  }),
};
</script>
