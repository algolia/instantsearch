/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('CurrentRefinements');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: {
              brand: ['Google', 'Apple', 'Samsung'],
            },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({ container })
        );
      })
    )
    .add(
      'without refinements',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
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
          instantsearch.widgets.currentRefinements({
            container,
            includedAttributes: ['price'],
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
          instantsearch.widgets.currentRefinements({
            container,
            excludedAttributes: ['query', 'price'],
          })
        );
      })
    )
    .add(
      'with query',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container,
            includesQuery: true,
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
          instantsearch.widgets.currentRefinements({
            container,
            transformItems: items =>
              items.map(refinement => ({
                ...refinement,
                items: refinement.items.map(item => ({
                  ...item,
                  label: item.label.toUpperCase(),
                })),
              })),
          })
        );
      })
    );
};
