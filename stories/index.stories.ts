import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';
import { hitsItemTemplate } from '../.storybook/playgrounds/default';
import { configure, hits } from '../src/widgets';

storiesOf('Basics/Index', module)
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
            configure({
              hitsPerPage: 2,
            }),
            hits({
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
            configure({
              hitsPerPage: 1,
            }),
            hits({
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
    'with nested levels',
    withHits(({ search, container, instantsearch }) => {
      const instantSearchPriceAscTitle = document.createElement('h3');
      instantSearchPriceAscTitle.innerHTML =
        '<code>instant_search_price_asc</code>';
      const instantSearchPriceAscHits = document.createElement('div');
      const instantSearchPriceAsc = document.createElement('div');
      const instantSearchPriceAscPagination = document.createElement('div');

      container.appendChild(instantSearchPriceAscTitle);
      container.appendChild(instantSearchPriceAsc);
      container.appendChild(instantSearchPriceAscHits);
      container.appendChild(instantSearchPriceAscPagination);

      const instantSearchRatingAscTitle = document.createElement('h3');
      instantSearchRatingAscTitle.innerHTML =
        '<code>instant_search_price_asc > instant_search_rating_asc</code>';
      const instantSearchRatingAsc = document.createElement('div');
      const instantSearchRatingAscHits = document.createElement('div');
      const instantSearchRatingAscPagination = document.createElement('div');

      container.appendChild(instantSearchRatingAscTitle);
      container.appendChild(instantSearchRatingAsc);
      container.appendChild(instantSearchRatingAscHits);
      container.appendChild(instantSearchRatingAscPagination);

      search.addWidgets([
        instantsearch.widgets
          .index({ indexName: 'instant_search_price_asc' })
          .addWidgets([
            configure({
              hitsPerPage: 2,
            }),
            hits({
              container: instantSearchPriceAscHits,
              templates: {
                item: hitsItemTemplate,
              },
              cssClasses: {
                item: 'hits-item',
              },
            }),
            instantsearch.widgets.pagination({
              container: instantSearchPriceAscPagination,
            }),

            instantsearch.widgets
              .index({ indexName: 'instant_search_rating_asc' })
              .addWidgets([
                configure({
                  hitsPerPage: 1,
                }),
                hits({
                  container: instantSearchRatingAscHits,
                  templates: {
                    item: hitsItemTemplate,
                  },
                  cssClasses: {
                    item: 'hits-item',
                  },
                }),
                instantsearch.widgets.pagination({
                  container: instantSearchRatingAscPagination,
                }),
              ]),
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
            configure({
              hitsPerPage: 2,
            }),
            hits({
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
