/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Panel');

export default () => {
  stories
    .add(
      'with default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.panel({
            templates: {
              header: 'Header',
              footer: 'Footer',
            },
            hidden: ({ canRefine }) => !canRefine,
          })(instantsearch.widgets.refinementList)({
            container,
            attribute: 'brand',
          })
        );
      })
    )
    .add(
      'with currentRefinements',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.panel({
            templates: {
              header: 'Header',
              footer: ({ items }) =>
                items
                  ? `${items.length} items | ${items.reduce(
                      (sum, item) => sum + item.refinements.length,
                      0
                    )} refinements`
                  : '',
            },
          })(instantsearch.widgets.currentRefinements)({
            container,
          })
        );
      })
    );
};
