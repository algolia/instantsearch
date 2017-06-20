/* eslint-disable import/default */
import {storiesOf} from 'dev-novel';
import * as jqueryWidgets from './custom-widgets/jquery/index.js';

import wrapWithHits from './wrap-with-hits.js';

// transform `container` to jQuery object
const wrap = fn => wrapWithHits(container => fn(window.$(container)));

export default () => {
  storiesOf('Pagination').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.pagination({
        containerNode,
        maxPages: 20,
      })
    );
  }));

  storiesOf('Menu')
    .add('default', wrap(containerNode => {
      window.search.addWidget(
        jqueryWidgets.menu({
          containerNode,
          attributeName: 'categories',
          limit: 3,
        })
      );
    }))
    .add('with show more', wrap(containerNode => {
      window.search.addWidget(
        jqueryWidgets.showMoreMenu({
          containerNode,
          attributeName: 'categories',
          limit: 3,
          showMoreLimit: 10,
        })
      );
    }));

  storiesOf('ClearAll').add('default', wrap(containerNode => {
    window.search.addWidget(jqueryWidgets.clearAll({containerNode}));
  }));

  storiesOf('CurrentRefinedValues').add('default', wrap(containerNode => {
    window.search.addWidget(jqueryWidgets.currentRefinedValues({containerNode}));
  }));

  storiesOf('HitsPerPageSelector').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.hitsPerPageSelector({
        containerNode,
        items: [
          {value: 3, label: '3 per page'},
          {value: 5, label: '5 per page'},
          {value: 10, label: '10 per page'},
        ],
      })
    );
  }));

  storiesOf('HierarchicalMenu').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.hierarchicalMenu({
        containerNode,
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ],
      })
    );
  }));

  storiesOf('Hits').add('default', wrap(containerNode => {
    window.search.addWidget(jqueryWidgets.hits({containerNode}));
  }));

  storiesOf('RefinementList').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.refinementList({
        containerNode,
        attributeName: 'brand',
        operator: 'or',
        limit: 10,
        title: 'Brands',
      })
    );
  }));

  storiesOf('NumericSelector').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.numericSelector({
        containerNode,
        operator: '>=',
        attributeName: 'popularity',
        options: [
          {label: 'Default', value: 0},
          {label: 'Top 10', value: 9991},
          {label: 'Top 100', value: 9901},
          {label: 'Top 500', value: 9501},
        ],
      })
    );
  }));

  storiesOf('NumericRefinementList').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.numericRefinementList({
        containerNode,
        attributeName: 'price',
        operator: 'or',
        options: [
          {name: 'All'},
          {end: 4, name: 'less than 4'},
          {start: 4, end: 4, name: '4'},
          {start: 5, end: 10, name: 'between 5 and 10'},
          {start: 10, name: 'more than 10'},
        ],
      })
    );
  }));

  storiesOf('PriceRanges').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.priceRanges({
        containerNode,
        attributeName: 'price',
      })
    );
  }));

  storiesOf('SearchBox').add('default', wrap(containerNode => {
    const inputNode = document.createElement('input');
    containerNode.appendChild(inputNode);
    window.search.addWidget(jqueryWidgets.searchBox({inputNode}));
  }));

  storiesOf('SortBySelector').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.sortBySelector({
        containerNode,
        indices: [
          {name: 'instant_search', label: 'Most relevant'},
          {name: 'instant_search_price_asc', label: 'Lowest price'},
          {name: 'instant_search_price_desc', label: 'Highest price'},
        ],
      })
    );
  }));

  storiesOf('StarRating').add('default', containerNode => {
    window.search.addWidget(
      jqueryWidgets.starRating({
        containerNode,
        attributeName: 'rating',
        max: 5,
      })
    );
  });

  storiesOf('Stats').add('default', wrap(containerNode => {
    window.search.addWidget(jqueryWidgets.stats({containerNode}));
  }));

  storiesOf('Toggle').add('default', wrap(containerNode => {
    window.search.addWidget(
      jqueryWidgets.toggle({
        containerNode,
        attributeName: 'free_shipping',
        label: 'Free Shipping (toggle single value)',
        title: 'Free Shipping',
      })
    );
  }));

  storiesOf('InfiniteHits').add('default', wrap(containerNode => {
    window.search.addWidget(jqueryWidgets.infiniteHits({containerNode}));
  }));
};
