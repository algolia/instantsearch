/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useNumericMenu } from '../useNumericMenu';

describe('useNumericMenu', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(
      () =>
        useNumericMenu({
          attribute: 'attribute',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
          ],
        }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      createURL: expect.any(Function),
      hasNoResults: true,
      canRefine: false,
      items: [
        {
          isRefined: true,
          label: 'All',
          value: '%7B%7D',
        },
        {
          isRefined: false,
          label: 'Less than 500$',
          value: '%7B%22end%22:500%7D',
        },
        {
          isRefined: false,
          label: 'Between 500$ - 1000$',
          value: '%7B%22start%22:500,%22end%22:1000%7D',
        },
        {
          isRefined: false,
          label: 'More than 1000$',
          value: '%7B%22start%22:1000%7D',
        },
      ],
      refine: expect.any(Function),
      sendEvent: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        createURL: expect.any(Function),
        hasNoResults: true,
        canRefine: false,
        items: [
          {
            isRefined: true,
            label: 'All',
            value: '%7B%7D',
          },
          {
            isRefined: false,
            label: 'Less than 500$',
            value: '%7B%22end%22:500%7D',
          },
          {
            isRefined: false,
            label: 'Between 500$ - 1000$',
            value: '%7B%22start%22:500,%22end%22:1000%7D',
          },
          {
            isRefined: false,
            label: 'More than 1000$',
            value: '%7B%22start%22:1000%7D',
          },
        ],
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
      });
    });
  });
});
