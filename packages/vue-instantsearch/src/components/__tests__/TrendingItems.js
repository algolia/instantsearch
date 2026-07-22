/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import TrendingItems from '../TrendingItems';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mountTrendingItems(props) {
  return mount(
    {
      components: { InstantSearch, TrendingItems },
      data() {
        return { searchClient: createRecommendSearchClient(), props };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingItems v-bind="props" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
}

describe('AisTrendingItems', () => {
  it('renders the default list layout', async () => {
    const wrapper = mountTrendingItems({});
    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-TrendingItems').exists()).toBe(true);
    expect(wrapper.find('.ais-TrendingItems-title').text()).toBe(
      'Trending items'
    );
    expect(wrapper.findAll('.ais-TrendingItems-item').length).toBeGreaterThan(
      0
    );
    expect(wrapper.find('.ais-Carousel').exists()).toBe(false);
  });

  it('renders the shared Carousel layout', async () => {
    const wrapper = mountTrendingItems({ layout: 'carousel' });
    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-Carousel').exists()).toBe(true);
    expect(wrapper.findAll('.ais-Carousel-item').length).toBeGreaterThan(0);
  });
});
