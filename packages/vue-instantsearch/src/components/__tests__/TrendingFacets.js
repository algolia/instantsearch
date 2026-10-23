/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createTrendingFacetsSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import TrendingFacets from '../TrendingFacets';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <TrendingFacets v-bind="props" />
  </InstantSearch>
`;

function mountTrendingFacets(props, template = defaultTemplate) {
  return mount(
    {
      components: { InstantSearch, TrendingFacets },
      data() {
        return { searchClient: createTrendingFacetsSearchClient(), props };
      },
      template,
    },
    { attachTo: document.body }
  );
}

describe('AisTrendingFacets', () => {
  it('renders the facet list', async () => {
    const wrapper = mountTrendingFacets({ facetName: 'brand' });

    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-TrendingFacets').exists()).toBe(true);
    expect(wrapper.find('.ais-TrendingFacets-title').text()).toBe('Trending');
    const items = wrapper.findAll('.ais-TrendingFacets-item');
    expect(items.length).toBe(2);
    expect(items.at(0).text()).toBe('Apple');
  });

  describe('slots', () => {
    it('renders the `item` slot for each facet value', async () => {
      const wrapper = mountTrendingFacets(
        { facetName: 'brand' },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingFacets v-bind="props">
            <template v-slot:item="{ item }">
              <span class="custom-item">{{ item.facetName }}: {{ item.facetValue }}</span>
            </template>
          </TrendingFacets>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const items = wrapper.findAll('.ais-TrendingFacets-item .custom-item');
      expect(items.length).toBe(2);
      expect(items.at(0).text()).toBe('brand: Apple');
    });

    it('renders the `header` and `empty` slots', async () => {
      const withItems = mountTrendingFacets(
        { facetName: 'brand' },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingFacets v-bind="props">
            <template v-slot:header="{ items, translations, classNames }">
              <h2 :class="classNames.title" class="custom-header">
                {{ translations.title }} ({{ items.length }})
              </h2>
            </template>
          </TrendingFacets>
        </InstantSearch>
        `
      );
      const withoutItems = mountTrendingFacets(
        // `limit: 0` simulates receiving no recommendations
        { facetName: 'brand', limit: 0 },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingFacets v-bind="props">
            <template v-slot:empty>
              <p class="custom-empty">Nothing trending</p>
            </template>
          </TrendingFacets>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const header = withItems.find('.custom-header');
      expect(header.classes()).toContain('ais-TrendingFacets-title');
      expect(header.text()).toBe('Trending (2)');
      expect(withItems.find('h3').exists()).toBe(false);

      expect(withoutItems.find('.ais-TrendingFacets--empty').exists()).toBe(
        true
      );
      expect(withoutItems.find('.custom-empty').text()).toBe(
        'Nothing trending'
      );
    });

    it('renders only the `default` slot when it is the only slot', async () => {
      const wrapper = mountTrendingFacets(
        { facetName: 'brand' },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <TrendingFacets v-bind="props">
            <template v-slot="{ items }">
              <ul class="custom-list">
                <li v-for="item in items" :key="item.facetValue">{{ item.facetValue }}</li>
              </ul>
            </template>
          </TrendingFacets>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const root = wrapper.find('.ais-TrendingFacets');
      expect(root.findAll('.custom-list li').length).toBe(2);
      expect(wrapper.find('.ais-TrendingFacets-title').exists()).toBe(false);
    });
  });
});
