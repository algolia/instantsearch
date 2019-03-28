import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import moviesPlayground from '../.storybook/playgrounds/movies';

type CustomDataItem = {
  title: string;
  banner: string;
  link: string;
};

const searchOptions = {
  appId: 'latency',
  apiKey: 'af044fb0788d6bb15f807e4420592bc5',
  indexName: 'instant_search_movies',
  playground: moviesPlayground,
};

storiesOf('QueryRuleCustomData', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidget(
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          transformItems: (items: CustomDataItem[]) => items[0],
          templates: {
            default({ title, banner, link }: CustomDataItem) {
              if (!banner) {
                return '';
              }

              return `
                <h2>${title}</h2>

                <a href="${link}">
                  <img src="${banner}" alt="${title}">
                </a>
              `;
            },
          },
        })
      );
    }, searchOptions)
  )
  .add(
    'with default banner',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML =
        'Kill Bill appears whenever no other results are promoted. Type <q>music</q> to see another movie promoted.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidget(
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          transformItems: (items: CustomDataItem[]) => {
            if (items.length > 0) {
              return items[0];
            }

            return {
              title: 'Kill Bill',
              banner: 'http://static.bobatv.net/IMovie/mv_2352/poster_2352.jpg',
              link: 'https://www.netflix.com/title/60031236',
            };
          },
          templates: {
            default({ title, banner, link }: CustomDataItem) {
              if (!banner) {
                return '';
              }

              return `
                <h2>${title}</h2>

                <a href="${link}">
                  <img src="${banner}" alt="${title}">
                </a>
              `;
            },
          },
        })
      );
    }, searchOptions)
  );
