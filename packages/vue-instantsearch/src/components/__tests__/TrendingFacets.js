/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import TrendingFacets from '../TrendingFacets';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe('AisTrendingFacets', () => {
  it('renders the facet list', async () => {
    const wrapper = mount(
      {
        components: { InstantSearch, TrendingFacets },
        data() {
          return { searchClient: createRecommendSearchClient() };
        },
        template: `
          <InstantSearch :search-client="searchClient" index-name="indexName">
            <TrendingFacets facet-name="brand" />
          </InstantSearch>
        `,
      },
      { attachTo: document.body }
    );

    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-TrendingFacets').exists()).toBe(true);
    expect(wrapper.findAll('.ais-TrendingFacets-item').length).toBeGreaterThan(
      0
    );
  });
});
