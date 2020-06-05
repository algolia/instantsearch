import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import moviesPlayground from '../.storybook/playgrounds/movies';
import queryRuleCustomData from '../src/widgets/query-rule-custom-data/query-rule-custom-data';

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

storiesOf('Metadata/QueryRuleCustomData', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        queryRuleCustomData({
          container: widgetContainer,
          templates: {
            default: ({ items }: { items: CustomDataItem[] }) =>
              items
                .map(item => {
                  const { title, banner, link } = item;

                  if (!banner) {
                    return '';
                  }

                  return `
                  <section>
                    <h2>${title}</h2>

                    <a href="${link}">
                      <img src="${banner}" alt="${title}">
                    </a>
                  </section>
                `;
                })
                .join(''),
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with Hogan',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          templates: {
            default: `
            {{#items}}
              {{#banner}}
                <section>
                  <h2>{{title}}</h2>

                  <a href="{{link}}">
                    <img src="{{banner}}" alt="{{title}}">
                  </a>
                </section>
              {{/banner}}
            {{/items}}`,
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with default and single banner',
    withHits(({ search, container }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML =
        'Kill Bill appears whenever no other results are promoted. Type <q>music</q> to see another movie promoted.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        queryRuleCustomData({
          container: widgetContainer,
          transformItems: (items: CustomDataItem[]) => {
            if (items.length > 0) {
              return items.filter(item => typeof item.banner !== 'undefined');
            }

            return [
              {
                title: 'Kill Bill',
                banner:
                  'http://static.bobatv.net/IMovie/mv_2352/poster_2352.jpg',
                link: 'https://www.netflix.com/title/60031236',
              },
            ];
          },
          templates: {
            default({ items }: { items: CustomDataItem[] }) {
              if (items.length === 0) {
                return '';
              }

              const { title, banner, link } = items[0];

              return `
              <h2>${title}</h2>

              <a href="${link}">
                <img src="${banner}" alt="${title}">
              </a>
            `;
            },
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'without template',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('p');
      description.innerHTML = 'Type <q>music</q> and a banner will appear.';

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidgets([
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
        }),
      ]);
    }, searchOptions)
  );
