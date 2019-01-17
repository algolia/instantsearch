import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('SearchBox', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.searchBox({
          container,
        })
      );
    })
  )
  .add(
    'with a custom placeholder',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.searchBox({
          container,
          placeholder: 'Search for products',
        })
      );
    })
  )
  .add(
    'with autofocus',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.searchBox({
          container,
          autofocus: true,
        })
      );
    })
  )
  .add(
    'do not display the loading indicator',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.searchBox({
          container,
          showLoadingIndicator: false,
        })
      );
    })
  )
  .add(
    'display loading indicator with a template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
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
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
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
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.searchBox({
          container,
          searchAsYouType: false,
        })
      );
    })
  );
