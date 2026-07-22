/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import LookingSimilar from '../LookingSimilar';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mountLookingSimilar(props) {
  return mount(
    {
      components: { InstantSearch, LookingSimilar },
      data() {
        return { searchClient: createRecommendSearchClient(), props };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <LookingSimilar v-bind="props" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
}

describe('AisLookingSimilar', () => {
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
