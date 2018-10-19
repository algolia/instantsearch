/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('CurrentRefinedValues');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({ container })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
    )
    .add(
      'with header',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              templates: {
                header: 'Current refinements',
              },
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
    )
    .add(
      'with header but no refinements',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.currentRefinedValues({
            container,
            autoHideContainer: false,
            templates: {
              header: 'Current refinements',
            },
          })
        );
      })
    )
    .add(
      'with clearsQuery',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              clearsQuery: true,
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
    )
    .add(
      'with transformed items',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              clearsQuery: true,
              transformItems: items =>
                items.map(item => ({
                  ...item,
                  name: `${item.name} (transformed)`,
                })),
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
    )
    .add(
      'with onlyListedAttributes',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              onlyListedAttributes: true,
              clearsQuery: true,
              attributes: [
                {
                  name: 'brand',
                  label: 'Brand',
                },
                {
                  name: 'query', // This does not work
                },
              ],
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          },
        }
      )
    );
};
