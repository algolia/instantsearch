/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('ClearAll');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearAll({
              container,
              autoHideContainer: false,
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
          instantsearch.widgets.clearAll({
            container,
            autoHideContainer: false,
          })
        );
      })
    )
    .add(
      'with clear refinements and query',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.clearAll({
              container,
              autoHideContainer: false,
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
