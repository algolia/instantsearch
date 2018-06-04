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
      'with custom css classes',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              templates: {
                panelHeader: 'Current refinements',
                panelFooter: 'Brought to you by Algolia',
              },
              cssClasses: {
                clearAll: 'ca',
                list: 'l',
                item: 'i',
                link: 'lnk',
                count: 'cnt',
                panelRoot: 'crv-root',
                panelHeader: 'crv-header',
                panelBody: 'crv-body',
                panelFooter: 'crv-footer',
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
      'with header and footer',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.currentRefinedValues({
              container,
              templates: {
                panelHeader: 'Current refinements',
                panelFooter: 'Brought to you by Algolia',
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
              panelHeader: 'Current refinements',
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
    );
};
