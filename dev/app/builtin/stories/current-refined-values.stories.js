/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('CurrentRefinements');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        });

        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({ container })
        );
      })
    )
    .add(
      'without refinements',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        });

        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            transformItems: items =>
              items.map(item => ({
                ...item,
                name: `${item.name} (transformed)`,
              })),
          })
        );
      })
    );
};
