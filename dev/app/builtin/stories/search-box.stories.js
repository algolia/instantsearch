/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('SearchBox');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
          })
        );
      })
    )
    .add(
      'display loading indicator',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            loadingIndicator: true,
          })
        );
      })
    )
    .add(
      'display loading indicator with a template',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            loadingIndicator: {
              template: '⚡️',
            },
          })
        );
      })
    )
    .add(
      'with custom templates',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            magnifier: {
              template: '<div class="ais-search-box--magnifier">🔍</div>',
            },
            reset: {
              template: '<div class="ais-search-box--reset">✖️</div>',
            },
          })
        );
      })
    )
    .add(
      'search on enter',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            placeholder: 'Search for products',
            searchAsYouType: false,
          })
        );
      })
    );
};
