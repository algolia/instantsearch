import { renderHook } from '@testing-library/react-hooks';

import { createInstantSearchTestWrapper } from '../../../../test/utils';
import { useQueryRules } from '../useQueryRules';

describe('useQueryRules', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();

    const trackedFilters = {
      genre: () => ['Comedy', 'Thriller'],
      rating: (values) => values,
    };

    const transformRuleContexts = (ruleContexts) =>
      ruleContexts.map((ruleContext) => ruleContext.replace('ais-', 'custom-'));

    const transformItems = (items) =>
      items.map((item) => ({
        ...item,
        title: `${item.title} (transformed)`,
      }));

    const { result, waitForNextUpdate } = renderHook(
      () =>
        useQueryRules({
          trackedFilters,
          transformRuleContexts,
          transformItems,
        }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      items: [
        {
          title: 'Banner title (transformed)',
          banner: 'https://banner.jpg',
          link: 'https://banner.com/link/',
        },
      ],
    });
  });
});
