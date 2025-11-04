import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { HierarchicalMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createEdgeCasesTests(
  setup: HierarchicalMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('edge cases', () => {
    test('enables show more button when child items exceed limit (issue #6781)', async () => {
      // This test reproduces the scenario from https://github.com/algolia/instantsearch/issues/6781
      // The "show more" button should be enabled when there are hidden items at ANY level,
      // not just the root level
      const { searchClient, attributes } =
        createMockedSearchClientWithManyChildren();

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          attributes,
          limit: 6,
          showMore: true,
          showMoreLimit: 20,
        },
      });

      await act(async () => {
        await wait(0);
      });

      // Initially, all 6 root items fit within the limit
      // so the show more button should be disabled
      const showMoreButton = document.querySelector<HTMLButtonElement>(
        '.ais-HierarchicalMenu-showMore'
      )!;
      expect(showMoreButton).toBeDisabled();

      // Click on "Appliances" to expand its children
      userEvent.click(screen.getByText('Appliances'));

      await act(async () => {
        await wait(0);
      });

      // Find child items under Appliances
      const appliancesItem = screen.getByText('Appliances').closest('li');
      const childList = appliancesItem?.querySelector(
        '.ais-HierarchicalMenu-list--child'
      );
      const childItems = childList?.querySelectorAll(
        '.ais-HierarchicalMenu-item'
      );

      // Only 6 out of 8 children should be visible initially
      expect(childItems).toHaveLength(6);

      // The "show more" button should now be ENABLED
      // because there are hidden items at the child level
      expect(showMoreButton).not.toBeDisabled();

      // Click "show more" to reveal all items
      userEvent.click(showMoreButton);

      await act(async () => {
        await wait(0);
      });

      // Now all 8 children should be visible
      const childItemsAfterShowMore = appliancesItem
        ?.querySelector('.ais-HierarchicalMenu-list--child')
        ?.querySelectorAll('.ais-HierarchicalMenu-item');

      expect(childItemsAfterShowMore).toHaveLength(8);

      // And the button should show "Show less"
      expect(showMoreButton).toHaveTextContent('Show less');
    });
  });
}

function createMockedSearchClientWithManyChildren({ separator = ' > ' } = {}) {
  // This creates a scenario similar to the issue:
  // - 6 top-level categories
  // - "Appliances" has 8 children (more than the limit of 6)
  const facets = {
    'hierarchicalCategories.lvl0': {
      Appliances: 150,
      'Cell Phones': 100,
      Computers: 80,
      'TV & Home Theater': 70,
      'Video Games': 60,
      Cameras: 50,
    },
    'hierarchicalCategories.lvl1': {
      [`Appliances${separator}Dishwashers`]: 20,
      [`Appliances${separator}Freezers`]: 18,
      [`Appliances${separator}Microwaves`]: 22,
      [`Appliances${separator}Ovens`]: 19,
      [`Appliances${separator}Refrigerators`]: 25,
      [`Appliances${separator}Stoves`]: 17,
      [`Appliances${separator}Washers`]: 15,
      [`Appliances${separator}Dryers`]: 14,
      [`Cell Phones${separator}iPhone`]: 40,
      [`Cell Phones${separator}Android`]: 60,
    },
  };

  const search = jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse({ facets }))
      )
    )
  );

  return {
    searchClient: createSearchClient({ search }),
    attributes: Object.keys(facets),
  };
}
