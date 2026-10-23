import { createCarouselToolComponent } from 'instantsearch-ui-components';

import { createHooksMixin } from '../../../mixins/hooks';
import { Fragment, renderReactCompat } from '../../../util/vue-compat';

/**
 * Vue equivalent of react-instantsearch's chat `SearchIndexTool`: a tool
 * `layoutComponent` rendering the search/recommend results in the shared
 * `CarouselTool` (carousel + header with result count, optional "View all"
 * and scroll buttons).
 *
 * The layout is a Vue component so the shared component's hooks (scroll
 * state, refs, the "items shown" insights effect) get their own store, one
 * per tool call in the conversation.
 *
 * `getItemComponent` resolves the item renderer at render time (`item` slot,
 * `itemComponent` prop, or `undefined` for the shared default), so the tools
 * — and with them the widget — don't have to be re-created when it changes.
 */
export function createCarouselTool(
  showViewAll,
  getItemComponent,
  getSearchPageURL
) {
  const layoutComponent = {
    name: 'AisChatSearchIndexTool',
    mixins: [createHooksMixin()],
    inheritAttrs: false,
    props: {
      context: { type: Object, required: true },
    },
    render: renderReactCompat(function (h) {
      const { useEffect, useMemo, useRef, useState } = this.hooksStore.hooks;

      const CarouselToolUiComponent = this.getUiComponent('carouselTool', () =>
        createCarouselToolComponent({
          createElement: h,
          Fragment,
          useEffect,
          useMemo,
          useRef,
          useState,
        })
      );

      this.hooksStore.beginRender();

      const tree = h(CarouselToolUiComponent, {
        getSearchPageURL,
        headerProps: { showViewAll },
        itemComponent: getItemComponent(),
        // The shared chat passes the (deprecated) root props alongside
        // `context`; forward them untouched for tools that still read them.
        toolProps: Object.assign({}, this.$attrs, { context: this.context }),
      });

      this.hooksStore.endRender();

      return tree;
    }),
  };

  return { layoutComponent };
}
