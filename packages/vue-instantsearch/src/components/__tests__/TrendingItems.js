/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import TrendingItems from '../TrendingItems';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <TrendingItems v-bind="props" />
  </InstantSearch>
`;

const itemSlotTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <TrendingItems v-bind="props">
      <template v-slot:item="{ item, sendEvent }">
        <span class="custom-item">{{ item.objectID }} {{ typeof sendEvent }}</span>
      </template>
    </TrendingItems>
  </InstantSearch>
`;

function mountTrendingItems(props, template = defaultTemplate) {
  return mount(
    {
      components: { InstantSearch, TrendingItems },
      data() {
        return { searchClient: createRecommendSearchClient(), props };
      },
      template,
    },
    { attachTo: document.body }
  );
}

describe('AisTrendingItems', () => {
  describe('slots', () => {
    it('renders the `item` slot for each item, in both layouts', async () => {
      const list = mountTrendingItems({}, itemSlotTemplate);
      const carousel = mountTrendingItems(
        { layout: 'carousel' },
        itemSlotTemplate
      );

      await wait(0);
      await nextTick();

      const listItems = list.findAll('.ais-TrendingItems-item .custom-item');
      expect(listItems.length).toBeGreaterThan(0);
      expect(listItems.at(0).text()).toBe('1 function');
      expect(
        carousel.findAll('.ais-Carousel-item .custom-item').length
      ).toBeGreaterThan(0);
    });

    it('renders the `header` and `empty` slots', async () => {
      const withItems = mountTrendingItems(
        {},
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingItems v-bind="props">
            <template v-slot:header="{ items, translations, classNames }">
              <h2 :class="classNames.title" class="custom-header">
                {{ translations.title }} ({{ items.length }})
              </h2>
            </template>
          </TrendingItems>
        </InstantSearch>
        `
      );
      const withoutItems = mountTrendingItems(
        // `limit: 0` simulates receiving no recommendations
        { limit: 0 },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingItems v-bind="props">
            <template v-slot:empty>
              <p class="custom-empty">Nothing trending</p>
            </template>
          </TrendingItems>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const header = withItems.find('.custom-header');
      expect(header.classes()).toContain('ais-TrendingItems-title');
      expect(header.text()).toBe('Trending items (2)');
      expect(withItems.find('h3').exists()).toBe(false);

      expect(withoutItems.find('.ais-TrendingItems--empty').exists()).toBe(
        true
      );
      expect(withoutItems.find('.custom-empty').text()).toBe(
        'Nothing trending'
      );
    });

    it('renders only the `default` slot when it is the only slot', async () => {
      const wrapper = mountTrendingItems(
        {},
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingItems v-bind="props">
            <template v-slot="{ items }">
              <ul class="custom-list">
                <li v-for="item in items" :key="item.objectID">{{ item.objectID }}</li>
              </ul>
            </template>
          </TrendingItems>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const root = wrapper.find('.ais-TrendingItems');
      expect(root.findAll('.custom-list li').length).toBe(2);
      expect(wrapper.find('.ais-TrendingItems-title').exists()).toBe(false);
    });
  });

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
