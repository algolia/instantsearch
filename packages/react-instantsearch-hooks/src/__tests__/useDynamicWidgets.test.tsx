import { renderHook } from '@testing-library/react-hooks';

import { createInstantSearchTestWrapper } from '../../../../test/utils';
import { useDynamicWidgets } from '../useDynamicWidgets';

describe('useDynamicWidgets', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
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
