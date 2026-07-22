import {
  createCarouselComponent,
  generateCarouselId,
} from 'instantsearch-ui-components';

import { createHooksStore } from '../util/hooks';
import { Fragment, isVue3, renderReactCompat } from '../util/vue-compat';

/**
 * Vue wrapper around the shared `instantsearch-ui-components` Carousel.
 *
 * The shared Carousel is a hook-driven component (`useState` for scroll
 * affordances, `useRef` for the list/buttons). Vue can't supply React hooks
 * natively, so this component owns a `hooksStore` (see `util/hooks.js`) and
 * drives it through its own render cycle — mirroring how React's
 * `components/Carousel.tsx` uses `useState` / `useRef`.
 *
 * It's a real Vue child component (not a plain function) so it gets its own
 * hook context, which matters because the layout is mounted/unmounted
 * conditionally by the parent recommend widget.
 */
export default {
  name: 'AisCarousel',
  props: {
    items: {
      type: Array,
      required: true,
    },
    itemComponent: {
      type: Function,
      required: false,
      default: undefined,
    },
    sendEvent: {
      type: Function,
      required: false,
      default: () => {},
    },
    classNames: {
      type: Object,
      required: false,
      default: undefined,
    },
    translations: {
      type: Object,
      required: false,
      default: undefined,
    },
    // Optional overrides used by the chat tools (custom header, no built-in
    // navigation, custom scroll icons).
    headerComponent: {
      type: Function,
      required: false,
      default: undefined,
    },
    showNavigation: {
      type: Boolean,
      required: false,
      default: true,
    },
    previousIconComponent: {
      type: Function,
      required: false,
      default: undefined,
    },
    nextIconComponent: {
      type: Function,
      required: false,
      default: undefined,
    },
  },
  created() {
    this.hooksStore = createHooksStore(() => this.$forceUpdate());
  },
  mounted() {
    this.hooksStore.flushEffects();
  },
  updated() {
    this.hooksStore.flushEffects();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.hooksStore.cleanup();
  },
  render: renderReactCompat(function (h) {
    const CarouselUiComponent = createCarouselComponent({
      createElement: h,
      Fragment,
    });

    const { useState, useRef } = this.hooksStore.hooks;

    this.hooksStore.beginRender();

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const listRef = useRef(null);
    const nextButtonRef = useRef(null);
    const previousButtonRef = useRef(null);
    const carouselIdRef = useRef(generateCarouselId());

    const tree = h(CarouselUiComponent, {
      items: this.items,
      itemComponent: this.itemComponent,
      sendEvent: this.sendEvent,
      translations: this.translations,
      headerComponent: this.headerComponent,
      showNavigation: this.showNavigation,
      previousIconComponent: this.previousIconComponent,
      nextIconComponent: this.nextIconComponent,
      // The parent recommend widget forwards its own `list`/`item` classes.
      classNames: this.classNames && {
        list: this.classNames.list,
        item: this.classNames.item,
      },
      listRef,
      nextButtonRef,
      previousButtonRef,
      carouselIdRef,
      canScrollLeft,
      canScrollRight,
      setCanScrollLeft,
      setCanScrollRight,
    });

    this.hooksStore.endRender();

    return tree;
  }),
};
