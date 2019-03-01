import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';

storiesOf('Index', module).add(
  'with two indices',
  withHits(({ search, container, instantsearch }) => {
    const $buttonAddWidgets = document.createElement('button');
    $buttonAddWidgets.textContent = 'Add widgets';
    $buttonAddWidgets.style.marginRight = '10px';

    const $buttonRemoveidgets = document.createElement('button');
    $buttonRemoveidgets.textContent = 'Remove widgets';

    const $instantSearchTitle = document.createElement('h2');
    $instantSearchTitle.innerHTML = '<code>instant_search</code>';
    const $instantSearchSearchBox = document.createElement('div');
    $instantSearchSearchBox.style.marginBottom = '15px';
    const $instantSearchHits = document.createElement('div');

    const $bestbuyTitle = document.createElement('h2');
    $bestbuyTitle.innerHTML = '<code>bestbuy</code>';
    const $bestbuySearchBox = document.createElement('div');
    $bestbuySearchBox.style.marginBottom = '15px';
    const $bestbuyHits = document.createElement('div');

    container.appendChild($buttonAddWidgets);
    container.appendChild($buttonRemoveidgets);

    container.appendChild($instantSearchTitle);
    container.appendChild($instantSearchSearchBox);
    container.appendChild($instantSearchHits);

    container.appendChild($bestbuyTitle);
    container.appendChild($bestbuySearchBox);
    container.appendChild($bestbuyHits);

    // Top level
    const topLevelConfigure = instantsearch.widgets.configure({
      hitsPerPage: 3,
    });

    // instant_search
    const instantSearchIndex = index({
      indexName: 'instant_search',
    });

    const instantSearchConfigure = instantsearch.widgets.configure({
      hitsPerPage: 2,
    });

    const instantSearchSearchBox = instantsearch.widgets.searchBox({
      container: $instantSearchSearchBox,
    });

    const instantSearchSearchHits = instantsearch.widgets.hits({
      container: $instantSearchHits,
      templates: {
        item:
          '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
      },
    });

    instantSearchIndex.addWidgets([
      // Avoid collapsed line
      instantSearchConfigure,
      instantSearchSearchBox,
    ]);

    // bestbuy
    const bestbuyIndex = index({
      indexName: 'bestbuy',
    });

    const bestbuyConfigure = instantsearch.widgets.configure({
      hitsPerPage: 1,
    });

    const bestbuySearchBox = instantsearch.widgets.searchBox({
      container: $bestbuySearchBox,
    });

    const bestbuyHits = instantsearch.widgets.hits({
      container: $bestbuyHits,
      escapeHTML: true,
      templates: {
        item:
          '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
      },
    });

    bestbuyIndex.addWidgets([bestbuyConfigure]);

    // Search
    search.addWidgets([
      topLevelConfigure,

      instantSearchIndex.addWidgets([instantSearchSearchHits]),
    ]);

    instantSearchIndex.addWidgets([
      bestbuyIndex.addWidgets([
        // Avoid collapsed line
        bestbuySearchBox,
        bestbuyHits,
      ]),
    ]);

    // Add widgets dynamically
    $buttonAddWidgets.addEventListener('click', () => {
      instantSearchIndex.addWidgets([bestbuyIndex]);
    });

    // Remove widgets dynamically
    $buttonRemoveidgets.addEventListener('click', () => {
      // remove a top level widget
      // search.removeWidgets([topLevelConfigure]);

      // remove a widget of an index
      // instantSearchIndex.removeWidgets([instantSearchConfigure]);

      // remove an index
      instantSearchIndex.removeWidgets([bestbuyIndex]);
    });
  })
);
