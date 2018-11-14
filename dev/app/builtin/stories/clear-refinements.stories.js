/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
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
      'with nothing to clear',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
          })
        );
      })
    )
    .add(
      'with clear refinements and query',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearRefinements({
              container,
              clearsQuery: true,
              templates: {
                link: 'Clear refinements and query',
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
    );
};
