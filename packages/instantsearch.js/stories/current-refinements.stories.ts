import { withHits } from '../.storybook/decorators';

import type { CurrentRefinementsWidget } from '../src/widgets/current-refinements/current-refinements';
import type { Meta, StoryObj } from '@storybook/html';

type Args = {
  widgetParams: Partial<Parameters<CurrentRefinementsWidget>[0]>;
  searchOptions: Partial<Parameters<typeof withHits>[1]>;
};

const meta: Meta<Args> = {
  title: 'Refinements/CurrentRefinements',
  render: (args) =>
    withHits(
      ({ search, container, instantsearch }) => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);

        search.addWidgets([
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
            ...args.widgetParams,
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
        ...args.searchOptions,
      }
    )(),
};

export default meta;

export const Default: StoryObj = {};

export const WithRefinementList: StoryObj<Args> = {
  args: {
    searchOptions: {
      initialUiState: {
        instant_search: {
          refinementList: {
            brand: ['Google', 'Apple', 'Samsung'],
          },
        },
      },
    },
  },
};

export const WithMenu: StoryObj<Args> = {
  render: withHits(
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
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithHierarchicalMenu: StoryObj<Args> = {
  render: withHits(
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
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithToggleRefinement: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
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
      instantsearch.widgets.currentRefinements({
        container: currentRefinementsContainer,
      }),
    ]);
  }),
};

export const WithNumericMenu: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidgets([
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithRangeInput: StoryObj<Args> = {
  render: withHits(
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
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithOnlyPriceIncluded: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidgets([
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithPriceAndQueryExcluded: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidgets([
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithQuery: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidgets([
        instantsearch.widgets.currentRefinements({
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
  ),
};

export const WithTransformedItems: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidgets([
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
          transformItems: (items) =>
            items.map((refinementItem) => ({
              ...refinementItem,
              refinements: refinementItem.refinements.map((item) => ({
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
  ),
};

export const WithMultiIndices: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
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
      instantsearch.widgets.currentRefinements({
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
  }),
};
