import { createCompareBarComponent } from 'instantsearch-ui-components';
import { connectCompare } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-CompareBar'],
    header: classNames['ais-CompareBar-header'],
    title: classNames['ais-CompareBar-title'],
    count: classNames['ais-CompareBar-count'],
    list: classNames['ais-CompareBar-list'],
    item: classNames['ais-CompareBar-item'],
    itemLabel: classNames['ais-CompareBar-itemLabel'],
    itemRemove: classNames['ais-CompareBar-itemRemove'],
    hint: classNames['ais-CompareBar-hint'],
    actions: classNames['ais-CompareBar-actions'],
    clearButton: classNames['ais-CompareBar-clearButton'],
    compareButton: classNames['ais-CompareBar-compareButton'],
  };
}

/**
 * The comparison selection bar: the records picked for comparison, a
 * clear-selection action, and the "Compare" call-to-action that opens the
 * `<ais-chat>` on the same index with the configured comparison.
 *
 * Select records from your own UI (e.g. a "Compare" button in the hits) with
 * a custom widget using `connectCompare`: the selection is shared by every
 * `compare` widget of the InstantSearch instance.
 */
export default {
  name: 'AisCompareBar',
  mixins: [
    createWidgetMixin(
      { connector: connectCompare },
      { $$widgetType: 'ais.compareBar' }
    ),
    createSuitMixin({ name: 'CompareBar' }),
  ],
  props: {
    /**
     * ID of the comparison configuration created in the Agent Studio
     * dashboard (Components > Comparison).
     */
    configurationId: {
      type: String,
      required: true,
    },
    minItems: {
      type: Number,
      required: false,
      default: undefined,
    },
    maxItems: {
      type: Number,
      required: false,
      default: undefined,
    },
    transformItems: {
      type: Function,
      required: false,
      default: undefined,
    },
    translations: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        configurationId: this.configurationId,
        minItems: this.minItems,
        maxItems: this.maxItems,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const CompareBarUiComponent = createCompareBarComponent({
      createElement: h,
      Fragment,
    });

    const itemSlot = getScopedSlot(this, 'item');

    return h(CompareBarUiComponent, {
      items: this.state.items,
      minItems: this.state.minItems,
      maxItems: this.state.maxItems,
      canCompare: this.state.canCompare,
      onCompare: () => this.state.compare(),
      onRemove: (item) => this.state.removeItem(item.objectID),
      onClear: () => this.state.clearItems(),
      itemComponent: itemSlot && ((props) => itemSlot({ item: props.item })),
      classNames: mapClassNames(this.classNames),
      translations: this.translations,
    });
  }),
};
