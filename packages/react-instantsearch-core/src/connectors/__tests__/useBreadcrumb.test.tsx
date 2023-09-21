import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useBreadcrumb } from '../useBreadcrumb';
import { useHierarchicalMenu } from '../useHierarchicalMenu';

import type { UseHierarchicalMenuProps } from '../useHierarchicalMenu';
import type { MockSearchClient } from '@instantsearch/mocks';

describe('useBreadcrumb', () => {
  it('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useBreadcrumb({
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      createURL: expect.any(Function),
      items: [],
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      canRefine: false,
      createURL: expect.any(Function),
      items: [],
      refine: expect.any(Function),
    });
  });

  it('returns the connector render state with initial UI state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          hierarchicalMenu: {
            'hierarchicalCategories.lvl0': [
              'Appliances',
              'Small Kitchen Appliances',
              'Coffee, Tea & Espresso',
            ],
          },
        },
      },
      searchClient: createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(
                (request: Parameters<MockSearchClient['search']>[0][number]) =>
                  createSingleSearchResponse({
                    index: request.indexName,
                    facets: {
                      'hierarchicalCategories.lvl0': {
                        Appliances: 382,
                      },
                      'hierarchicalCategories.lvl1': {
                        'Appliances > Small Kitchen Appliances': 382,
                      },
                      'hierarchicalCategories.lvl2': {
                        'Appliances > Small Kitchen Appliances > Coffee, Tea & Espresso': 382,
                      },
                    },
                    hits: [
                      {
                        objectID: '1',
                        hierarchicalCategories: {
                          lvl0: 'Appliances',
                          lvl1: 'Appliances > Small Kitchen Appliances',
                          lvl2: 'Appliances > Small Kitchen Appliances > Coffee, Tea & Espresso',
                        },
                      },
                    ],
                  })
              )
            )
          )
        ) as MockSearchClient['search'],
      }),
    });
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useBreadcrumb({
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          wrapper({
            children: (
              <>
                <HierarchicalMenu
                  attributes={[
                    'hierarchicalCategories.lvl0',
                    'hierarchicalCategories.lvl1',
                    'hierarchicalCategories.lvl2',
                  ]}
                />
                {children}
              </>
            ),
          }),
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      createURL: expect.any(Function),
      items: [],
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      canRefine: true,
      createURL: expect.any(Function),
      items: [
        {
          label: 'Appliances',
          value: 'Appliances > Small Kitchen Appliances',
        },
        {
          label: 'Small Kitchen Appliances',
          value:
            'Appliances > Small Kitchen Appliances > Coffee, Tea & Espresso',
        },
        {
          label: 'Coffee, Tea & Espresso',
          value: null,
        },
      ],
      refine: expect.any(Function),
    });
  });
});

function HierarchicalMenu(props: UseHierarchicalMenuProps) {
  useHierarchicalMenu(props);

  return null;
}
