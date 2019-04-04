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

storiesOf('QueryRuleContext', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('ul');
      description.innerHTML = `
        <li>On empty query, select the "Drama" category and The Shawshank Redemption appears</li>
        <li>On empty query, select the "Thriller" category and Pulp Fiction appears</li>
        <li>Type <q>music</q> and a banner will appear.</li>
      `;

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidget(
        instantsearch.widgets.queryRuleContext({
          trackedFilters: {
            genre: () => ['Thriller', 'Drama'],
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          transformItems(items: CustomDataItem[]) {
            return items.filter(item => typeof item.banner !== 'undefined');
          },
          templates: {
            default: ({ items }: { items: CustomDataItem[] }) =>
              items
                .map(item => {
                  const { title, banner, link } = item;

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
        })
      );
    }, searchOptions)
  )
  .add(
    'with initial filter',
    withHits(({ search, container, instantsearch }) => {
      const widgetContainer = document.createElement('div');
      const description = document.createElement('ul');
      description.innerHTML = `
        <li>Select the "Drama" category and The Shawshank Redemption appears</li>
        <li>Select the "Thriller" category and Pulp Fiction appears</li>
        <li>Type <q>music</q> and a banner will appear.</li>
      `;

      container.appendChild(description);
      container.appendChild(widgetContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: {
            genre: ['Drama'],
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.queryRuleContext({
          trackedFilters: {
            genre: () => ['Thriller', 'Drama'],
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.queryRuleCustomData({
          container: widgetContainer,
          transformItems(items: CustomDataItem[]) {
            return items.filter(item => typeof item.banner !== 'undefined');
          },
          templates: {
            default: ({ items }: { items: CustomDataItem[] }) =>
              items.map(item => {
                const { title, banner, link } = item;

                return `
                  <section>
                    <h2>${title}</h2>

                    <a href="${link}">
                      <img src="${banner}" alt="${title}">
                    </a>
                  </section>
                `;
              }),
          },
        })
      );
    }, searchOptions)
  );
