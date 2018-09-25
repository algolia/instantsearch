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
          })
        );
      })
    )
    .add(
      'with a custom placeholder',
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
      'do not display the loading indicator',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container,
            showLoadingIndicator: false,
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
            templates: {
              loadingIndicator: '⚡️',
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
            templates: {
              submit: '<div class="ais-search-box--magnifier">🔍</div>',
              reset: '<div class="ais-search-box--reset">✖️</div>',
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
            searchAsYouType: false,
          })
        );
      })
    );
};
