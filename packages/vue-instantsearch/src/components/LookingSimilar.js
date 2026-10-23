import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import { connectLookingSimilar } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

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

    const items = this.state ? this.state.items : [];
    const sendEvent = this.state ? this.state.sendEvent : () => {};

    const defaultSlot = getScopedSlot(this, 'default');
    const itemSlot = getScopedSlot(this, 'item');
    const headerSlot = getScopedSlot(this, 'header');
    const emptySlot = getScopedSlot(this, 'empty');

    // Like `AisHits`, the default slot replaces the whole widget body when
    // it's the only slot provided.
    if (defaultSlot && !itemSlot && !headerSlot && !emptySlot) {
      return h(
        'section',
        { className: this.suit() },
        defaultSlot({ items, sendEvent })
      );
    }

    return h(LookingSimilarUiComponent, {
      items,
      status: this.instantSearchInstance.status,
      sendEvent,
      classNames: mapClassNames(this.classNames),
      // Scoped slots are forwarded as the shared component's `*Component`
      // props; `undefined` keeps the shared defaults.
      itemComponent:
        itemSlot && ((props) => itemSlot({ item: props.item, sendEvent })),
      headerComponent:
        headerSlot &&
        ((props) =>
          headerSlot({
            items: props.items,
            translations: props.translations,
            classNames: props.classNames,
          })),
      emptyComponent: emptySlot && (() => emptySlot({})),
      // A Vue child component (own hook context) rendered as the shared
      // component's layout; `undefined` keeps the shared default list layout.
      layout: this.layout === 'carousel' ? AisCarousel : undefined,
    });
  }),
};
