import { connectInfiniteHits } from 'instantsearch-core';
import { createInfiniteHitsComponent, cx } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisInfiniteHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectInfiniteHits,
      },
      {
        $$widgetType: 'ais.infiniteHits',
      }
    ),
    createSuitMixin({ name: 'InfiniteHits' }),
  ],
  props: {
    showBanner: {
      type: Boolean,
      default: true,
    },
    showPrevious: {
      type: Boolean,
      default: false,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
    cache: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        showBanner: this.showBanner,
        showPrevious: this.showPrevious,
        transformItems: this.transformItems,
        cache: this.cache,
      };
    },
  },
  methods: {
    refinePrevious() {
      this.state.showPrevious();
    },
    refineNext() {
      this.state.showMore();
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    const itemSlot = getScopedSlot(this, 'item');
    const bannerSlot = getScopedSlot(this, 'banner');
    const loadPreviousSlot = getScopedSlot(this, 'loadPrevious');
    const loadMoreSlot = getScopedSlot(this, 'loadMore');

    const loadPreviousComponent =
      loadPreviousSlot &&
      (() =>
        loadPreviousSlot({
          refinePrevious: this.refinePrevious,
          page: this.state.results.page,
          isFirstPage: this.state.isFirstPage,
        }));

    // Like `AisHits`, the default slot replaces the banner, the list and the
    // "Show more" button when none of their slots are provided. It never
    // wrapped the "Show previous" button.
    if (defaultSlot && !itemSlot && !bannerSlot && !loadMoreSlot) {
      return h(
        'div',
        { className: this.suit() },
        this.showPrevious &&
          (loadPreviousComponent
            ? loadPreviousComponent()
            : h(
                'button',
                {
                  className: cx(
                    this.suit('loadPrevious'),
                    this.state.isFirstPage &&
                      this.suit('loadPrevious', 'disabled')
                  ),
                  disabled: this.state.isFirstPage,
                  onClick: this.refinePrevious,
                },
                'Show previous results'
              )),
        defaultSlot({
          items: this.state.items,
          results: this.state.results,
          banner: this.state.banner,
          isLastPage: this.state.isLastPage,
          refinePrevious: this.refinePrevious,
          refineNext: this.refineNext,
          refine: this.refineNext,
          sendEvent: this.state.sendEvent,
        })
      );
    }

    const InfiniteHitsUiComponent = createInfiniteHitsComponent({
      createElement: h,
      Fragment,
    });

    return h(InfiniteHitsUiComponent, {
      hits: this.state.items,
      // Without an `item` slot, the shared component renders its default hit.
      itemComponent:
        itemSlot &&
        (({ hit, index, ...rootProps }) =>
          h(
            'li',
            rootProps,
            itemSlot({
              item: hit,
              index,
              sendEvent: this.state.sendEvent,
            })
          )),
      sendEvent: this.state.sendEvent,
      classNames: this.classNames && {
        root: this.classNames['ais-InfiniteHits'],
        emptyRoot: this.classNames['ais-InfiniteHits--empty'],
        list: this.classNames['ais-InfiniteHits-list'],
        item: this.classNames['ais-InfiniteHits-item'],
        loadPrevious: this.classNames['ais-InfiniteHits-loadPrevious'],
        disabledLoadPrevious:
          this.classNames['ais-InfiniteHits-loadPrevious--disabled'],
        loadMore: this.classNames['ais-InfiniteHits-loadMore'],
        disabledLoadMore:
          this.classNames['ais-InfiniteHits-loadMore--disabled'],
        bannerRoot: this.classNames['ais-InfiniteHits-banner'],
        bannerImage: this.classNames['ais-InfiniteHits-banner-image'],
        bannerLink: this.classNames['ais-InfiniteHits-banner-link'],
      },
      banner:
        this.showBanner &&
        this.state.banner &&
        this.state.banner.image.urls[0].url
          ? this.state.banner
          : undefined,
      bannerComponent: bannerSlot && (({ banner }) => bannerSlot({ banner })),
      isFirstPage: this.state.isFirstPage,
      isLastPage: this.state.isLastPage,
      onShowPrevious: this.showPrevious ? this.refinePrevious : undefined,
      onShowMore: this.refineNext,
      loadPreviousComponent,
      loadMoreComponent:
        loadMoreSlot &&
        (() =>
          loadMoreSlot({
            refineNext: this.refineNext,
            refine: this.refineNext,
            page: this.state.results.page,
            isLastPage: this.state.isLastPage,
          })),
    });
  }),
};
