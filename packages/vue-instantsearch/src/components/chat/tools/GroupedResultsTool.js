import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createGroupedResultsToolComponent,
} from 'instantsearch-ui-components';

import { createHooksMixin } from '../../../mixins/hooks';
import { Fragment, renderReactCompat } from '../../../util/vue-compat';
import AisCarousel from '../../Carousel';

/**
 * Vue equivalent of react-instantsearch's chat `GroupedResultsTool`: renders
 * the shared GroupedResults component, feeding it an `AisCarousel` per result
 * group (each with a header showing the count and scroll buttons).
 *
 * `getItemComponent` resolves the item renderer at render time (see
 * `SearchIndexTool.js`).
 */
export function createGroupedResultsTool(getItemComponent) {
  const layoutComponent = {
    name: 'AisChatGroupedResultsTool',
    mixins: [createHooksMixin()],
    inheritAttrs: false,
    props: {
      context: { type: Object, required: true },
    },
    render: renderReactCompat(function (h) {
      const { useEffect, useRef } = this.hooksStore.hooks;

      const GroupedResultsUiComponent = this.getUiComponent(
        'groupedResultsTool',
        () =>
          createGroupedResultsToolComponent({
            createElement: h,
            Fragment,
            useEffect,
            useRef,
          })
      );
      const Button = this.getUiComponent('button', () =>
        createButtonComponent({ createElement: h })
      );

      const groupCarouselHeader = ({
        nbItems,
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
      }) =>
        h(
          'div',
          { className: 'ais-ChatToolGroupedResultsCarouselHeader' },
          h(
            'div',
            { className: 'ais-ChatToolGroupedResultsCarouselHeaderCount' },
            `${nbItems} result${nbItems > 1 ? 's' : ''}`
          ),
          h(
            'div',
            {
              className:
                'ais-ChatToolGroupedResultsCarouselHeaderScrollButtons',
            },
            h(
              Button,
              {
                variant: 'outline',
                size: 'sm',
                iconOnly: true,
                'aria-label': 'Previous',
                onClick: scrollLeft,
                disabled: !canScrollLeft,
                className:
                  'ais-ChatToolGroupedResultsCarouselHeaderScrollButton',
              },
              h(ChevronLeftIcon, { createElement: h })
            ),
            h(
              Button,
              {
                variant: 'outline',
                size: 'sm',
                iconOnly: true,
                'aria-label': 'Next',
                onClick: scrollRight,
                disabled: !canScrollRight,
                className:
                  'ais-ChatToolGroupedResultsCarouselHeaderScrollButton',
              },
              h(ChevronRightIcon, { createElement: h })
            )
          )
        );

      this.hooksStore.beginRender();

      const tree = h(GroupedResultsUiComponent, {
        toolProps: { context: this.context },
        groupCarouselComponent: ({ items, sendEvent }) =>
          h(AisCarousel, {
            items,
            itemComponent: getItemComponent(),
            sendEvent,
            showNavigation: false,
            headerComponent: groupCarouselHeader,
          }),
      });

      this.hooksStore.endRender();

      return tree;
    }),
  };

  return {
    layoutComponent,
    streamInput: true,
  };
}
