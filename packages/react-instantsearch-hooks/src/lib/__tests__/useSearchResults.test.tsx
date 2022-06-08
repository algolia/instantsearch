import { renderHook } from '@testing-library/react-hooks';
import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';

import { createInstantSearchTestWrapper } from '../../../../../test/utils';
import { useSearchResults } from '../useSearchResults';

describe('useSearchResults', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchResults(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      results: expect.any(SearchResults),
      scopedResults: [
        expect.objectContaining({
          helper: expect.any(AlgoliaSearchHelper),
          indexId: 'indexName',
          results: expect.any(SearchResults),
        }),
      ],
    });
    expect(result.current.results.__isArtificial).toEqual(true);

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      results: expect.any(SearchResults),
      scopedResults: [
        expect.objectContaining({
          helper: expect.any(AlgoliaSearchHelper),
          indexId: 'indexName',
          results: expect.any(SearchResults),
        }),
      ],
    });

    expect(result.current.results.__isArtificial).toBeUndefined();
  });
});
