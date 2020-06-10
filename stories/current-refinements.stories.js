import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { currentRefinements } from '../src/widgets';

storiesOf('Refinements/CurrentRefinements', module)
  .add(
    'default',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
            numericMenu: {
              price: '100:',
            },
          },
        },
      }
    )
  )
  .add(
    'with refinementList',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Google', 'Apple', 'Samsung'],
            },
          },
        },
      }
    )
  )
  .add(
    'with menu',
    withHits(
      ({ search, container, instantsearch }) => {
        const currentRefinementsContainer = document.createElement('div');
        currentRefinementsContainer.style.marginBottom = '10px';
        container.appendChild(currentRefinementsContainer);
        const menuContainer = document.createElement('div');
        container.appendChild(menuContainer);

        search.addWidgets([
          instantsearch.widgets.menu({
            container: menuContainer,
            attribute: 'categories',
          }),
        ]);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            menu: {
              categories: 'Audio',
            },
          },
        },
      }
    )
  )
  .add(
    'with hierarchicalMenu',
    withHits(
      ({ search, container, instantsearch }) => {
        const currentRefinementsContainer = document.createElement('div');
        currentRefinementsContainer.style.marginBottom = '10px';
        container.appendChild(currentRefinementsContainer);
        const hierarchicalMenuContainer = document.createElement('div');
        container.appendChild(hierarchicalMenuContainer);

        search.addWidgets([
          instantsearch.widgets.hierarchicalMenu({
            container: hierarchicalMenuContainer,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
            ],
          }),
        ]);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        },
      }
    )
  )
  .add(
    'with toggleRefinement',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      currentRefinementsContainer.style.marginBottom = '10px';
      container.appendChild(currentRefinementsContainer);
      const toggleRefinementContainer = document.createElement('div');
      container.appendChild(toggleRefinementContainer);

      search.addWidgets([
        instantsearch.widgets.toggleRefinement({
          container: toggleRefinementContainer,
          attribute: 'free_shipping',
          templates: {
            labelText: 'Free Shipping',
          },
        }),
      ]);

      search.addWidgets([
        currentRefinements({
          container: currentRefinementsContainer,
        }),
      ]);
    })
  )
  .add(
    'with numericMenu',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            numericMenu: {
              price: ':10',
            },
          },
        },
      }
    )
  )
  .add(
    'with rangeInput',
    withHits(
      ({ search, container, instantsearch }) => {
        const currentRefinementsContainer = document.createElement('div');
        currentRefinementsContainer.style.marginBottom = '10px';
        container.appendChild(currentRefinementsContainer);
        const rangeInputContainer = document.createElement('div');
        container.appendChild(rangeInputContainer);

        search.addWidgets([
          instantsearch.widgets.rangeInput({
            container: rangeInputContainer,
            attribute: 'price',
          }),
        ]);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            range: {
              price: '100:500',
            },
          },
        },
      }
    )
  )
  .add(
    'with only price included',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
            includedAttributes: ['price'],
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            numericMenu: {
              price: ':10',
            },
          },
        },
      }
    )
  )
  .add(
    'with price and query excluded',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
            excludedAttributes: ['query', 'price'],
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
            numericMenu: {
              price: '100:',
            },
          },
        },
      }
    )
  )
  .add(
    'with query',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
            excludedAttributes: [],
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
            numericMenu: {
              price: '100:',
            },
          },
        },
      }
    )
  )
  .add(
    'with transformed items',
    withHits(
      ({ search, container }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          currentRefinements({
            container: currentRefinementsContainer,
            transformItems: items =>
              items.map(refinementItem => ({
                ...refinementItem,
                refinements: refinementItem.refinements.map(item => ({
                  ...item,
                  label: item.label.toUpperCase(),
                })),
              })),
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
            numericMenu: {
              price: '100:',
            },
          },
        },
      }
    )
  )
  .add(
    'with multi indices',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer1 = document.createElement('div');
      const instantSearchPriceAscTitle = document.createElement('h3');
      instantSearchPriceAscTitle.innerHTML =
        '<code>instant_search_price_asc</code>';
      const instantSearchMediaTitle = document.createElement('h3');
      instantSearchMediaTitle.innerHTML =
        '<code>instant_search_rating_asc</code>';
      const refinementListContainer1 = document.createElement('div');
      const refinementListContainer2 = document.createElement('div');

      container.appendChild(currentRefinementsContainer1);
      container.appendChild(instantSearchPriceAscTitle);
      container.appendChild(refinementListContainer1);
      container.appendChild(instantSearchMediaTitle);
      container.appendChild(refinementListContainer2);

      search.addWidgets([
        currentRefinements({
          container: currentRefinementsContainer1,
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
