<script>
import { connectClearRefinements } from 'instantsearch-core';
import { createClearRefinementsComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisClearRefinements',
  mixins: [
    createWidgetMixin(
      {
        connector: connectClearRefinements,
      },
      {
        $$widgetType: 'ais.clearRefinements',
      }
    ),
    createPanelConsumerMixin(),
    createSuitMixin({ name: 'ClearRefinements' }),
  ],
  props: {
    excludedAttributes: {
      type: Array,
      default: undefined,
    },
    includedAttributes: {
      type: Array,
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
      return h('div', { className: this.suit() }, [
        defaultSlot({
          canRefine: this.state.canRefine,
          refine: this.state.refine,
          createURL: this.state.createURL,
        }),
      ]);
    }

    const ClearRefinements = createClearRefinementsComponent({
      createElement: h,
      Fragment,
    });
    const resetLabelSlot = getScopedSlot(this, 'resetLabel');

    return h(ClearRefinements, {
      canRefine: this.state.canRefine,
      onClick: this.state.refine,
      classNames: this.classNames && {
        root: this.classNames['ais-ClearRefinements'],
        button: this.classNames['ais-ClearRefinements-button'],
        disabledButton:
          this.classNames['ais-ClearRefinements-button--disabled'],
      },
      resetLabelComponent: resetLabelSlot,
    });
  }),
};
</script>
