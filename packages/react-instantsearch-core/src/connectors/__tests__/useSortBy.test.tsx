import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useSortBy } from '../useSortBy';

const items = [
  { label: 'Featured', value: 'indexName' },
  { label: 'Price (asc)', value: 'indexName_price_asc' },
  { label: 'Price (desc)', value: 'indexName_price_desc' },
];

describe('useSortBy', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () => useSortBy({ items }),
      { wrapper }
    );

    expect(result.current).toEqual({
      currentRefinement: 'indexName',
      options: items,
      refine: expect.any(Function),
      hasNoResults: expect.any(Boolean),
      canRefine: expect.any(Boolean),
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      currentRefinement: 'indexName',
      options: items,
      refine: expect.any(Function),
      hasNoResults: expect.any(Boolean),
      canRefine: expect.any(Boolean),
    });
  });
});
