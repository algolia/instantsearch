import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import { connectRelatedProducts } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

import AisCarousel from './Carousel';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-RelatedProducts'],
    emptyRoot: classNames['ais-RelatedProducts--empty'],
    title: classNames['ais-RelatedProducts-title'],
    container: classNames['ais-RelatedProducts-container'],
    list: classNames['ais-RelatedProducts-list'],
    item: classNames['ais-RelatedProducts-item'],
  };
}

export default {
  name: 'AisRelatedProducts',
  mixins: [
    createWidgetMixin(
      { connector: connectRelatedProducts },
      { $$widgetType: 'ais.relatedProducts' }
    ),
    createSuitMixin({ name: 'RelatedProducts' }),
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
      type: Array,
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
    const RelatedProductsUiComponent = createRelatedProductsComponent({
      createElement: h,
      Fragment,
    });

    return h(RelatedProductsUiComponent, {
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
