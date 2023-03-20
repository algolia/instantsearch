import { withHits } from '../.storybook/decorators';

import type { ClearRefinementsWidget } from '../src/widgets/clear-refinements/clear-refinements';
import type { Meta, StoryObj } from '@storybook/html';

type Args = {
  widgetParams: Partial<Parameters<ClearRefinementsWidget>[0]>;
};

const meta: Meta<Args> = {
  title: 'Refinements/ClearRefinements',
  render: (args) =>
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([
          instantsearch.widgets.clearRefinements({
            container,
            ...args.widgetParams,
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple'],
            },
            numericMenu: {
              price: '500:',
            },
            query: 'apple',
          },
        },
      }
    )(),
};

export default meta;

export const Default: StoryObj<Args> = {};

export const WithQueryOnlyViaIncludedAttributes: StoryObj<Args> = {
  args: {
    widgetParams: {
      includedAttributes: ['query'],
      templates: {
        resetLabel: 'Clear query',
      },
    },
  },
};

export const WithRefinementsAndQueryViaExcludedAttributes: StoryObj<Args> = {
  args: {
    widgetParams: {
      excludedAttributes: [],
      templates: {
        resetLabel: 'Clear refinements and query',
      },
    },
  },
};

export const WithBrandsExcludedViaTransformItems: StoryObj<Args> = {
  args: {
    widgetParams: {
      excludedAttributes: [],
      transformItems: (items) =>
        items.filter((attribute) => attribute !== 'brand'),
      templates: {
        resetLabel: 'Clear refinements except brands',
      },
    },
  },
};

export const WithMultipleIndices: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
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
  }),
};
