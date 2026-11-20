<script>
import { connectHierarchicalMenu } from 'instantsearch-core';
import { createHierarchicalMenuComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisHierarchicalMenu',
  mixins: [
    createSuitMixin({ name: 'HierarchicalMenu' }),
    createWidgetMixin(
      {
        connector: connectHierarchicalMenu,
      },
      {
        $$widgetType: 'ais.hierarchicalMenu',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attributes: {
      type: Array,
      required: true,
    },
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
    separator: {
      type: String,
      default: undefined,
    },
    rootPath: {
      type: String,
      default: undefined,
    },
    showParentLevel: {
      type: Boolean,
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
        attributes: this.attributes,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        separator: this.separator,
        rootPath: this.rootPath,
        showParentLevel: this.showParentLevel,
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

    const HierarchicalMenu = createHierarchicalMenuComponent({
      createElement: h,
      Fragment,
    });

    return h(HierarchicalMenu, {
      items: this.state.items,
      createURL: this.state.createURL,
      onRefine: (item) => this.state.refine(item.value),
      showMore: this.showMore,
      canToggleShowMore: this.state.canToggleShowMore,
      isShowingMore: this.state.isShowingMore,
      onToggleShowMore: this.state.toggleShowMore,
      showMoreTextComponent: getScopedSlot(this, 'showMoreLabel'),
      classNames: this.classNames && {
        root: this.classNames['ais-HierarchicalMenu'],
        noRefinementRoot: this.classNames['ais-HierarchicalMenu--noRefinement'],
        list: this.classNames['ais-HierarchicalMenu-list'],
        childList: this.classNames['ais-HierarchicalMenu-list--child'],
        item: this.classNames['ais-HierarchicalMenu-item'],
        selectedItem: this.classNames['ais-HierarchicalMenu-item--selected'],
        parentItem: this.classNames['ais-HierarchicalMenu-item--parent'],
        link: this.classNames['ais-HierarchicalMenu-link'],
        selectedItemLink:
          this.classNames['ais-HierarchicalMenu-link--selected'],
        label: this.classNames['ais-HierarchicalMenu-label'],
        count: this.classNames['ais-HierarchicalMenu-count'],
        showMore: this.classNames['ais-HierarchicalMenu-showMore'],
        disabledShowMore:
          this.classNames['ais-HierarchicalMenu-showMore--disabled'],
      },
    });
  }),
};
</script>
