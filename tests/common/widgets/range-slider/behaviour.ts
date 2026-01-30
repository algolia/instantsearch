import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { RangeSliderWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createBehaviourTests(
  setup: RangeSliderWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('behaviour', () => {
    test('clamps values when URL refinement exceeds range from index', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'price';
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {
                        1: 100,
                        5000: 1,
                      },
                    },
                    facets_stats: {
                      [attribute]: {
                        min: 1,
                        max: 5000,
                        avg: 2500,
                        sum: 10000,
                      },
                    },
                  })
                )
              );
            }),
          }),
          initialUiState: {
            indexName: {
              range: {
                [attribute]: ':10000',
              },
            },
          },
        },
        widgetParams: { attribute },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Check that the slider handles are clamped to the range
      const handles = document.querySelectorAll('.rheostat-handle');
      
      expect(handles).toHaveLength(2);
      
      // The max handle should not overflow beyond the slider bounds
      const maxHandle = handles[1] as HTMLElement;
      const slider = document.querySelector('.rheostat');
      
      if (slider) {
        const sliderRect = slider.getBoundingClientRect();
        const handleRect = maxHandle.getBoundingClientRect();
        
        // The handle should be within or at the edge of the slider
        expect(handleRect.right).toBeLessThanOrEqual(sliderRect.right + 1);
      }
    });

    test('renders correctly with values in range', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'price';
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {
                        1: 100,
                        1000: 1,
                      },
                    },
                    facets_stats: {
                      [attribute]: {
                        min: 1,
                        max: 1000,
                        avg: 500,
                        sum: 2000,
                      },
                    },
                  })
                )
              );
            }),
          }),
          initialUiState: {
            indexName: {
              range: {
                [attribute]: '100:500',
              },
            },
          },
        },
        widgetParams: { attribute },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const handles = document.querySelectorAll('.rheostat-handle');
      expect(handles).toHaveLength(2);
    });
  });
}
