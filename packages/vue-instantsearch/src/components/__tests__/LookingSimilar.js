/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import LookingSimilar from '../LookingSimilar';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <LookingSimilar v-bind="props" />
  </InstantSearch>
`;

const itemSlotTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <LookingSimilar v-bind="props">
      <template v-slot:item="{ item, sendEvent }">
        <span class="custom-item">{{ item.objectID }} {{ typeof sendEvent }}</span>
      </template>
    </LookingSimilar>
  </InstantSearch>
`;

function mountLookingSimilar(props, template = defaultTemplate) {
  return mount(
    {
      components: { InstantSearch, LookingSimilar },
      data() {
        return { searchClient: createRecommendSearchClient(), props };
      },
      template,
    },
    { attachTo: document.body }
  );
}

describe('AisLookingSimilar', () => {
  describe('slots', () => {
    it('renders the `item` slot for each item, in both layouts', async () => {
      const list = mountLookingSimilar({ objectIDs: ['1'] }, itemSlotTemplate);
      const carousel = mountLookingSimilar(
        { objectIDs: ['1'], layout: 'carousel' },
        itemSlotTemplate
      );

      await wait(0);
      await nextTick();

      const listItems = list.findAll('.ais-LookingSimilar-item .custom-item');
      expect(listItems.length).toBeGreaterThan(0);
      expect(listItems.at(0).text()).toBe('1 function');
      expect(
        carousel.findAll('.ais-Carousel-item .custom-item').length
      ).toBeGreaterThan(0);
    });

    it('renders the `header` and `empty` slots', async () => {
      const withItems = mountLookingSimilar(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <LookingSimilar v-bind="props">
            <template v-slot:header="{ items, translations, classNames }">
              <h2 :class="classNames.title" class="custom-header">
                {{ translations.title }} ({{ items.length }})
              </h2>
            </template>
          </LookingSimilar>
        </InstantSearch>
        `
      );
      const withoutItems = mountLookingSimilar(
        // `limit: 0` simulates receiving no recommendations
        { objectIDs: ['1'], limit: 0 },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <LookingSimilar v-bind="props">
            <template v-slot:empty>
              <p class="custom-empty">Nothing to recommend</p>
            </template>
          </LookingSimilar>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const header = withItems.find('.custom-header');
      expect(header.classes()).toContain('ais-LookingSimilar-title');
      expect(header.text()).toBe('Looking similar (2)');
      expect(withItems.find('h3').exists()).toBe(false);

      expect(withoutItems.find('.ais-LookingSimilar--empty').exists()).toBe(
        true
      );
      expect(withoutItems.find('.custom-empty').text()).toBe(
        'Nothing to recommend'
      );
    });

    it('renders only the `default` slot when it is the only slot', async () => {
      const wrapper = mountLookingSimilar(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <LookingSimilar v-bind="props">
            <template v-slot="{ items }">
              <ul class="custom-list">
                <li v-for="item in items" :key="item.objectID">{{ item.objectID }}</li>
              </ul>
            </template>
          </LookingSimilar>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const root = wrapper.find('.ais-LookingSimilar');
      expect(root.findAll('.custom-list li').length).toBe(2);
      expect(wrapper.find('.ais-LookingSimilar-title').exists()).toBe(false);
    });
  });

  it('renders the default list layout', async () => {
    const wrapper = mountLookingSimilar({ objectIDs: ['1'] });
    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-LookingSimilar').exists()).toBe(true);
    expect(wrapper.find('.ais-LookingSimilar-title').text()).toBe(
      'Looking similar'
    );
    expect(wrapper.findAll('.ais-LookingSimilar-item').length).toBeGreaterThan(
      0
    );
    expect(wrapper.find('.ais-Carousel').exists()).toBe(false);
  });

  it('renders the shared Carousel layout', async () => {
    const wrapper = mountLookingSimilar({
      objectIDs: ['1'],
      layout: 'carousel',
    });
    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-Carousel').exists()).toBe(true);
    expect(wrapper.findAll('.ais-Carousel-item').length).toBeGreaterThan(0);
    expect(
      wrapper.find('.ais-Carousel-navigation--previous').element.hidden
    ).toBe(true);
  });
});
