import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { fireEvent } from '@testing-library/dom';

import type { RangeSliderWidgetSetup } from '.';
import type { TestOptions } from '../../common';

const ARROW_RIGHT = 39;

export function createBehaviourTests(
  setup: RangeSliderWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('behaviour', () => {
    test('moves the handle with the keyboard when there are no snap points', async () => {
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
        },
        // No `step`: the Slider runs with `snap` enabled but no snap points,
        // which is the configuration that used to make the handles ignore the
        // keyboard. This mirrors the e-commerce examples.
        widgetParams: { attribute },
      };

      await setup(options);

      // Wait for initial results to populate the widget with a range.
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const before = Number(
        document
          .querySelector('.rheostat-handle-lower')!
          .getAttribute('aria-valuenow')
      );
      // The lower handle starts at the minimum of the range.
      expect(before).toBe(1);

      // Move the lower handle to the right using the keyboard only.
      await act(async () => {
        const handle = document.querySelector<HTMLElement>(
          '.rheostat-handle-lower'
        )!;
        handle.focus();
        fireEvent.keyDown(handle, { keyCode: ARROW_RIGHT });
        await wait(margin + delay);
        await wait(0);
      });

      const after = Number(
        document
          .querySelector('.rheostat-handle-lower')!
          .getAttribute('aria-valuenow')
      );
      // The lower bound moved to the right (increased) from its starting value.
      expect(after).toBeGreaterThan(before);
    });
  });
}
