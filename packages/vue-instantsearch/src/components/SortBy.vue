<script>
import { connectSortBy } from 'instantsearch-core';
import { createSortByComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisSortBy',
  mixins: [
    createSuitMixin({ name: 'SortBy' }),
    createWidgetMixin(
      { connector: connectSortBy },
      {
        $$widgetType: 'ais.sortBy',
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
          items: this.state.options,
          refine: this.state.refine,
          currentRefinement: this.state.currentRefinement,
          canRefine: this.state.canRefine,
        }),
      ]);
    }

    const SortBy = createSortByComponent({ createElement: h, Fragment });

    return h(SortBy, {
      classNames: this.classNames && {
        root: this.classNames['ais-SortBy'],
        select: this.classNames['ais-SortBy-select'],
        option: this.classNames['ais-SortBy-option'],
      },
      items: this.state.options,
      value: this.state.currentRefinement,
      onChange: this.state.refine,
    });
  }),
};
</script>
