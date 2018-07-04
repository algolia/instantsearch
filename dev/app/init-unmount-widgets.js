/* eslint-disable import/default */
import { storiesOf } from 'dev-novel';
import instantsearch from '../../index';

import { wrapWithHits } from './utils/wrap-with-hits';

function wrapWithUnmount(getWidget, params) {
  return wrapWithHits(container => {
    container.innerHTML = `
      <div>
        <div id="widgetContainer"></div>
        <div style="margin: 10px; border-top: solid 1px #E4E4E4;">
          <button id="unmount" style="float: left; margin-right: 10px; margin-top: 10px">
            Unmount widget
          </div>
          <button id="remount" style="float: left; margin-right: 10px;">
            Remount widget
          </div>
          <button id="reload" style="float: left;">
            Reload
          </div>
        </div>
      </div>
    `;

    const widget = getWidget('#widgetContainer');

    window.search.addWidget(widget);

    function unmount() {
      window.search.removeWidget(widget);
      document
        .getElementById('unmount')
        .removeEventListener('click', unmount, false);
    }

    function remount() {
      window.search.addWidget(widget);
      document
        .getElementById('remount')
        .removeEventListener('click', remount, false);
    }

    function reload() {
      window.location.reload();
      document
        .getElementById('reload')
        .removeEventListener('click', reload, false);
    }

    document
      .getElementById('unmount')
      .addEventListener('click', unmount, false);

    document
      .getElementById('remount')
      .addEventListener('click', remount, false);

    document.getElementById('reload').addEventListener('click', reload, false);
  }, params);
}

export default () => {
  storiesOf('ClearAll').add(
    'default',
    wrapWithUnmount(
      container => instantsearch.widgets.clearAll({ container }),
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  );

  storiesOf('CurrentRefinedValues').add(
    'default',
    wrapWithUnmount(
      container => instantsearch.widgets.currentRefinedValues({ container }),
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  );

  storiesOf('HierarchicalMenu').add(
    'default',
    wrapWithUnmount(
      container =>
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        }),
      {
        searchParameters: {
          hierarchicalFacetsRefinements: {
            'hierarchicalCategories.lvl0': [
              'Cameras & Camcorders > Digital Cameras',
            ],
          },
        },
      }
    )
  );

  storiesOf('Breadcrumb').add(
    'default',
    wrapWithUnmount(
      container =>
        instantsearch.widgets.breadcrumb({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        }),
      {
        searchParameters: {
          hierarchicalFacetsRefinements: {
            'hierarchicalCategories.lvl0': [
              'Cameras & Camcorders > Digital Cameras',
            ],
          },
        },
      }
    )
  );

  storiesOf('Hits').add(
    'default',
    wrapWithUnmount(container => instantsearch.widgets.hits({ container }))
  );

  storiesOf('HitsPerPage').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.hitsPerPageSelector({
        container,
        items: [
          { value: 3, label: '3 per page' },
          { value: 5, label: '5 per page' },
          { value: 10, label: '10 per page' },
        ],
      })
    )
  );

  storiesOf('InfiniteHits').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.infiniteHits({
        container,
        showMoreLabel: 'Show more',
        templates: {
          item: '{{name}}',
        },
      })
    )
  );

  storiesOf('Menu').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.menu({
        container,
        attributeName: 'categories',
      })
    )
  );

  storiesOf('NumericRefinementList').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.numericRefinementList({
        container,
        attributeName: 'price',
        operator: 'or',
        options: [
          { name: 'All' },
          { end: 4, name: 'less than 4' },
          { start: 4, end: 4, name: '4' },
          { start: 5, end: 10, name: 'between 5 and 10' },
          { start: 10, name: 'more than 10' },
        ],
        cssClasses: {
          header: 'facet-title',
          link: 'facet-value',
          count: 'facet-count pull-right',
          active: 'facet-active',
        },
        templates: {
          header: 'Numeric refinement list (price)',
        },
      })
    )
  );

  storiesOf('NumericSelector').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.numericSelector({
        container,
        operator: '>=',
        attributeName: 'popularity',
        options: [
          { label: 'Default', value: 0 },
          { label: 'Top 10', value: 9991 },
          { label: 'Top 100', value: 9901 },
          { label: 'Top 500', value: 9501 },
        ],
      })
    )
  );

  storiesOf('Pagination').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.pagination({
        container,
        maxPages: 20,
      })
    )
  );

  storiesOf('PriceRanges').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.priceRanges({
        container,
        attributeName: 'price',
        templates: {
          header: 'Price ranges',
        },
      })
    )
  );

  storiesOf('RefinementList').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.refinementList({
        container,
        attributeName: 'brand',
        operator: 'or',
        limit: 10,
        templates: {
          header: 'Brands',
        },
      })
    )
  );

  storiesOf('SearchBox').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.searchBox({
        container,
        placeholder: 'Search for products',
        poweredBy: true,
      })
    )
  );

  storiesOf('SortBySelector').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.sortBySelector({
        container,
        indices: [
          { name: 'instant_search', label: 'Most relevant' },
          { name: 'instant_search_price_asc', label: 'Lowest price' },
          { name: 'instant_search_price_desc', label: 'Highest price' },
        ],
      })
    )
  );

  storiesOf('StarRating').add(
    'default',
    wrapWithUnmount(container =>
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
    )
  );

  storiesOf('Stats').add(
    'default',
    wrapWithUnmount(container => instantsearch.widgets.stats({ container }))
  );

  storiesOf('Toggle').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.toggle({
        container,
        attributeName: 'free_shipping',
        label: 'Free Shipping (toggle single value)',
        templates: {
          header: 'Shipping',
        },
      })
    )
  );

  storiesOf('rangeSlider').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.rangeSlider({
        container,
        attributeName: 'price',
        templates: {
          header: 'Price',
        },
        max: 500,
        step: 10,
        tooltips: {
          format(rawValue) {
            return `$${Math.round(rawValue).toLocaleString()}`;
          },
        },
      })
    )
  );
};
