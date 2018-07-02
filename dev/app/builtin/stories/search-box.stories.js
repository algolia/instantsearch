/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

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
            poweredBy: true,
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
            poweredBy: true,
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
            poweredBy: true,
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
            poweredBy: true,
            magnifier: {
              template: '<div class="ais-search-box--magnifier">🔍</div>',
            },
            reset: {
              template: '<div class="ais-search-box--reset">✖️</div>',
            },
            templates: {
              poweredBy: 'Algolia',
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
            poweredBy: true,
            searchOnEnterKeyPressOnly: true,
          })
        );
      })
    )
    .add(
      'input with initial value',
      wrapWithHits(container => {
        container.innerHTML = '<input value="ok"/>';
        const input = container.firstChild;
        container.appendChild(input);
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container: input,
          })
        );
      })
    )
    .add(
      'with a provided input',
      wrapWithHits(container => {
        container.innerHTML = '<input/>';
        const input = container.firstChild;
        container.appendChild(input);
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container: input,
          })
        );
      })
    )
    .add(
      'with a provided input and the loading indicator',
      wrapWithHits(container => {
        container.innerHTML = '<input/>';
        const input = container.firstChild;
        container.appendChild(input);
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container: input,
            loadingIndicator: true,
          })
        );
      })
    );
};
