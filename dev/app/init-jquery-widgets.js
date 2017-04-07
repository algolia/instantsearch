/* eslint-disable import/default */
import * as jqueryWidgets from './custom-widgets/jquery/index.js';

export default search => {
  search.addWidget(
    jqueryWidgets.pagination({
      containerNode: window.$('#pagination'),
      maxPages: 20,
    })
  );

  search.addWidget(
    jqueryWidgets.menu({
      containerNode: window.$('#menu'),
      attributeName: 'categories',
      limit: 3,
    })
  );

  search.addWidget(
    jqueryWidgets.clearAll({
      containerNode: window.$('#clear-all'),
    })
  );

  search.addWidget(
    jqueryWidgets.currentRefinedValues({
      containerNode: window.$('#current-refined-values'),
    })
  );

  search.addWidget(
    jqueryWidgets.hitsPerPageSelector({
      containerNode: window.$('#hits-per-page-selector'),
      options: [
        {value: 6, label: '6 per page'},
        {value: 12, label: '12 per page'},
        {value: 24, label: '24 per page'},
      ],
    })
  );

  search.addWidget(
    jqueryWidgets.hierarchicalMenu({
      containerNode: window.$('#hierarchical-categories'),
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    })
  );

  search.addWidget(
    jqueryWidgets.hits({
      containerNode: window.$('#hits'),
    })
  );

  search.addWidget(
    jqueryWidgets.refinementList({
      containerNode: window.$('#brands'),
      attributeName: 'brand',
      operator: 'or',
      limit: 10,
      title: 'Brands',
    })
  );

  search.addWidget(
    jqueryWidgets.hitsPerPageSelector({
      containerNode: window.$('#hits-per-page-selector'),
      options: [
        {value: 6, label: '6 per page'},
        {value: 12, label: '12 per page'},
        {value: 24, label: '24 per page'},
      ],
    })
  );

  search.addWidget(
    jqueryWidgets.numericSelector({
      containerNode: window.$('#popularity-selector'),
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

  search.addWidget(
    jqueryWidgets.numericRefinementList({
      containerNode: window.$('#price-numeric-list'),
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

  search.addWidget(
    jqueryWidgets.priceRanges({
      containerNode: window.$('#price-ranges'),
      attributeName: 'price',
    })
  );
};
