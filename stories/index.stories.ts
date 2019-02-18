import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';

storiesOf('Index', module).add(
  'with two indices',
  withHits(({ search, container, instantsearch }) => {
    const instantSearchTitle = document.createElement('h2');
    instantSearchTitle.innerHTML = '<code>instant_search</code>';
    const instantSearchSearchBox = document.createElement('div');
    instantSearchSearchBox.style.marginBottom = '15px';
    const instantSearchHits = document.createElement('div');

    const bestbuyTitle = document.createElement('h2');
    bestbuyTitle.innerHTML = '<code>bestbuy</code>';
    const bestbuySearchBox = document.createElement('div');
    bestbuySearchBox.style.marginBottom = '15px';
    const bestbuyHits = document.createElement('div');

    container.appendChild(instantSearchTitle);
    container.appendChild(instantSearchSearchBox);
    container.appendChild(instantSearchHits);

    container.appendChild(bestbuyTitle);
    container.appendChild(bestbuySearchBox);
    container.appendChild(bestbuyHits);

    search.addWidgets([
      index({ indexName: 'instant_search' }).addWidgets([
        instantsearch.widgets.searchBox({
          container: instantSearchSearchBox,
        }),

        instantsearch.widgets.hits({
          container: instantSearchHits,
          templates: {
            item:
              '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
          },
        }),
      ]),

      index({ indexName: 'bestbuy' }).addWidgets([
        instantsearch.widgets.searchBox({
          container: bestbuySearchBox,
        }),

        instantsearch.widgets.hits({
          container: bestbuyHits,
          templates: {
            item:
              '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
          },
        }),
      ]),
    ]);
  })
);
