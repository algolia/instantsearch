/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../index.js';
import wrapWithHits from '../utils/wrap-with-hits.js';
import initInstantSearchStories from './stories/instantsearch.stories';
import initAnalyticsStories from './stories/analytics.stories';
import initClearAllStories from './stories/clear-all.stories';
import initCurrentRefinedValuesStories from './stories/current-refined-values.stories';
import initHierarchicalMenu from './stories/hierarchical-menu.stories';
import initHitsStories from './stories/hits.stories';
import initHitsPerPageSelectorStories from './stories/hits-per-page-selector.stories';
import initInfiniteHitsStories from './stories/infinite-hits.stories';
import initMenuStories from './stories/menu.stories';
import initNumericRefinementListStories from './stories/numeric-refinement-list.stories';
import initNumericSelectorStories from './stories/numeric-selector.stories';
import initPaginationStories from './stories/pagination.stories';

export default () => {
  initInstantSearchStories();
  initAnalyticsStories();
  initClearAllStories();
  initCurrentRefinedValuesStories();
  initHierarchicalMenu();
  initHitsStories();
  initHitsPerPageSelectorStories();
  initInfiniteHitsStories();
  initMenuStories();
  initNumericRefinementListStories();
  initNumericSelectorStories();
  initPaginationStories();

  storiesOf('SearchBox')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            poweredBy: true,
          })
        );
      })
    )
    .add(
      'search on enter',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            poweredBy: true,
            searchOnEnterKeyPressOnly: true,
          })
        );
      })
    )
    .add(
      'input with initial value',
      wrapWithHits(container => {
        container.innerHTML = '<input value="ok"/>';
        const input = container.firstChild;
        container.appendChild(input);
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container: input,
          })
        );
      })
    );

  storiesOf('Stats').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(instantsearch.widgets.stats({ container }));
    })
  );

  storiesOf('SortBySelector').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.sortBySelector({
          container,
          indices: [
            { name: 'instant_search', label: 'Most relevant' },
            { name: 'instant_search_price_asc', label: 'Lowest price' },
            { name: 'instant_search_price_desc', label: 'Highest price' },
          ],
        })
      );
    })
  );

  storiesOf('RefinementList')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Brands',
            },
          })
        );
      })
    )
    .add(
      'with show more',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'brand',
            operator: 'or',
            limit: 3,
            templates: {
              header: 'Brands with show more',
            },
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
            },
          })
        );
      })
    )
    .add(
      'with search inside items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Searchable brands',
            },
            searchForFacetValues: {
              placeholder: 'Find other brands...',
              templates: {
                noResults: 'No results',
              },
            },
          })
        );
      })
    )
    .add(
      'with search inside items (using the default noResults template)',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Searchable brands',
            },
            searchForFacetValues: {
              placeholder: 'Find other brands...',
            },
          })
        );
      })
    )
    .add(
      'with operator `and`',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'price_range',
            operator: 'and',
            limit: 10,
            cssClasses: {
              header: 'facet-title',
              item: 'facet-value checkbox',
              count: 'facet-count pull-right',
              active: 'facet-active',
            },
            templates: {
              header: 'Price ranges',
            },
            transformData(data) {
              data.label = data.label
                .replace(/(\d+) - (\d+)/, '$$$1 - $$$2')
                .replace(/> (\d+)/, '> $$$1');
              return data;
            },
          })
        );
      })
    );

  storiesOf('StarRating').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.starRating({
          container,
          attributeName: 'rating',
          max: 5,
          labels: {
            andUp: '& Up',
          },
          templates: {
            header: 'Rating',
          },
        })
      );
    })
  );

  storiesOf('Toggle')
    .add(
      'with single value',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'free_shipping',
            label: 'Free Shipping (toggle single value)',
            templates: {
              header: 'Shipping',
            },
          })
        );
      })
    )
    .add(
      'with on & off values',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'brand',
            label: 'Canon (not checked) or sony (checked)',
            values: {
              on: 'Sony',
              off: 'Canon',
            },
            templates: {
              header: 'Google or amazon (toggle two values)',
            },
          })
        );
      })
    );

  storiesOf('RangeSlider')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'disabled',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            min: 100,
            max: 50,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'collapsible',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            collapsible: {
              collapsed: false,
            },
            templates: {
              header: 'Price',
            },
          })
        );
      })
    )
    .add(
      'with step',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            step: 500,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'without pips',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            pips: false,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'with 0 as first pit',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            min: 0,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'with min boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            min: 36,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'with max boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            max: 36,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    )
    .add(
      'with min / max boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            templates: {
              header: 'Price',
            },
            min: 10,
            max: 500,
            tooltips: {
              format(rawValue) {
                return `$${Math.round(rawValue).toLocaleString()}`;
              },
            },
          })
        );
      })
    );

  storiesOf('PriceRanges').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.priceRanges({
          container,
          attributeName: 'price',
          templates: {
            header: 'Price ranges',
          },
        })
      );
    })
  );
};
