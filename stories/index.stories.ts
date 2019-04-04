import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';

storiesOf('Index', module)
  .add(
    'with three indices',
    withHits(({ search, container, instantsearch }) => {
      const $buttonAddWidgets = document.createElement('button');
      $buttonAddWidgets.textContent = 'Add widgets';
      $buttonAddWidgets.style.marginRight = '10px';
      $buttonAddWidgets.style.marginBottom = '15px';

      const $buttonRemoveidgets = document.createElement('button');
      $buttonRemoveidgets.textContent = 'Remove widgets';

      const $instantSearchDiv = document.createElement('div');
      $instantSearchDiv.style.padding = '10px';
      $instantSearchDiv.style.border = '1px solid black';
      $instantSearchDiv.style.marginBottom = '15px';
      const $instantSearchTitle = document.createElement('h2');
      $instantSearchTitle.innerHTML = '<code>instant_search_price_desc</code>';
      const $instantSearchSearchBox = document.createElement('div');
      $instantSearchSearchBox.style.marginBottom = '15px';
      const $instantSearchHits = document.createElement('div');
      $instantSearchHits.style.marginBottom = '15px';

      $instantSearchDiv.appendChild($instantSearchTitle);
      $instantSearchDiv.appendChild($instantSearchSearchBox);
      $instantSearchDiv.appendChild($instantSearchHits);

      const $bestbuyDiv = document.createElement('div');
      $bestbuyDiv.style.padding = '10px';
      $bestbuyDiv.style.border = '1px solid black';
      $bestbuyDiv.style.marginBottom = '15px';
      const $bestbuyTitle = document.createElement('h2');
      $bestbuyTitle.innerHTML = '<code>bestbuy</code>';
      const $bestbuySearchBox = document.createElement('div');
      $bestbuySearchBox.style.marginBottom = '15px';
      const $bestbuyHits = document.createElement('div');

      $bestbuyDiv.appendChild($bestbuyTitle);
      $bestbuyDiv.appendChild($bestbuySearchBox);
      $bestbuyDiv.appendChild($bestbuyHits);

      $instantSearchDiv.appendChild($bestbuyDiv);

      container.appendChild($buttonAddWidgets);
      container.appendChild($buttonRemoveidgets);

      container.appendChild($instantSearchDiv);

      // Top level
      const topLevelConfigure = instantsearch.widgets.configure({
        hitsPerPage: 3,
      });

      // instant_search_price_desc
      const instantSearchIndex = index({
        indexName: 'instant_search_price_desc',
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
        // add a top level widget
        // search.addWidgets([topLevelConfigure]);

        // add a widget of an index
        // instantSearchIndex.addWidgets([instantSearchConfigure]);

        // add an index
        instantSearchIndex.addWidgets([bestbuyIndex]);
        // search.addWidgets([instantSearchIndex]);
      });

      // Remove widgets dynamically
      $buttonRemoveidgets.addEventListener('click', () => {
        // remove a top level widget
        // search.removeWidgets([topLevelConfigure]);

        // remove a widget of an index
        // instantSearchIndex.removeWidgets([instantSearchConfigure]);

        // remove an index
        instantSearchIndex.removeWidgets([bestbuyIndex]);
        // search.removeWidgets([instantSearchIndex]);
      });
    })
  )
  .add(
    'with same indices',
    withHits(({ search, container, instantsearch }) => {
      const $buttonAddWidgets = document.createElement('button');
      $buttonAddWidgets.textContent = 'Add widgets';
      $buttonAddWidgets.style.marginRight = '10px';
      $buttonAddWidgets.style.marginBottom = '15px';

      const $buttonRemoveidgets = document.createElement('button');
      $buttonRemoveidgets.textContent = 'Remove widgets';

      const $instantSearchDiv = document.createElement('div');
      $instantSearchDiv.style.padding = '10px';
      $instantSearchDiv.style.border = '1px solid black';
      $instantSearchDiv.style.marginBottom = '15px';
      const $instantSearchTitle = document.createElement('h2');
      $instantSearchTitle.innerHTML = '<code>instant_search</code>';
      const $instantSearchHits = document.createElement('div');
      const $instantSearchRefinementList = document.createElement('div');

      $instantSearchDiv.appendChild($instantSearchTitle);
      $instantSearchDiv.appendChild($instantSearchHits);
      $instantSearchDiv.appendChild($instantSearchRefinementList);

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

      container.appendChild($buttonAddWidgets);
      container.appendChild($buttonRemoveidgets);

      container.appendChild($instantSearchDiv);
      container.appendChild($instantSearchAppleDiv);
      container.appendChild($instantSearchSamsungDiv);

      // Top level
      const topLevelConfigure = instantsearch.widgets.configure({
        hitsPerPage: 4, // -> overriden by instantSearchConfigure
      });

      // instant_search
      const instantSearchIndex = index({
        indexName: 'instant_search',
      });

      const instantSearchConfigure = instantsearch.widgets.configure({
        hitsPerPage: 3,
      });

      const instantSearchHits = instantsearch.widgets.hits({
        container: $instantSearchHits,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      // const instantSearchRefinementList = instantsearch.widgets.refinementList({
      //   container: $instantSearchRefinementList,
      //   attribute: 'brand',
      // });

      instantSearchIndex.addWidgets([
        // Avoid to collapse the line
        instantSearchConfigure,
        instantSearchHits,
        // instantSearchRefinementList,
      ]);

      // instant_search_apple
      const instantSearchAppleIndex = index({
        indexName: 'instant_search',
        indexId: 'instant_search_apple',
      });

      const instantSearchAppleConfigure = instantsearch.widgets.configure({
        hitsPerPage: 2, // overriden by instantSearchAppleDeepConfigure
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
        indexId: 'instant_search_samsung',
      });

      const instantSearchSamsungConfigure = instantsearch.widgets.configure({
        hitsPerPage: 2,
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
        indexId: 'instant_search_apple',
      });

      const instantSearchAppleDeepConfigure = instantsearch.widgets.configure({
        hitsPerPage: 1,
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

      // Add widgets dynamically
      $buttonAddWidgets.addEventListener('click', () => {
        search.addWidgets([
          // Avoid to collapse the line
          instantSearchIndex,
        ]);
      });

      // Remove widgets dynamically
      $buttonRemoveidgets.addEventListener('click', () => {
        search.removeWidgets([
          // Avoid to collapse the line
          instantSearchIndex,
        ]);
      });
    })
  )
  .add(
    'with SortBy',
    withHits(({ search, container, instantsearch }) => {
      const $buttonAddWidgets = document.createElement('button');
      $buttonAddWidgets.textContent = 'Add widgets';
      $buttonAddWidgets.style.marginRight = '10px';
      $buttonAddWidgets.style.marginBottom = '15px';

      const $buttonRemoveidgets = document.createElement('button');
      $buttonRemoveidgets.textContent = 'Remove widgets';

      const $bestbuyDiv = document.createElement('div');
      $bestbuyDiv.style.padding = '10px';
      $bestbuyDiv.style.border = '1px solid black';
      $bestbuyDiv.style.marginBottom = '15px';
      const $bestbuyTitle = document.createElement('h2');
      $bestbuyTitle.innerHTML = '<code>bestbuy</code>';
      const $bestbuySortBy = document.createElement('div');
      $bestbuySortBy.style.marginBottom = '15px';
      const $bestbuyHits = document.createElement('div');

      $bestbuyDiv.appendChild($bestbuyTitle);
      $bestbuyDiv.appendChild($bestbuySortBy);
      $bestbuyDiv.appendChild($bestbuyHits);

      container.appendChild($buttonAddWidgets);
      container.appendChild($buttonRemoveidgets);

      container.appendChild($bestbuyDiv);

      // Top level
      const topLevelConfigure = instantsearch.widgets.configure({
        hitsPerPage: 3,
      });

      // bestbuy
      const bestbuyIndex = index({
        indexName: 'bestbuy',
      });

      const bestbuySortBy = instantsearch.widgets.sortBy({
        container: $bestbuySortBy,
        items: [
          { value: 'bestbuy', label: 'Most relevant' },
          { value: 'instant_search_price_asc', label: 'Lowest price' },
          { value: 'instant_search_price_desc', label: 'Highest price' },
        ],
      });

      const bestbuyHits = instantsearch.widgets.hits({
        container: $bestbuyHits,
        escapeHTML: true,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      // Search
      search.addWidgets([
        topLevelConfigure,

        bestbuyIndex.addWidgets([
          // Avoid collapsed line
          bestbuySortBy,
          bestbuyHits,
        ]),
      ]);

      // Add widgets dynamically
      $buttonAddWidgets.addEventListener('click', () => {
        // Avoid collapsed line
      });

      // Remove widgets dynamically
      $buttonRemoveidgets.addEventListener('click', () => {
        // Avoid collapsed line
      });
    })
  )
  .add(
    'with Pagination',
    withHits(({ search, container, instantsearch }) => {
      const $buttonAddWidgets = document.createElement('button');
      $buttonAddWidgets.textContent = 'Add widgets';
      $buttonAddWidgets.style.marginRight = '10px';
      $buttonAddWidgets.style.marginBottom = '15px';

      const $buttonRemoveidgets = document.createElement('button');
      $buttonRemoveidgets.textContent = 'Remove widgets';

      const $instantSearchDiv = document.createElement('div');
      $instantSearchDiv.style.padding = '10px';
      $instantSearchDiv.style.border = '1px solid black';
      $instantSearchDiv.style.marginBottom = '15px';
      const $instantSearchTitle = document.createElement('h2');
      $instantSearchTitle.innerHTML = '<code>instant_search_price_desc</code>';
      const $instantSearchStats = document.createElement('div');
      $instantSearchStats.style.marginBottom = '15px';
      const $instantSearchSearchBox = document.createElement('div');
      $instantSearchSearchBox.style.marginBottom = '15px';
      const $instantSearchHits = document.createElement('div');
      $instantSearchHits.style.marginBottom = '15px';
      const $instantSearchPagination = document.createElement('div');
      $instantSearchPagination.style.marginBottom = '15px';

      $instantSearchDiv.appendChild($instantSearchTitle);
      $instantSearchDiv.appendChild($instantSearchStats);
      $instantSearchDiv.appendChild($instantSearchSearchBox);
      $instantSearchDiv.appendChild($instantSearchHits);
      $instantSearchDiv.appendChild($instantSearchPagination);

      const $bestbuyDiv = document.createElement('div');
      $bestbuyDiv.style.padding = '10px';
      $bestbuyDiv.style.border = '1px solid black';
      $bestbuyDiv.style.marginBottom = '15px';
      const $bestbuyTitle = document.createElement('h2');
      $bestbuyTitle.innerHTML = '<code>bestbuy</code>';
      const $bestbuyStats = document.createElement('div');
      $bestbuyStats.style.marginBottom = '15px';
      const $bestbuyHits = document.createElement('div');
      $bestbuyHits.style.marginBottom = '15px';
      const $bestbuyPagination = document.createElement('div');

      $bestbuyDiv.appendChild($bestbuyTitle);
      $bestbuyDiv.appendChild($bestbuyStats);
      $bestbuyDiv.appendChild($bestbuyHits);
      $bestbuyDiv.appendChild($bestbuyPagination);

      $instantSearchDiv.appendChild($bestbuyDiv);

      container.appendChild($buttonAddWidgets);
      container.appendChild($buttonRemoveidgets);

      container.appendChild($instantSearchDiv);
      // container.appendChild($bestbuyDiv);

      // Top level
      const topLevelConfigure = instantsearch.widgets.configure({
        hitsPerPage: 3,
      });

      // instant_search_pr
      const instantSearchIndex = index({
        indexName: 'instant_search_price_desc',
      });

      const instantSearchStats = instantsearch.widgets.stats({
        container: $instantSearchStats,
        templates: {
          text({ query, page }) {
            return `
              <p>
                <code>query: ${query}</code><br />
                <code>page: ${page + 1}</code>
              </p>
            `;
          },
        },
      });

      const instantSearchSearchBox = instantsearch.widgets.searchBox({
        container: $instantSearchSearchBox,
      });

      const instantSearchHits = instantsearch.widgets.hits({
        container: $instantSearchHits,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      const instantSearchPagination = instantsearch.widgets.pagination({
        container: $instantSearchPagination,
      });

      // bestbuy
      const bestbuyIndex = index({
        indexName: 'bestbuy',
      });

      const bestbuyPagination = instantsearch.widgets.pagination({
        container: $bestbuyPagination,
      });

      const bestbuyStats = instantsearch.widgets.stats({
        container: $bestbuyStats,
        templates: {
          text({ query, page }) {
            return `
              <p>
                <code>query: ${query}</code><br />
                <code>page: ${page + 1}</code>
              </p>
            `;
          },
        },
      });

      // const bestbuyHits = instantsearch.widgets.infiniteHits({
      const bestbuyHits = instantsearch.widgets.hits({
        container: $bestbuyHits,
        templates: {
          item:
            '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
        },
      });

      // Search
      search.addWidgets([
        topLevelConfigure,

        instantSearchIndex.addWidgets([
          // Avoid collapsed line
          instantSearchStats,
          instantSearchSearchBox,
          instantSearchPagination,
          instantSearchHits,

          bestbuyIndex.addWidgets([
            // Avoid collapsed line
            bestbuyStats,
            bestbuyHits,
            bestbuyPagination,
          ]),
        ]),

        // bestbuyIndex.addWidgets([
        //   // Avoid collapsed line
        //   bestbuyStats,
        //   bestbuyHits,
        //   bestbuyPagination,
        // ]),
      ]);

      // Add widgets dynamically
      $buttonAddWidgets.addEventListener('click', () => {
        // Avoid collapsed line
        // instantSearchIndex.addWidgets([instantSearchPagination]);
        bestbuyIndex.addWidgets([bestbuyPagination]);
        // bestbuyIndex.addWidgets([bestbuyHits]);
      });

      // Remove widgets dynamically
      $buttonRemoveidgets.addEventListener('click', () => {
        // Avoid collapsed line
        // instantSearchIndex.removeWidgets([instantSearchPagination]);
        bestbuyIndex.removeWidgets([bestbuyPagination]);
        // bestbuyIndex.removeWidgets([bestbuyHits]);
      });
    })
  )
  .add(
    'with Autocomplete',
    withHits(({ search, container, instantsearch }) => {
      const $autocomplete = document.createElement('div');
      $autocomplete.style.marginBottom = '15px';

      container.appendChild($autocomplete);

      const highlight = hit =>
        instantsearch.highlight({
          attribute: 'name',
          hit,
        });

      const renderIndexListItem = ({ label, hits }) => `
        <li>
          <h3>index: ${label}</h3>
          <ol>
            ${hits.map(hit => `<li>${highlight(hit)}</li>`).join('')}
          </ol>
        </li>
      `;

      const renderAutocomplete = (renderOptions, isFirstRender) => {
        const {
          indices,
          currentRefinement,
          refine,
          widgetParams,
        } = renderOptions;

        if (isFirstRender) {
          const input = document.createElement('input');
          const ul = document.createElement('ul');

          input.addEventListener('input', event => {
            refine((event.currentTarget as HTMLInputElement).value);
          });

          widgetParams.container.appendChild(input);
          widgetParams.container.appendChild(ul);
        }

        widgetParams.container.querySelector('input').value = currentRefinement;
        widgetParams.container.querySelector('ul').innerHTML = indices
          .map(renderIndexListItem)
          .join('');
      };

      const autocomplete = instantsearch.connectors.connectAutocomplete(
        renderAutocomplete
      );

      search.addWidgets([
        instantsearch.widgets.configure({
          hitsPerPage: 3,
        }),

        autocomplete({
          container: $autocomplete,
        }),

        index({ indexName: 'bestbuy' }).addWidgets([
          instantsearch.widgets.configure({
            hitsPerPage: 2,
          }),
        ]),

        index({ indexName: 'instant_search_price_desc' }).addWidgets([
          instantsearch.widgets.configure({
            hitsPerPage: 1,
          }),
        ]),
      ]);
    })
  )
  .add(
    'with suggestions & products',
    withHits(({ search, container, instantsearch }) => {
      const $root = document.createElement('div');
      $root.style.display = 'flex';

      const $left = document.createElement('div');
      $left.className = 'panel-left';

      const $refinementList = document.createElement('div');

      const $right = document.createElement('div');
      $right.className = 'panel-right';

      const $searchBox = document.createElement('div');
      $searchBox.style.marginBottom = '15px';

      const $suggestionHits = document.createElement('div');

      const $titleRegularHits = document.createElement('h3');
      $titleRegularHits.textContent = 'instant_search';
      const $regularHits = document.createElement('div');

      const $titlemostRecentHits = document.createElement('h3');
      $titlemostRecentHits.textContent = 'instant_search_price_desc';
      const $mostRecentHits = document.createElement('div');

      $left.appendChild($refinementList);

      $right.appendChild($searchBox);
      $right.appendChild($suggestionHits);

      $right.appendChild($titleRegularHits);
      $right.appendChild($regularHits);

      $right.appendChild($titlemostRecentHits);
      $right.appendChild($mostRecentHits);

      $root.appendChild($left);
      $root.appendChild($right);

      container.appendChild($root);

      search.addWidgets([
        instantsearch.widgets.configure({
          hitsPerPage: 2,
        }),

        instantsearch.widgets.searchBox({
          container: $searchBox,
        }),

        index({
          indexName: 'instant_search_demo_query_suggestions',
        }).addWidgets([
          instantsearch.widgets.configure({
            hitsPerPage: 3,
          }),
          instantsearch.widgets.hits({
            container: $suggestionHits,
            templates: {
              item:
                '{{#helpers.highlight}}{ "attribute": "query" }{{/helpers.highlight}}',
            },
          }),
        ]),

        index({
          indexName: 'instant_search',
          indexId: 'main',
        }).addWidgets([
          instantsearch.widgets.hits({
            container: $regularHits,
            templates: {
              item:
                '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
            },
          }),

          index({ indexName: 'instant_search_price_desc' }).addWidgets([
            instantsearch.widgets.hits({
              container: $mostRecentHits,
              templates: {
                item:
                  '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
              },
            }),
          ]),
        ]),

        index({
          indexName: 'instant_search',
          indexId: 'main',
        }).addWidgets([
          instantsearch.widgets.refinementList({
            container: $refinementList,
            attribute: 'brand',
          }),
        ]),
      ]);
    })
  );
