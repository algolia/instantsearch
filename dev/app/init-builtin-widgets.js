/* eslint-disable import/default */
import { action, storiesOf } from 'dev-novel';
import instantsearch from '../../index.js';

import wrapWithHits from './wrap-with-hits.js';

export default () => {
  storiesOf('Breadcrumb')
    .add(
      'default',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        // Custom Widget to toggle refinement
        window.search.addWidget({
          init({ helper }) {
            helper.toggleRefinement(
              'hierarchicalCategories.lvl0',
              'Cameras & Camcorders > Digital Cameras'
            );
          },
        });
      })
    )
    .add(
      'with custom home label',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            templates: { home: 'Home Page' },
          })
        );

        // Custom Widget to toggle refinement
        window.search.addWidget({
          init({ helper }) {
            helper.toggleRefinement(
              'hierarchicalCategories.lvl0',
              'Cameras & Camcorders > Digital Cameras'
            );
          },
        });
      })
    )
    .add(
      'with default selected item',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders > Digital Cameras',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            showParentLevel: false,
            container: '#hierarchicalMenu',
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
      'with hierarchical menu',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            separator: ' / ',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            showParentLevel: false,
            container: '#hierarchicalMenu',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
          })
        );
      })
    );

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

  storiesOf('HitsPerPageSelector')
    .add(
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
    )
    .add(
      'With default hitPerPage to 5',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hitsPerPageSelector({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page', default: true },
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

  storiesOf('InfiniteHits')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            templates: {
              item: '{{name}}',
            },
          })
        );
      })
    )
    .add(
      'with custom css classes',
      wrapWithHits(container => {
        const style = window.document.createElement('style');
        window.document.head.appendChild(style);
        style.sheet.insertRule(
          '.button button{border: 1px solid black; background: #fff;}'
        );

        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            cssClasses: {
              showmore: 'button',
            },
            templates: {
              item: '{{name}}',
            },
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
            numericRefinements: { price: { '>=': [100] } },
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
            numericRefinements: { price: { '>=': [100] } },
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
    )
    .add(
      'with clearsQuery',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              clearsQuery: true,
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
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
    )
    .add(
      'escape the facet values',
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
              escapeFacetValues: true,
            },
          })
        );
      })
    )
    .add(
      'with a hits widget with escapeHits set to true',
      wrapWithHits(container => {
        const list = document.createElement('div');
        const hits = document.createElement('div');
        container.appendChild(hits);
        container.appendChild(list);
        window.search.addWidget(
          instantsearch.widgets.hits({
            container: hits,
            templates: {
              item: '',
            },
            escapeHits: true,
          })
        );
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: list,
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
    )
    .add(
      'as a Select DOM element',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attributeName: 'categories',
            limit: 10,
          })
        );
      })
    );

  storiesOf('RangeInput')
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'disabled',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            min: 500,
            max: 0,
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'collapsible',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            collapsible: true,
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'with floating number',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            precision: 2,
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'with min boundary',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            min: 10,
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'with max boundary',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            max: 500,
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    )
    .add(
      'with min & max boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            min: 10,
            max: 500,
            templates: {
              header: 'Range input',
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
          })
        );
      })
    )
    .add(
      'with tooltips',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            tooltips: {
              format(rawValue) {
                return `$${rawValue}`;
              },
            },
          })
        );
      })
    )
    .add(
      'with precision',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attributeName: 'price',
            precision: 2,
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
          })
        );
      })
    )
    .add(
      'only show current level',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            showParentLevel: false,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
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
