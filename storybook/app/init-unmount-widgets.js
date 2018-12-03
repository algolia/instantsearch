/* eslint-disable import/default */
import { storiesOf } from 'dev-novel';
import instantsearch from '../../index.js';
import { wrapWithHits } from './utils/wrap-with-hits.js';

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
  storiesOf('ClearRefinements').add(
    'default',
    wrapWithUnmount(
      container => instantsearch.widgets.clearRefinements({ container }),
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  );

  storiesOf('CurrentRefinements').add(
    'default',
    wrapWithUnmount(
      container => instantsearch.widgets.currentRefinements({ container }),
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
      instantsearch.widgets.hitsPerPage({
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
        loadMoreLabel: 'Show more',
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

  storiesOf('NumericMenu').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.numericMenu({
        container,
        attribute: 'price',
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

  storiesOf('Pagination').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.pagination({
        container,
        totalPages: 20,
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

  storiesOf('SortBy').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.sortBy({
        container,
        items: [
          { value: 'instant_search', label: 'Most relevant' },
          { value: 'instant_search_price_asc', label: 'Lowest price' },
          { value: 'instant_search_price_desc', label: 'Highest price' },
        ],
      })
    )
  );

  storiesOf('RatingMenu').add(
    'default',
    wrapWithUnmount(container =>
      instantsearch.widgets.ratingMenu({
        container,
        attribute: 'rating',
        max: 5,
      })
    )
  );

  storiesOf('Stats').add(
    'default',
    wrapWithUnmount(container => instantsearch.widgets.stats({ container }))
  );

  storiesOf('ToggleRefinement').add(
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
