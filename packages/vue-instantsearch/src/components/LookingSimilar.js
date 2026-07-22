import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import { connectLookingSimilar } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

import AisCarousel from './Carousel';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-LookingSimilar'],
    emptyRoot: classNames['ais-LookingSimilar--empty'],
    title: classNames['ais-LookingSimilar-title'],
    container: classNames['ais-LookingSimilar-container'],
    list: classNames['ais-LookingSimilar-list'],
    item: classNames['ais-LookingSimilar-item'],
  };
}

export default {
  name: 'AisLookingSimilar',
  mixins: [
    createWidgetMixin(
      { connector: connectLookingSimilar },
      { $$widgetType: 'ais.lookingSimilar' }
    ),
    createSuitMixin({ name: 'LookingSimilar' }),
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
    const LookingSimilarUiComponent = createLookingSimilarComponent({
      createElement: h,
      Fragment,
    });

    return h(LookingSimilarUiComponent, {
      items: this.state ? this.state.items : [],
      status: this.instantSearchInstance.status,
      sendEvent: this.state ? this.state.sendEvent : () => {},
      classNames: mapClassNames(this.classNames),
      layout: this.layout === 'carousel' ? AisCarousel : undefined,
    });
  }),
};
