/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('ClearRefinements');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearRefinements({
              container,
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    )
    .add(
      'with query only (via includedAttributes)',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
            includedAttributes: ['query'],
            templates: {
              resetLabel: 'Clear query',
            },
          })
        );
      })
    )
    .add(
      'with query only (via excludedAttributes)',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
            excludedAttributes: [],
            templates: {
              resetLabel: 'Clear refinements and query',
            },
          })
        );
      })
    )
    .add(
      'with refinements and query',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearRefinements({
              container,
              excludedAttributes: [],
              templates: {
                resetLabel: 'Clear refinements and query',
              },
            })
          );
        },
        {
          searchParameters: {
            disjunctiveFacetsRefinements: { brand: ['Apple'] },
            disjunctiveFacets: ['brand'],
          },
        }
      )
    )
    .add(
      'with nothing to clear',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
          })
        );
      })
    );
};
