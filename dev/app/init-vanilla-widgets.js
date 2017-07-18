/* eslint-disable import/default */
import { storiesOf } from 'dev-novel';

import * as vanillaWidgets from './custom-widgets/vanilla/index.js';
import wrapWithHits from './wrap-with-hits.js';

export default () => {
  storiesOf('SearchBox')
    .add(
      'default',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          vanillaWidgets.searchBox({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    )
    .add(
      'with enter to search',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          vanillaWidgets.searchBoxReturn({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    );

  storiesOf('ClearAll').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(vanillaWidgets.clearAll({ containerNode }));
    })
  );

  storiesOf('Hits').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(vanillaWidgets.hits({ containerNode }));
    })
  );

  storiesOf('RefinementList').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(
        vanillaWidgets.refinementList({
          containerNode,
          attributeName: 'brand',
          operator: 'or',
          limit: 10,
          title: 'Brands',
        })
      );
    })
  );
};
