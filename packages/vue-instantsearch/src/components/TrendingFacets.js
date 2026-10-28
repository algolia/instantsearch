import { createTrendingFacetsComponent } from 'instantsearch-ui-components';
import { connectTrendingFacets } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-TrendingFacets'],
    emptyRoot: classNames['ais-TrendingFacets--empty'],
    title: classNames['ais-TrendingFacets-title'],
    container: classNames['ais-TrendingFacets-container'],
    list: classNames['ais-TrendingFacets-list'],
    item: classNames['ais-TrendingFacets-item'],
  };
}

export default {
  name: 'AisTrendingFacets',
  mixins: [
    createWidgetMixin(
      { connector: connectTrendingFacets },
      { $$widgetType: 'ais.trendingFacets' }
    ),
    createSuitMixin({ name: 'TrendingFacets' }),
  ],
  props: {
    facetName: {
      type: String,
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
  },
  computed: {
    widgetParams() {
      return {
        facetName: this.facetName,
        limit: this.limit,
        threshold: this.threshold,
        fallbackParameters: this.fallbackParameters,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    const TrendingFacetsUiComponent = createTrendingFacetsComponent({
      createElement: h,
      Fragment,
    });

    const items = this.state ? this.state.items : [];

    const defaultSlot = getScopedSlot(this, 'default');
    const itemSlot = getScopedSlot(this, 'item');
    const headerSlot = getScopedSlot(this, 'header');
    const emptySlot = getScopedSlot(this, 'empty');

    // Like `AisHits`, the default slot replaces the whole widget body when
    // it's the only slot provided.
    if (defaultSlot && !itemSlot && !headerSlot && !emptySlot) {
      return h('section', { className: this.suit() }, defaultSlot({ items }));
    }

    return h(TrendingFacetsUiComponent, {
      items,
      status: this.instantSearchInstance.status,
      classNames: mapClassNames(this.classNames),
      // Scoped slots are forwarded as the shared component's `*Component`
      // props; `undefined` keeps the shared defaults.
      itemComponent: itemSlot && ((props) => itemSlot({ item: props.item })),
      headerComponent:
        headerSlot &&
        ((props) =>
          headerSlot({
            items: props.items,
            translations: props.translations,
            classNames: props.classNames,
          })),
      emptyComponent: emptySlot && (() => emptySlot({})),
    });
  }),
};
