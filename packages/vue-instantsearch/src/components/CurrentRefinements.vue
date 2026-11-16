<script>
import { connectCurrentRefinements } from 'instantsearch-core';
import { createCurrentRefinementsComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisCurrentRefinements',
  mixins: [
    createSuitMixin({ name: 'CurrentRefinements' }),
    createWidgetMixin(
      {
        connector: connectCurrentRefinements,
      },
      {
        $$widgetType: 'ais.currentRefinements',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    includedAttributes: {
      type: Array,
      default: undefined,
    },
    excludedAttributes: {
      type: Array,
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    noRefinement() {
      return this.state && this.state.items.length === 0;
    },
    widgetParams() {
      return {
        includedAttributes: this.includedAttributes,
        excludedAttributes: this.excludedAttributes,
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
            this.noRefinement && this.suit('', 'noRefinement'),
          ],
        },
        [
          defaultSlot({
            refine: this.state.refine,
            items: this.state.items,
            createURL: this.state.createURL,
          }),
        ]
      );
    }

    const CurrentRefinements = createCurrentRefinementsComponent({
      createElement: h,
      Fragment,
    });
    const itemSlot = getScopedSlot(this, 'item');
    const refinementSlot = getScopedSlot(this, 'refinement');

    return h(CurrentRefinements, {
      classNames: this.classNames && {
        root: this.classNames['ais-CurrentRefinements'],
        noRefinementRoot:
          this.classNames['ais-CurrentRefinements--noRefinement'],
        list: this.classNames['ais-CurrentRefinements-list'],
        item: this.classNames['ais-CurrentRefinements-item'],
        label: this.classNames['ais-CurrentRefinements-label'],
        category: this.classNames['ais-CurrentRefinements-category'],
        categoryLabel: this.classNames['ais-CurrentRefinements-categoryLabel'],
        delete: this.classNames['ais-CurrentRefinements-delete'],
      },
      items: this.state.items,
      canRefine: this.state.canRefine,
      itemComponent:
        itemSlot &&
        (({ item, className, key }) =>
          h('li', { key, className }, [
            itemSlot({
              refine: item.refine,
              item,
              createURL: this.state.createURL,
            }),
          ])),
      refinementComponent:
        refinementSlot &&
        (({ item, refinement, className, key }) =>
          h('span', { key, className }, [
            refinementSlot({
              refine: item.refine,
              refinement,
              createURL: this.state.createURL,
            }),
          ])),
    });
  }),
};
</script>
