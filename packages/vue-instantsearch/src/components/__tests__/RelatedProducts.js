/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import RelatedProducts from '../RelatedProducts';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mountRelatedProducts(props) {
  return mount(
    {
      components: { InstantSearch, RelatedProducts },
      data() {
        return {
          searchClient: createRecommendSearchClient(),
          props,
        };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <RelatedProducts v-bind="props" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
}

describe('AisRelatedProducts', () => {
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
