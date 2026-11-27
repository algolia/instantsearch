<script>
import { connectRange } from 'instantsearch-core';
import { createRangeInputComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

function toInputValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

export default {
  name: 'AisRangeInput',
  mixins: [
    createSuitMixin({ name: 'RangeInput' }),
    createWidgetMixin(
      {
        connector: connectRange,
      },
      {
        $$widgetType: 'ais.rangeInput',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: false,
      default: undefined,
    },
    max: {
      type: Number,
      required: false,
      default: undefined,
    },
    precision: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      minInput: undefined,
      maxInput: undefined,
    };
  },
  watch: {
    // The typed values reset to the current refinement on every render
    // coming from the connector.
    state() {
      this.minInput = undefined;
      this.maxInput = undefined;
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        min: this.min,
        max: this.max,
        precision: this.precision,
      };
    },
    step() {
      return 1 / Math.pow(10, this.precision);
    },
    values() {
      return this.state.currentRefinement;
    },
  },
  methods: {
    pick(first, second) {
      if (first !== null && first !== undefined) {
        return first;
      } else {
        return second;
      }
    },
    refine({ min, max }) {
      this.state.refine({ min, max });
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
            currentRefinement: this.values,
            refine: this.refine,
            canRefine: this.state.canRefine,
            range: this.state.range,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    const RangeInput = createRangeInputComponent({
      createElement: h,
      Fragment,
    });

    return h(RangeInput, {
      classNames: this.classNames && {
        root: this.classNames['ais-RangeInput'],
        noRefinementRoot: this.classNames['ais-RangeInput--noRefinement'],
        form: this.classNames['ais-RangeInput-form'],
        label: this.classNames['ais-RangeInput-label'],
        input: this.classNames['ais-RangeInput-input'],
        inputMin: this.classNames['ais-RangeInput-input--min'],
        inputMax: this.classNames['ais-RangeInput-input--max'],
        separator: this.classNames['ais-RangeInput-separator'],
        submit: this.classNames['ais-RangeInput-submit'],
      },
      min: this.state.range.min,
      max: this.state.range.max,
      step: this.step,
      canRefine: this.state.canRefine,
      fromValue: toInputValue(this.pick(this.minInput, this.values.min)),
      toValue: toInputValue(this.pick(this.maxInput, this.values.max)),
      onFromChange: (value) => {
        this.minInput = value;
      },
      onToChange: (value) => {
        this.maxInput = value;
      },
      onSubmit: () => {
        this.refine({
          min: this.pick(this.minInput, this.values.min),
          max: this.pick(this.maxInput, this.values.max),
        });
      },
      minLabelComponent: getScopedSlot(this, 'minLabel'),
      maxLabelComponent: getScopedSlot(this, 'maxLabel'),
      separatorTextComponent: getScopedSlot(this, 'separator'),
      submitTextComponent: getScopedSlot(this, 'submitLabel'),
    });
  }),
};
</script>
