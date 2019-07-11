import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';
import { hitsItemTemplate } from '../.storybook/playgrounds/default';

storiesOf('Index', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const instantSearchPriceAscTitle = document.createElement('h3');
      instantSearchPriceAscTitle.innerHTML =
        '<code>instant_search_price_asc</code>';
      const instantSearchPriceAscHits = document.createElement('div');
      const instantSearchPriceAsc = document.createElement('div');

      container.appendChild(instantSearchPriceAscTitle);
      container.appendChild(instantSearchPriceAsc);
      container.appendChild(instantSearchPriceAscHits);

      const instantSearchRatingAscTitle = document.createElement('h3');
      instantSearchRatingAscTitle.innerHTML =
        '<code>instant_search_rating_asc</code>';
      const instantSearchRatingAsc = document.createElement('div');
      const instantSearchRatingAscHits = document.createElement('div');

      container.appendChild(instantSearchRatingAscTitle);
      container.appendChild(instantSearchRatingAsc);
      container.appendChild(instantSearchRatingAscHits);

      search.addWidgets([
        instantsearch.widgets
          .index({ indexName: 'instant_search_price_asc' })
          .addWidgets([
            instantsearch.widgets.configure({
              hitsPerPage: 2,
            }),
            instantsearch.widgets.hits({
              container: instantSearchPriceAscHits,
              templates: {
                item: hitsItemTemplate,
              },
              cssClasses: {
                item: 'hits-item',
              },
            }),
          ]),

        instantsearch.widgets
          .index({ indexName: 'instant_search_rating_asc' })
          .addWidgets([
            instantsearch.widgets.configure({
              hitsPerPage: 1,
            }),
            instantsearch.widgets.hits({
              container: instantSearchRatingAscHits,
              templates: {
                item: hitsItemTemplate,
              },
              cssClasses: {
                item: 'hits-item',
              },
            }),
          ]),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      const lifecycle = document.createElement('div');
      const preview = document.createElement('div');

      container.appendChild(lifecycle);
      container.appendChild(preview);

      const instantSearchPriceAscHits = document.createElement('div');
      const instantSearchPriceAsc = document.createElement('div');

      preview.appendChild(instantSearchPriceAsc);
      preview.appendChild(instantSearchPriceAscHits);

      withLifecycle(search, lifecycle, () =>
        instantsearch.widgets
          .index({ indexName: 'instant_search_price_asc' })
          .addWidgets([
            instantsearch.widgets.configure({
              hitsPerPage: 2,
            }),
            instantsearch.widgets.hits({
              container: instantSearchPriceAscHits,
              templates: {
                item: hitsItemTemplate,
              },
              cssClasses: {
                item: 'hits-item',
              },
            }),
          ])
      );
    })
  );
