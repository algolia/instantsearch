import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { RangeInputWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createBehaviourTests(
  setup: RangeInputWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('behaviour', () => {
    test('allows input of values containing a dot decimal separator', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'brand';
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
                        100: 1,
                      },
                    },
                    facets_stats: {
                      [attribute]: {
                        min: 1,
                        max: 100,
                        avg: 50,
                        sum: 200,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attribute, precision: 1 },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        const min = document.querySelector<HTMLInputElement>(
          '.ais-RangeInput-input--min'
        )!;
        const max = document.querySelector<HTMLInputElement>(
          '.ais-RangeInput-input--max'
        )!;

        expect(min).toHaveAttribute('min', '1');
        expect(max).toHaveAttribute('max', '100');

        expect(min).toHaveAttribute('step', '0.1');
        expect(max).toHaveAttribute('step', '0.1');

        expect(min.value).toBe('');
        expect(max.value).toBe('');
      }

      // Input a value to min and max
      {
        const min = document.querySelector<HTMLInputElement>(
          '.ais-RangeInput-input--min'
        )!;
        const max = document.querySelector<HTMLInputElement>(
          '.ais-RangeInput-input--max'
        )!;

        await act(async () => {
          await userEvent.type(min, '1.2', { delay: 1 });
          userEvent.type(max, '3');
        });

        expect(min.value).toBe('1.2');
        expect(max.value).toBe('3');
      }
    });
  });
}
