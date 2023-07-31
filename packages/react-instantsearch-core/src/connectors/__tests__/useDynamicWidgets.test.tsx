import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
  defaultRenderingContent,
} from '@instantsearch/mocks';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useDynamicWidgets } from '../useDynamicWidgets';

describe('useDynamicWidgets', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  renderingContent: defaultRenderingContent,
                })
              )
            )
          );
        }),
      }),
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useDynamicWidgets(),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      attributesToRender: [],
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      attributesToRender: [
        'brand',
        'hierarchicalCategories.lvl0',
        'categories',
      ],
    });
  });
});
