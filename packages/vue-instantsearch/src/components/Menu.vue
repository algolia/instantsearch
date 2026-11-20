<script>
import { connectMenu } from 'instantsearch-core';
import { createMenuComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisMenu',
  mixins: [
    createSuitMixin({ name: 'Menu' }),
    createWidgetMixin(
      { connector: connectMenu },
      {
        $$widgetType: 'ais.menu',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    // TODO: implement searchable in connector
    // searchable: {
    //   type: Boolean,
    //   default: false,
    // },
    limit: {
      type: Number,
      default: undefined,
    },
    showMoreLimit: {
      type: Number,
      default: undefined,
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: [Array, Function],
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        sortBy: this.sortBy,
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
      return h(
        'div',
        {
          className: [
            this.suit(),
            !this.state.canRefine && this.suit('', 'noRefinement'),
          ],
        },
        [
          defaultSlot({
            items: this.state.items,
            canRefine: this.state.canRefine,
            canToggleShowMore: this.state.canToggleShowMore,
            isShowingMore: this.state.isShowingMore,
            refine: this.state.refine,
            createURL: this.state.createURL,
            toggleShowMore: this.state.toggleShowMore,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    const Menu = createMenuComponent({ createElement: h, Fragment });

    return h(Menu, {
      items: this.state.items,
      createURL: this.state.createURL,
      onRefine: (item) => this.state.refine(item.value),
      showMore: this.state.canRefine && this.showMore,
      canToggleShowMore: this.state.canToggleShowMore,
      isShowingMore: this.state.isShowingMore,
      onToggleShowMore: this.state.toggleShowMore,
      showMoreTextComponent: getScopedSlot(this, 'showMoreLabel'),
      classNames: this.classNames && {
        root: this.classNames['ais-Menu'],
        noRefinementRoot: this.classNames['ais-Menu--noRefinement'],
        list: this.classNames['ais-Menu-list'],
        item: this.classNames['ais-Menu-item'],
        selectedItem: this.classNames['ais-Menu-item--selected'],
        link: this.classNames['ais-Menu-link'],
        label: this.classNames['ais-Menu-label'],
        count: this.classNames['ais-Menu-count'],
        showMore: this.classNames['ais-Menu-showMore'],
        disabledShowMore: this.classNames['ais-Menu-showMore--disabled'],
      },
    });
  }),
};
</script>
