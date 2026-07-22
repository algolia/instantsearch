import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createDisplayResultsToolComponent,
} from 'instantsearch-ui-components';

import { Fragment, renderReactCompat } from '../../../util/vue-compat';
import AisCarousel from '../../Carousel';

// A non-memoizing `useMemo`: recomputes every render. The shared
// DisplayResults component only uses `useMemo` to hydrate hits by objectID
// (a perf optimization), so recomputing is functionally correct.
const passthroughUseMemo = (factory) => factory();

/**
 * Vue equivalent of react-instantsearch's chat DisplayResultsTool: renders the
 * shared DisplayResults component, feeding it `AisCarousel` per result group.
 */
export function createDisplayResultsTool(itemComponent) {
  const layoutComponent = {
    name: 'AisChatDisplayResultsTool',
    props: {
      message: { type: Object, default: undefined },
      indexUiState: { type: Object, default: undefined },
      setIndexUiState: { type: Function, default: undefined },
      messages: { type: Array, default: undefined },
      addToolResult: { type: Function, default: undefined },
      applyFilters: { type: Function, default: undefined },
      sendEvent: { type: Function, default: () => {} },
      onClose: { type: Function, default: () => {} },
    },
    render: renderReactCompat(function (h) {
      const DisplayResultsUiComponent = createDisplayResultsToolComponent({
        createElement: h,
        Fragment,
        useMemo: passthroughUseMemo,
      });
      const Button = createButtonComponent({ createElement: h });

      const toolProps = {
        message: this.message,
        indexUiState: this.indexUiState,
        setIndexUiState: this.setIndexUiState,
        messages: this.messages,
        addToolResult: this.addToolResult,
        applyFilters: this.applyFilters,
        sendEvent: this.sendEvent,
        onClose: this.onClose,
      };

      const groupCarouselComponent = ({ items, sendEvent }) =>
        h(AisCarousel, {
          items,
          itemComponent,
          sendEvent,
          showNavigation: false,
          headerComponent: ({
            canScrollLeft,
            canScrollRight,
            scrollLeft,
            scrollRight,
          }) =>
            h(
              'div',
              { className: 'ais-ChatToolDisplayResultsCarouselHeader' },
              h(
                'div',
                { className: 'ais-ChatToolDisplayResultsCarouselHeaderCount' },
                `${items.length} result${items.length > 1 ? 's' : ''}`
              ),
              h(
                'div',
                {
                  className:
                    'ais-ChatToolDisplayResultsCarouselHeaderScrollButtons',
                },
                h(
                  Button,
                  {
                    variant: 'outline',
                    size: 'sm',
                    iconOnly: true,
                    onClick: scrollLeft,
                    disabled: !canScrollLeft,
                    className:
                      'ais-ChatToolDisplayResultsCarouselHeaderScrollButton',
                  },
                  h(ChevronLeftIcon, { createElement: h })
                ),
                h(
                  Button,
                  {
                    variant: 'outline',
                    size: 'sm',
                    iconOnly: true,
                    onClick: scrollRight,
                    disabled: !canScrollRight,
                    className:
                      'ais-ChatToolDisplayResultsCarouselHeaderScrollButton',
                  },
                  h(ChevronRightIcon, { createElement: h })
                )
              )
            ),
        });

      return h(DisplayResultsUiComponent, {
        toolProps,
        groupCarouselComponent,
      });
    }),
  };

  return { layoutComponent };
}
