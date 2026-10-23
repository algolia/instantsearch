/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import RelatedProducts from '../RelatedProducts';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultTemplate = `
  <InstantSearch :search-client="searchClient" index-name="indexName">
    <RelatedProducts v-bind="props" />
  </InstantSearch>
`;

function mountRelatedProducts(props, template = defaultTemplate) {
  return mount(
    {
      components: { InstantSearch, RelatedProducts },
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

describe('AisRelatedProducts', () => {
  describe('slots', () => {
    it('renders the `item` slot for each item', async () => {
      const wrapper = mountRelatedProducts(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot:item="{ item }">
              <span class="custom-item">{{ item.objectID }}</span>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const items = wrapper.findAll('.ais-RelatedProducts-item .custom-item');
      expect(items.length).toBeGreaterThan(0);
      expect(items.at(0).text()).toBe('1');
    });

    it('exposes `sendEvent` to the `item` slot', async () => {
      const wrapper = mountRelatedProducts(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot:item="{ sendEvent }">
              <span class="custom-item">{{ typeof sendEvent }}</span>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      expect(wrapper.find('.custom-item').text()).toBe('function');
    });

    it('renders the `item` slot inside the carousel layout', async () => {
      const wrapper = mountRelatedProducts(
        { objectIDs: ['1'], layout: 'carousel' },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot:item="{ item }">
              <span class="custom-item">{{ item.objectID }}</span>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      expect(wrapper.find('.ais-Carousel').exists()).toBe(true);
      expect(
        wrapper.findAll('.ais-Carousel-item .custom-item').length
      ).toBeGreaterThan(0);
    });

    it('renders the `header` slot with items, translations and classNames', async () => {
      const wrapper = mountRelatedProducts(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot:header="{ items, translations, classNames }">
              <h2 :class="classNames.title" class="custom-header">
                {{ translations.title }} ({{ items.length }})
              </h2>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const header = wrapper.find('.custom-header');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain('ais-RelatedProducts-title');
      expect(header.text()).toBe('Related products (2)');
      expect(wrapper.find('h3').exists()).toBe(false);
    });

    it('renders the `empty` slot when there are no results', async () => {
      const wrapper = mountRelatedProducts(
        // `limit: 0` simulates receiving no recommendations
        { objectIDs: ['1'], limit: 0 },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot:empty>
              <p class="custom-empty">Nothing to recommend</p>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      expect(wrapper.find('.ais-RelatedProducts--empty').exists()).toBe(true);
      expect(wrapper.find('.custom-empty').text()).toBe('Nothing to recommend');
    });

    it('renders only the `default` slot when it is the only slot', async () => {
      const wrapper = mountRelatedProducts(
        { objectIDs: ['1'] },
        `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props">
            <template v-slot="{ items, sendEvent }">
              <ul class="custom-list">
                <li v-for="item in items" :key="item.objectID">{{ item.objectID }}</li>
              </ul>
            </template>
          </RelatedProducts>
        </InstantSearch>
        `
      );

      await wait(0);
      await nextTick();

      const root = wrapper.find('.ais-RelatedProducts');
      expect(root.exists()).toBe(true);
      expect(root.findAll('.custom-list li').length).toBe(2);
      // The shared markup (title / list) is not rendered.
      expect(wrapper.find('.ais-RelatedProducts-title').exists()).toBe(false);
      expect(wrapper.find('.ais-RelatedProducts-list').exists()).toBe(false);
    });
  });

  it('renders the default list layout', async () => {
    const wrapper = mountRelatedProducts({ objectIDs: ['1'] });

    await wait(0);
    await nextTick();

    const root = wrapper.find('.ais-RelatedProducts');
    expect(root.exists()).toBe(true);
    expect(wrapper.find('.ais-RelatedProducts-title').text()).toBe(
      'Related products'
    );
    expect(wrapper.findAll('.ais-RelatedProducts-list').length).toBe(1);
    expect(wrapper.findAll('.ais-RelatedProducts-item').length).toBeGreaterThan(
      0
    );
    // The list layout has no carousel navigation.
    expect(wrapper.find('.ais-Carousel').exists()).toBe(false);
  });

  describe('carousel layout (hooks + ref + event infra)', () => {
    it('renders the shared Carousel with navigation and items', async () => {
      const wrapper = mountRelatedProducts({
        objectIDs: ['1'],
        layout: 'carousel',
      });

      await wait(0);
      await nextTick();

      expect(wrapper.find('.ais-Carousel').exists()).toBe(true);
      expect(wrapper.findAll('.ais-Carousel-item').length).toBeGreaterThan(0);

      // Both navigation buttons render; the previous one starts hidden
      // (canScrollLeft is false initially — driven by the hooks `useState`).
      const previous = wrapper.find('.ais-Carousel-navigation--previous');
      const next = wrapper.find('.ais-Carousel-navigation--next');
      expect(previous.exists()).toBe(true);
      expect(next.exists()).toBe(true);
      // `.hidden` (DOM property) is robust across Vue 2/3 attribute serialization.
      expect(previous.element.hidden).toBe(true);
    });

    it('updates navigation state on scroll (proves ref + useState + event wiring)', async () => {
      const wrapper = mountRelatedProducts({
        objectIDs: ['1'],
        layout: 'carousel',
      });

      await wait(0);
      await nextTick();

      const list = wrapper.find('.ais-Carousel-list');
      const previous = wrapper.find('.ais-Carousel-navigation--previous');
      const next = wrapper.find('.ais-Carousel-navigation--next');

      // When the items arrived, the shared Carousel's `useEffect` (driven by
      // the hooks runtime) re-checked the navigation. jsdom has no layout, so
      // the list doesn't overflow and the next button is hidden too. The
      // shared Carousel toggles the buttons imperatively via the refs (a DOM
      // property), so assert on `.hidden`.
      expect(previous.element.hidden).toBe(true);
      expect(next.element.hidden).toBe(true);

      // Simulate a list that overflows, then scroll it. This exercises:
      //  - the onScroll React-style handler (event adapter),
      //  - listRef/nextButtonRef/previousButtonRef being populated (ref adapter),
      //  - setCanScrollLeft/Right re-rendering via the hooks runtime.
      Object.defineProperties(list.element, {
        clientWidth: { configurable: true, value: 100 },
        scrollWidth: { configurable: true, value: 200 },
      });

      list.element.scrollLeft = 0;
      await list.trigger('scroll');
      await nextTick();

      expect(previous.element.hidden).toBe(true);
      expect(next.element.hidden).toBe(false);

      list.element.scrollLeft = 100;
      await list.trigger('scroll');
      await nextTick();

      expect(previous.element.hidden).toBe(false);
      expect(next.element.hidden).toBe(true);
    });
  });
});
