/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount, nextTick } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Stats from '../Stats.vue';

jest.mock('../../mixins/widget');

const makeState = (nbHits, extra = {}) => ({
  nbHits,
  nbSortedHits: nbHits,
  areHitsSorted: false,
  processingTimeMS: 10,
  instantSearchInstance: {
    mainIndex: { getHelper: () => ({ lastResults: {} }) },
  },
  ...extra,
});

describe('AisStats', () => {
  beforeEach(() => {
    __setState(null);
  });

  it('renders the default text', () => {
    __setState(makeState(1234, { processingTimeMS: 1234 }));
    const wrapper = mount(Stats);

    expect(wrapper.find('.ais-Stats-text').text()).toBe(
      '1,234 results found in 1,234ms'
    );
  });

  it('accepts custom class names', () => {
    __setState(makeState(10));
    const wrapper = mount(Stats, {
      propsData: {
        classNames: {
          'ais-Stats': 'ROOT',
          'ais-Stats-text': 'TEXT',
          'ais-Stats-announcement': 'ANNOUNCEMENT',
        },
      },
    });

    expect(wrapper.find('.ais-Stats').classes()).toContain('ROOT');
    expect(wrapper.find('.ais-Stats-text').classes()).toContain('TEXT');
    expect(wrapper.find('.ais-Stats-announcement').classes()).toContain(
      'ANNOUNCEMENT'
    );
  });

  it('replaces the text with the default slot', () => {
    __setState(makeState(10));
    const wrapper = mount({
      components: { Stats },
      template: `
        <Stats>
          <template v-slot="{ nbHits, results }">
            <p class="custom">{{ nbHits }} hits, results: {{ typeof results }}</p>
          </template>
        </Stats>
      `,
    });

    expect(wrapper.find('.ais-Stats-text').exists()).toBe(false);
    expect(wrapper.find('.ais-Stats .custom').text()).toBe(
      '10 hits, results: object'
    );
    expect(wrapper.find('.ais-Stats-announcement').exists()).toBe(true);
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
