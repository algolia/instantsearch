import { storiesOf } from 'dev-novel';
import wrapWithHits from '../utils/wrap-with-hits.js';
import * as widgets from './widgets/index.js';

export default () => {
  storiesOf('SearchBox')
    .add(
      'default',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          widgets.searchBox({
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
          widgets.searchBoxReturn({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    );

  storiesOf('ClearAll').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(widgets.clearAll({ containerNode }));
    })
  );

  storiesOf('Hits').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(widgets.hits({ containerNode }));
    })
  );

  storiesOf('Menu').add(
    'select',
    wrapWithHits(containerNode => {
      window.search.addWidget(
        widgets.selectMenu({
          containerNode,
          attributeName: 'brand',
          limit: 10,
          title: 'Brands',
        })
      );
    })
  );

  storiesOf('RefinementList').add(
    'default',
    wrapWithHits(containerNode => {
      window.search.addWidget(
        widgets.refinementList({
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
