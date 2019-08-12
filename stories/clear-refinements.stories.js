import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('ClearRefinements', module)
  .add(
    'default',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
          })
        );
      },
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  )
  .add(
    'with query only (via includedAttributes)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.clearRefinements({
          container,
          includedAttributes: ['query'],
          templates: {
            resetLabel: 'Clear query',
          },
        })
      );
    })
  )
  .add(
    'with refinements and query (via excludedAttributes)',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
            excludedAttributes: [],
            templates: {
              resetLabel: 'Clear refinements and query',
            },
          })
        );
      },
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  )
  .add(
    'with brands excluded (via transformItems)',
    withHits(
      ({ search, container, instantsearch }) => {
        const clearRefinementsContainer = document.createElement('div');
        container.appendChild(clearRefinementsContainer);

        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container: clearRefinementsContainer,
            excludedAttributes: [],
            transformItems: items =>
              items.filter(attribute => attribute !== 'brand'),
          })
        );
      },
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  )
  .add(
    'with multi indices',
    withHits(({ search, container, instantsearch }) => {
      const clearRefinementsContainer = document.createElement('div');
      const instantSearchPriceAscTitle = document.createElement('h3');
      instantSearchPriceAscTitle.innerHTML =
        '<code>instant_search_price_asc</code>';
      const instantSearchMediaTitle = document.createElement('h3');
      instantSearchMediaTitle.innerHTML =
        '<code>instant_search_rating_asc</code>';
      const refinementListContainer1 = document.createElement('div');
      const refinementListContainer2 = document.createElement('div');

      container.appendChild(clearRefinementsContainer);
      container.appendChild(instantSearchPriceAscTitle);
      container.appendChild(refinementListContainer1);
      container.appendChild(instantSearchMediaTitle);
      container.appendChild(refinementListContainer2);

      search.addWidgets([
        instantsearch.widgets.clearRefinements({
          container: clearRefinementsContainer,
        }),

        instantsearch.widgets
          .index({
            indexName: 'instant_search_price_asc',
          })
          .addWidgets([
            instantsearch.widgets.refinementList({
              container: refinementListContainer1,
              attribute: 'brand',
              limit: 3,
            }),
          ]),

        instantsearch.widgets
          .index({
            indexName: 'instant_search_rating_asc',
          })
          .addWidgets([
            instantsearch.widgets.refinementList({
              container: refinementListContainer2,
              attribute: 'categories',
              limit: 3,
            }),
          ]),
      ]);
    })
  );
