/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import FrequentlyBoughtTogether from '../FrequentlyBoughtTogether';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mountFrequentlyBoughtTogether(props) {
  return mount(
    {
      components: { InstantSearch, FrequentlyBoughtTogether },
      data() {
        return {
          searchClient: createRecommendSearchClient(),
          props,
        };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <FrequentlyBoughtTogether v-bind="props" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
}

describe('AisFrequentlyBoughtTogether', () => {
  it('renders the default list layout', async () => {
    const wrapper = mountFrequentlyBoughtTogether({ objectIDs: ['1'] });

    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-FrequentlyBoughtTogether').exists()).toBe(true);
    expect(wrapper.find('.ais-FrequentlyBoughtTogether-title').text()).toBe(
      'Frequently bought together'
    );
    expect(
      wrapper.findAll('.ais-FrequentlyBoughtTogether-item').length
    ).toBeGreaterThan(0);
    expect(wrapper.find('.ais-Carousel').exists()).toBe(false);
  });

  it('renders the shared Carousel layout (reuses the hook-based infra)', async () => {
    const wrapper = mountFrequentlyBoughtTogether({
      objectIDs: ['1'],
      layout: 'carousel',
    });

    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-Carousel').exists()).toBe(true);
    expect(wrapper.findAll('.ais-Carousel-item').length).toBeGreaterThan(0);
    // Navigation state is driven by the hooks runtime; previous starts hidden.
    expect(
      wrapper.find('.ais-Carousel-navigation--previous').element.hidden
    ).toBe(true);
  });
});
