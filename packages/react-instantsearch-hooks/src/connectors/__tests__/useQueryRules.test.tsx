import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
  defaultUserData,
} from '@instantsearch/mocks';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useQueryRules } from '../useQueryRules';

import type { UseQueryRulesProps } from '../useQueryRules';

describe('useQueryRules', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) =>
                createSingleSearchResponse({
                  index: request.indexName,
                  userData: defaultUserData,
                })
              )
            )
          )
        ),
      }),
    });

    const trackedFilters: UseQueryRulesProps['trackedFilters'] = {
      genre: () => ['Comedy', 'Thriller'],
      rating: (values) => values,
    };

    const transformRuleContexts: UseQueryRulesProps['transformRuleContexts'] = (
      ruleContexts
    ) =>
      ruleContexts.map((ruleContext) => ruleContext.replace('ais-', 'custom-'));

    const transformItems: UseQueryRulesProps['transformItems'] = (items) =>
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
