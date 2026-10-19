/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import FrequentlyBoughtTogether from '../FrequentlyBoughtTogether';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <FrequentlyBoughtTogether v-bind="props" />
  </InstantSearch>
`;

const itemSlotTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <FrequentlyBoughtTogether v-bind="props">
      <template v-slot:item="{ item, sendEvent }">
        <span class="custom-item">{{ item.objectID }} {{ typeof sendEvent }}</span>
      </template>
    </FrequentlyBoughtTogether>
  </InstantSearch>
`;

function mountFrequentlyBoughtTogether(props, template = defaultTemplate) {
  return mount(
    {
      components: { InstantSearch, FrequentlyBoughtTogether },
      data() {
        return {
          searchClient: createRecommendSearchClient(),
          props,
        };
      },
      template,
    },
    { attachTo: document.body }
  );
}

describe('AisFrequentlyBoughtTogether', () => {
  describe('slots', () => {
    it('renders the `item` slot for each item, in both layouts', async () => {
      const list = mountFrequentlyBoughtTogether(
        { objectIDs: ['1'] },
        itemSlotTemplate
      );
      const carousel = mountFrequentlyBoughtTogether(
        { objectIDs: ['1'], layout: 'carousel' },
        itemSlotTemplate
      );

      await wait(0);
      await nextTick();

      const listItems = list.findAll(
        '.ais-FrequentlyBoughtTogether-item .custom-item'
      );
      expect(listItems.length).toBeGreaterThan(0);
      expect(listItems.at(0).text()).toBe('1 function');
      expect(
        carousel.findAll('.ais-Carousel-item .custom-item').length
      ).toBeGreaterThan(0);
    });

    it('renders the `header` and `empty` slots', async () => {
      const withItems = mountFrequentlyBoughtTogether(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <FrequentlyBoughtTogether v-bind="props">
            <template v-slot:header="{ items, translations, classNames }">
              <h2 :class="classNames.title" class="custom-header">
                {{ translations.title }} ({{ items.length }})
              </h2>
            </template>
          </FrequentlyBoughtTogether>
        </InstantSearch>
        `
      );
      const withoutItems = mountFrequentlyBoughtTogether(
        // `limit: 0` simulates receiving no recommendations
        { objectIDs: ['1'], limit: 0 },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <FrequentlyBoughtTogether v-bind="props">
            <template v-slot:empty>
              <p class="custom-empty">Nothing to recommend</p>
            </template>
          </FrequentlyBoughtTogether>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const header = withItems.find('.custom-header');
      expect(header.classes()).toContain('ais-FrequentlyBoughtTogether-title');
      expect(header.text()).toBe('Frequently bought together (2)');
      expect(withItems.find('h3').exists()).toBe(false);

      expect(
        withoutItems.find('.ais-FrequentlyBoughtTogether--empty').exists()
      ).toBe(true);
      expect(withoutItems.find('.custom-empty').text()).toBe(
        'Nothing to recommend'
      );
    });

    it('renders only the `default` slot when it is the only slot', async () => {
      const wrapper = mountFrequentlyBoughtTogether(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <FrequentlyBoughtTogether v-bind="props">
            <template v-slot="{ items }">
              <ul class="custom-list">
                <li v-for="item in items" :key="item.objectID">{{ item.objectID }}</li>
              </ul>
            </template>
          </FrequentlyBoughtTogether>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const root = wrapper.find('.ais-FrequentlyBoughtTogether');
      expect(root.findAll('.custom-list li').length).toBe(2);
      expect(wrapper.find('.ais-FrequentlyBoughtTogether-title').exists()).toBe(
        false
      );
    });
  });

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
