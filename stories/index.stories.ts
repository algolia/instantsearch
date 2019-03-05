import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';

storiesOf('Index', module)
  .add(
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
  )
  .add(
    'with same indices',
    withHits(({ search, container, instantsearch }) => {
      const $instantSearchDiv = document.createElement('div');
      $instantSearchDiv.style.padding = '10px';
      $instantSearchDiv.style.border = '1px solid black';
      $instantSearchDiv.style.marginBottom = '15px';
      const $instantSearchTitle = document.createElement('h2');
      $instantSearchTitle.innerHTML = '<code>instant_search</code>';
      const $instantSearchHits = document.createElement('div');

      $instantSearchDiv.appendChild($instantSearchTitle);
      $instantSearchDiv.appendChild($instantSearchHits);

      const $instantSearchAppleDiv = document.createElement('div');
      $instantSearchAppleDiv.style.padding = '10px';
      $instantSearchAppleDiv.style.border = '1px solid black';
      $instantSearchAppleDiv.style.marginBottom = '15px';
      const $instantSearchAppleTitle = document.createElement('h2');
      $instantSearchAppleTitle.innerHTML = '<code>instant_search_apple</code>';
      const $instantSearchAppleHits = document.createElement('div');

      $instantSearchAppleDiv.appendChild($instantSearchAppleTitle);
      $instantSearchAppleDiv.appendChild($instantSearchAppleHits);

      const $instantSearchSamsungDiv = document.createElement('div');
      $instantSearchSamsungDiv.style.padding = '10px';
      $instantSearchSamsungDiv.style.border = '1px solid black';
      $instantSearchSamsungDiv.style.marginBottom = '15px';
      const $instantSearchSamsungTitle = document.createElement('h2');
      $instantSearchSamsungTitle.innerHTML =
        '<code>instant_search_samsung</code>';
      const $instantSearchSamsungHits = document.createElement('div');
      $instantSearchSamsungHits.style.marginBottom = '15px';

      $instantSearchSamsungDiv.appendChild($instantSearchSamsungTitle);
      $instantSearchSamsungDiv.appendChild($instantSearchSamsungHits);

      const $instantSearchAppleDeepDiv = document.createElement('div');
      $instantSearchAppleDeepDiv.style.padding = '10px';
      $instantSearchAppleDeepDiv.style.border = '1px solid black';
      $instantSearchAppleDeepDiv.style.marginBottom = '15px';
      const $instantSearchAppleDeepTitle = document.createElement('h2');
      $instantSearchAppleDeepTitle.innerHTML =
        '<code>instant_search_apple</code> (use the index Apple above but inherits from Samsung)';
      const $instantSearchAppleDeepHits = document.createElement('div');

      $instantSearchAppleDeepDiv.appendChild($instantSearchAppleDeepTitle);
      $instantSearchAppleDeepDiv.appendChild($instantSearchAppleDeepHits);

      $instantSearchSamsungDiv.appendChild($instantSearchAppleDeepDiv);

      container.appendChild($instantSearchDiv);
      container.appendChild($instantSearchAppleDiv);
      container.appendChild($instantSearchSamsungDiv);

      // Top level
      const topLevelConfigure = instantsearch.widgets.configure({
        hitsPerPage: 3,
      });

      // instant_search
      const instantSearchIndex = index({
        indexName: 'instant_search',
      });

      const instantSearchConfigure = instantsearch.widgets.configure({
        hitsPerPage: 4,
      });

      const instantSearchHits = instantsearch.widgets.hits({
        container: $instantSearchHits,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      instantSearchIndex.addWidgets([
        // Avoid to collapse the line
        instantSearchConfigure,
        instantSearchHits,
      ]);

      // instant_search_apple
      const instantSearchAppleIndex = index({
        indexName: 'instant_search',
        // Really mandatory?
        indexId: 'instant_search_apple',
      });

      const instantSearchAppleConfigure = instantsearch.widgets.configure({
        filters: 'brand:Apple',
      });

      const instantSearchSearchHits = instantsearch.widgets.hits({
        container: $instantSearchAppleHits,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      instantSearchAppleIndex.addWidgets([
        instantSearchAppleConfigure,
        instantSearchSearchHits,
      ]);

      // instant_search_samsung
      const instantSearchSamsungIndex = index({
        indexName: 'instant_search',
        // Really mandatory?
        indexId: 'instant_search_samsung',
      });

      const instantSearchSamsungConfigure = instantsearch.widgets.configure({
        filters: 'brand:Samsung',
      });

      const instantSearchSamsungHits = instantsearch.widgets.hits({
        container: $instantSearchSamsungHits,
        escapeHTML: true,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      instantSearchSamsungIndex.addWidgets([
        instantSearchSamsungConfigure,
        instantSearchSamsungHits,
      ]);

      // instant_search_apple
      const instantSearchAppleDeepIndex = index({
        indexName: 'instant_search',
        // Really mandatory?
        indexId: 'instant_search_apple',
      });

      const instantSearchAppleDeepConfigure = instantsearch.widgets.configure({
        hitsPerPage: 2,
      });

      const instantSearchAppleDeepHits = instantsearch.widgets.hits({
        container: $instantSearchAppleDeepHits,
        escapeHTML: true,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      instantSearchAppleDeepIndex.addWidgets([
        instantSearchAppleDeepConfigure,
        instantSearchAppleDeepHits,
      ]);

      // Search
      search.addWidgets([
        topLevelConfigure,
        instantSearchIndex,
        instantSearchAppleIndex,
        instantSearchSamsungIndex.addWidgets([
          // Avoid to collapse the line
          // instantSearchAppleDeepIndex,
        ]),
      ]);
    })
  );
