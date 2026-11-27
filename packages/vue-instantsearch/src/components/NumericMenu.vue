<script>
import { connectNumericMenu } from 'instantsearch-core';
import { createNumericMenuComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisNumericMenu',
  mixins: [
    createWidgetMixin(
      {
        connector: connectNumericMenu,
      },
      {
        $$widgetType: 'ais.numericMenu',
      }
    ),
    createSuitMixin({ name: 'NumericMenu' }),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
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
        attribute: this.attribute,
        transformItems: this.transformItems,
        items: this.items,
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
            refine: this.state.refine,
            createURL: this.state.createURL,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    const NumericMenu = createNumericMenuComponent({
      createElement: h,
      Fragment,
    });

    return h(NumericMenu, {
      items: this.state.items,
      canRefine: this.state.canRefine,
      attribute: this.attribute,
      onRefine: (item) => this.state.refine(item.value),
      classNames: this.classNames && {
        root: this.classNames['ais-NumericMenu'],
        noRefinementRoot: this.classNames['ais-NumericMenu--noRefinement'],
        list: this.classNames['ais-NumericMenu-list'],
        item: this.classNames['ais-NumericMenu-item'],
        selectedItem: this.classNames['ais-NumericMenu-item--selected'],
        label: this.classNames['ais-NumericMenu-label'],
        radio: this.classNames['ais-NumericMenu-radio'],
        labelText: this.classNames['ais-NumericMenu-labelText'],
      },
    });
  }),
};
</script>
