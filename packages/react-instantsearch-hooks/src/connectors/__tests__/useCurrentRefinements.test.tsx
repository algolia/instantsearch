import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useCurrentRefinements } from '../useCurrentRefinements';
import { useRefinementList } from '../useRefinementList';

import type { UseRefinementListProps } from '../useRefinementList';

describe('useCurrentRefinements', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () => useCurrentRefinements(),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
      canRefine: false,
      refine: expect.any(Function),
      createURL: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      items: [],
      canRefine: false,
      refine: expect.any(Function),
      createURL: expect.any(Function),
    });
  });

  test('returns items on render', async () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          refinementList: {
            brand: ['Apple'],
          },
        },
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useCurrentRefinements(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          wrapper({
            children: (
              <>
                <RefinementList attribute="brand" />
                {children}
              </>
            ),
          }),
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [
        {
          attribute: 'brand',
          indexName: 'indexName',
          indexId: 'indexName',
          label: 'brand',
          refine: expect.any(Function),
          refinements: [
            {
              attribute: 'brand',
              label: 'Apple',
              type: 'disjunctive',
              value: 'Apple',
            },
          ],
        },
      ],
      canRefine: true,
      refine: expect.any(Function),
      createURL: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      items: [
        {
          attribute: 'brand',
          indexName: 'indexName',
          indexId: 'indexName',
          label: 'brand',
          refine: expect.any(Function),
          refinements: [
            {
              attribute: 'brand',
              label: 'Apple',
              type: 'disjunctive',
              value: 'Apple',
            },
          ],
        },
      ],
      canRefine: true,
      refine: expect.any(Function),
      createURL: expect.any(Function),
    });
  });
});

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);

  return null;
}
