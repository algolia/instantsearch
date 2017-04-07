/* eslint-disable import/default */
import * as vanillaWidgets from './custom-widgets/vanilla/index.js';

export default search => {
  search.addWidget(
    vanillaWidgets.searchBox({
      node: document.getElementById('search-box'),
      placeholder: 'Search for products',
    })
  );

  search.addWidget(
    vanillaWidgets.searchBoxReturn({
      node: document.getElementById('search-box-return'),
      placeholder: 'Search for products',
    })
  );

  search.addWidget(
    vanillaWidgets.clearAll({
      containerNode: document.getElementById('clear-all'),
    })
  );

  search.addWidget(
    vanillaWidgets.hits({
      containerNode: document.getElementById('hits'),
    })
  );
};
