/* eslint-disable import/default */
import { action, storiesOf } from 'dev-novel';
import instantsearch from '../../index.js';

import wrapWithHits from './wrap-with-hits.js';

export default () => {
  storiesOf('Analytics').add(
    'default',
    wrapWithHits(container => {
      const description = document.createElement('p');
      description.innerText = 'Search for something, look into Action Logger';
      container.appendChild(description);

      window.search.addWidget(
        instantsearch.widgets.analytics({
          pushFunction(formattedParameters, state, results) {
            action('pushFunction[formattedParameters]')(formattedParameters);
            action('pushFunction[state]')(state);
            action('pushFunction[results]')(results);
          },
          triggerOnUIInteraction: true,
          pushInitialSearch: false,
        })
      );
    })
  );

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

  storiesOf('HitsPerPageSelector').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.hitsPerPageSelector({
          container,
          items: [
            { value: 3, label: '3 per page' },
            { value: 5, label: '5 per page' },
            { value: 10, label: '10 per page' },
          ],
        })
      );
    })
  );

  storiesOf('Hits').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(instantsearch.widgets.hits({ container }));
    })
  );

  storiesOf('InfiniteHits').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.infiniteHits({
          container,
          showMoreLabel: 'Show more',
        })
      );
    })
  );

  storiesOf('Pagination').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.pagination({
          container,
          maxPages: 20,
        })
      );
    })
  );

  storiesOf('ClearAll')
    .add(
      'default',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearAll({
              container,
              autoHideContainer: false,
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    )
    .add(
      'with nothing to clear',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.clearAll({
            container,
            autoHideContainer: false,
          })
        );
      })
    )
    .add(
      'with clear refinements and query',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearAll({
              container,
              autoHideContainer: false,
              clearsQuery: true,
              templates: {
                link: 'Clear refinements and query',
              },
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    );

  storiesOf('CurrentRefinedValues')
    .add(
      'default',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({ container })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    )
    .add(
      'with header',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              templates: {
                header: 'Current refinements',
              },
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    )
    .add(
      'with header but no refinements',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            autoHideContainer: false,
            templates: {
              header: 'Current refinements',
            },
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

  storiesOf('NumericRefinementList').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
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

  storiesOf('Menu')
    .add(
      'Default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
          })
        );
      })
    )
    .add(
      'with show more and header',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
            limit: 3,
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
            },
            templates: {
              header: 'Categories (menu widget)',
            },
          })
        );
      })
    );

  storiesOf('RangeSlider').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
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
      );
    })
  );

  storiesOf('HierarchicalMenu')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
          })
        );
      })
    )
    .add(
      'with default selected item',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.hierarchicalMenu({
              container,
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ],
              rootPath: 'Cameras & Camcorders',
            })
          );
        },
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
    )
    .add(
      'with header',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
            templates: {
              header: 'Hierarchical categories',
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

  storiesOf('NumericSelector').add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
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
      );
    })
  );
};
