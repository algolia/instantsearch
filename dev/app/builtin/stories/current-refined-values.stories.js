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
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

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
      'with only price included',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            includedAttributes: [{ name: 'price' }],
          })
        );
      })
    )
    .add(
      'with price excluded',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            excludedAttributes: ['price'],
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            transformItems: items =>
              items.map(item => ({
                ...item,
                computedLabel: item.computedLabel.toUpperCase(),
              })),
          })
        );
      })
    );
};
