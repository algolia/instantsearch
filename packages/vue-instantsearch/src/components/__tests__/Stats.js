/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount, nextTick } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Stats from '../Stats.vue';

jest.mock('../../mixins/widget');

const makeState = (nbHits) => ({
  nbHits,
  nbSortedHits: nbHits,
  areHitsSorted: false,
  processingTimeMS: 10,
  instantSearchInstance: { helper: { lastResults: {} } },
});

describe('AisStats', () => {
  beforeEach(() => {
    __setState(null);
  });

  it('announces the trimmed count after a debounce when results change', async () => {
    jest.useFakeTimers();

    try {
      const wrapper = mount(Stats);

      // The initial results (first population of `state`) are not announced.
      wrapper.vm.state = makeState(100);
      await nextTick();

      const region = wrapper.find('.ais-Stats-announcement');
      expect(region.text()).toBe('');

      // A subsequent change to the results should be announced.
      wrapper.vm.state = makeState(5);
      await nextTick();

      // Still empty before the debounce elapses.
      expect(region.text()).toBe('');

      jest.advanceTimersByTime(1400);
      await nextTick();

      expect(region.text()).toBe('5 results');
    } finally {
      jest.useRealTimers();
    }
  });
});
