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
    jqueryWidgets.hierarchicalMenu({
      containerNode: window.$('#hierarchical-menu'),
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
};
