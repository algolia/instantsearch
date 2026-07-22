import { createFrequentlyBoughtTogetherComponent } from 'instantsearch-ui-components';
import { connectFrequentlyBoughtTogether } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

import AisCarousel from './Carousel';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-FrequentlyBoughtTogether'],
    emptyRoot: classNames['ais-FrequentlyBoughtTogether--empty'],
    title: classNames['ais-FrequentlyBoughtTogether-title'],
    container: classNames['ais-FrequentlyBoughtTogether-container'],
    list: classNames['ais-FrequentlyBoughtTogether-list'],
    item: classNames['ais-FrequentlyBoughtTogether-item'],
  };
}

export default {
  name: 'AisFrequentlyBoughtTogether',
  mixins: [
    createWidgetMixin(
      { connector: connectFrequentlyBoughtTogether },
      { $$widgetType: 'ais.frequentlyBoughtTogether' }
    ),
    createSuitMixin({ name: 'FrequentlyBoughtTogether' }),
  ],
  props: {
    objectIDs: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      required: false,
      default: undefined,
    },
    threshold: {
      type: Number,
      required: false,
      default: undefined,
    },
    fallbackParameters: {
      type: Object,
      required: false,
      default: undefined,
    },
    queryParameters: {
      type: Object,
      required: false,
      default: undefined,
    },
    escapeHTML: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    transformItems: {
      type: Function,
      required: false,
      default: undefined,
    },
    layout: {
      type: String,
      required: false,
      default: 'list',
      validator: (value) => ['list', 'carousel'].indexOf(value) !== -1,
    },
  },
  computed: {
    widgetParams() {
      return {
        objectIDs: this.objectIDs,
        limit: this.limit,
        threshold: this.threshold,
        fallbackParameters: this.fallbackParameters,
        queryParameters: this.queryParameters,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    const FrequentlyBoughtTogetherUiComponent =
      createFrequentlyBoughtTogetherComponent({
        createElement: h,
        Fragment,
      });

    return h(FrequentlyBoughtTogetherUiComponent, {
      items: this.state ? this.state.items : [],
      status: this.instantSearchInstance.status,
      sendEvent: this.state ? this.state.sendEvent : () => {},
      classNames: mapClassNames(this.classNames),
      // A Vue child component (own hook context) rendered as the shared
      // component's layout; `undefined` keeps the shared default list layout.
      layout: this.layout === 'carousel' ? AisCarousel : undefined,
    });
  }),
};
