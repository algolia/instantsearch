<script>
import { connectToggleRefinement } from 'instantsearch-core';
import { createToggleRefinementComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisToggleRefinement',
  mixins: [
    createSuitMixin({ name: 'ToggleRefinement' }),
    createWidgetMixin(
      {
        connector: connectToggleRefinement,
      },
      {
        $$widgetType: 'ais.toggleRefinement',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    on: {
      type: [String, Number, Boolean, Array],
      required: false,
      default: true,
    },
    off: {
      type: [String, Number, Boolean, Array],
      required: false,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        on: this.on,
        off: this.off,
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
            value: this.state.value,
            canRefine: this.state.canRefine,
            refine: this.state.refine,
            createURL: this.state.createURL,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    const ToggleRefinement = createToggleRefinementComponent({
      createElement: h,
      Fragment,
    });

    return h(ToggleRefinement, {
      classNames: this.classNames && {
        root: this.classNames['ais-ToggleRefinement'],
        label: this.classNames['ais-ToggleRefinement-label'],
        checkbox: this.classNames['ais-ToggleRefinement-checkbox'],
        labelText: this.classNames['ais-ToggleRefinement-labelText'],
        count: this.classNames['ais-ToggleRefinement-count'],
      },
      checked: this.state.value.isRefined,
      label: this.label || this.state.value.name,
      count: this.state.value.count,
      value: this.state.value,
      onChange: (isChecked) => this.state.refine({ isRefined: !isChecked }),
    });
  }),
};
</script>
