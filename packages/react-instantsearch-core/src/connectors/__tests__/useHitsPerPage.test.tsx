/**
 * @jest-environment jsdom
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useHitsPerPage } from '../useHitsPerPage';

describe('useHitsPerPage', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(
      () =>
        useHitsPerPage({
          items: [
            { label: '4 hits per page', value: 4, default: true },
            { label: '8 hits per page', value: 8 },
          ],
        }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      refine: expect.any(Function),
      createURL: expect.any(Function),
      hasNoResults: true,
      canRefine: false,
      items: [
        {
          default: true,
          isRefined: true,
          label: '4 hits per page',
          value: 4,
        },
        {
          isRefined: false,
          label: '8 hits per page',
          value: 8,
        },
      ],
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        refine: expect.any(Function),
        createURL: expect.any(Function),
        hasNoResults: true,
        canRefine: false,
        items: [
          {
            default: true,
            isRefined: true,
            label: '4 hits per page',
            value: 4,
          },
          {
            isRefined: false,
            label: '8 hits per page',
            value: 8,
          },
        ],
      });
    });
  });
});
