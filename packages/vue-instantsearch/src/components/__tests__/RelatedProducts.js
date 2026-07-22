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
      const next = wrapper.find('.ais-Carousel-navigation--next');

      // Initially the next button is visible. The shared Carousel toggles it
      // imperatively via the ref (a DOM property), so assert on `.hidden`.
      expect(next.element.hidden).toBe(false);

      // In jsdom there's no layout, so after a scroll the carousel computes
      // that it can no longer scroll right. This exercises:
      //  - the onScroll React-style handler (event adapter),
      //  - listRef/nextButtonRef being populated (ref adapter),
      //  - setCanScrollRight re-rendering via the hooks runtime.
      await list.trigger('scroll');
      await nextTick();

      expect(
        wrapper.find('.ais-Carousel-navigation--next').element.hidden
      ).toBe(true);
    });
  });
});
