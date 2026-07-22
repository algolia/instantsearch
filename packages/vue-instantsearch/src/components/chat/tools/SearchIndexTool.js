import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  getFacetFiltersFromToolInput,
} from 'instantsearch-ui-components';
import { addAbsolutePosition, addQueryID } from 'instantsearch.js/es/lib/utils';

import { renderReactCompat } from '../../../util/vue-compat';
import AisCarousel from '../../Carousel';

/**
 * Vue equivalent of react-instantsearch's chat SearchIndexTool: a tool
 * `layoutComponent` that renders the search/recommend results in the shared
 * Carousel (reusing `AisCarousel`) with a custom header (result count, an
 * optional "View all" button, and scroll buttons).
 */
export function createCarouselTool(
  showViewAll,
  itemComponent,
  getSearchPageURL
) {
  const layoutComponent = {
    name: 'AisChatSearchIndexTool',
    props: {
      message: { type: Object, default: undefined },
      applyFilters: { type: Function, default: undefined },
      onClose: { type: Function, default: () => {} },
      sendEvent: { type: Function, default: () => {} },
    },
    render: renderReactCompat(function (h) {
      const Button = createButtonComponent({ createElement: h });

      const input = this.message && this.message.input;
      const output = (this.message && this.message.output) || {};
      const hits = output.hits || [];

      const hitsWithAbsolutePosition = addAbsolutePosition(
        hits,
        0,
        (input && input.number_of_results) || hits.length || 5
      );
      const items = addQueryID(hitsWithAbsolutePosition, output.queryID);

      const { applyFilters, onClose, sendEvent } = this;

      const headerComponent = ({
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
      }) => {
        const hitsPerPage = items.length;
        if (hitsPerPage < 1) {
          return null;
        }

        return h(
          'div',
          { className: 'ais-ChatToolSearchIndexCarouselHeader' },
          h(
            'div',
            { className: 'ais-ChatToolSearchIndexCarouselHeaderResults' },
            output.nbHits &&
              h(
                'div',
                { className: 'ais-ChatToolSearchIndexCarouselHeaderCount' },
                `${hitsPerPage} of ${output.nbHits.toLocaleString()} result${
                  output.nbHits > 1 ? 's' : ''
                }`
              ),
            showViewAll &&
              h(
                Button,
                {
                  variant: 'ghost',
                  size: 'sm',
                  className: 'ais-ChatToolSearchIndexCarouselHeaderViewAll',
                  onClick: () => {
                    if (!input || !applyFilters) {
                      return;
                    }
                    const params = applyFilters({
                      query: input.query,
                      facetFilters: getFacetFiltersFromToolInput(input),
                    });

                    const searchPageURL =
                      getSearchPageURL && getSearchPageURL(params);
                    if (
                      searchPageURL &&
                      new URL(searchPageURL).pathname !==
                        window.location.pathname
                    ) {
                      window.location.href = searchPageURL;
                    }

                    onClose();
                  },
                },
                'View all',
                h(ArrowRightIcon, { createElement: h })
              )
          ),
          hitsPerPage > 2 &&
            h(
              'div',
              {
                className: 'ais-ChatToolSearchIndexCarouselHeaderScrollButtons',
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
                    'ais-ChatToolSearchIndexCarouselHeaderScrollButton',
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
                    'ais-ChatToolSearchIndexCarouselHeaderScrollButton',
                },
                h(ChevronRightIcon, { createElement: h })
              )
            )
        );
      };

      return h(AisCarousel, {
        items,
        itemComponent,
        sendEvent,
        showNavigation: false,
        headerComponent,
      });
    }),
  };

  return { layoutComponent };
}
