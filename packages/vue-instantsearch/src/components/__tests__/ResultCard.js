/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import ResultCard from '../ResultCard';
import SearchBox from '../SearchBox.vue';

jest.unmock('instantsearch.js/es');

// The card renders nothing until a Rule enables it in the results; this
// response activates it (the connector then shows its skeleton before
// requesting).
function createActivatingSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve({
        results: requests.map((request) => ({
          hits: [{ objectID: '1' }],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: (request.params && request.params.query) || 'running shoes',
          params: '',
          index: 'indexName',
          renderingContent: { widgets: { resultCard: { enabled: true } } },
        })),
      })
    ),
  });
}

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
});

async function mountResultCard(template, data = {}) {
  wrapper = mount(
    {
      components: { InstantSearch, ResultCard },
      data() {
        return Object.assign(
          { searchClient: createActivatingSearchClient() },
          data
        );
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          ${template}
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );

  await wait(0);
  await nextTick();
}

describe('ResultCard', () => {
  test('renders a `layout` slot with several root elements', async () => {
    await mountResultCard(`
      <ResultCard agent-id="test-agent-id">
        <template #layout="{ status, query }">
          <p class="status">{{ status }}</p>
          <p class="query">{{ query }}</p>
        </template>
      </ResultCard>
    `);

    expect(wrapper.find('.status').text()).toBe('loading');
    expect(wrapper.find('.query').text()).toBe('running shoes');
    expect(wrapper.find('.ais-ResultCard').exists()).toBe(false);
  });

  test('cleans up the default card when a `layout` slot replaces it', async () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');

    await mountResultCard(
      `
        <ResultCard agent-id="test-agent-id">
          <template v-if="custom" #layout="{ status }">
            <p class="custom">{{ status }}</p>
          </template>
        </ResultCard>
      `,
      { custom: false }
    );

    const measure = addEventListener.mock.calls.find(
      ([type]) => type === 'resize'
    )[1];
    expect(wrapper.find('.ais-ResultCard').exists()).toBe(true);

    await wrapper.setData({ custom: true });

    expect(wrapper.find('.custom').text()).toBe('loading');
    expect(removeEventListener).toHaveBeenCalledWith('resize', measure);

    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });

  test('stays minimized for a new query', async () => {
    wrapper = mount(
      {
        components: { InstantSearch, SearchBox, ResultCard },
        data() {
          return { searchClient: createActivatingSearchClient() };
        },
        template: `
          <InstantSearch :search-client="searchClient" index-name="indexName">
            <SearchBox />
            <ResultCard agent-id="test-agent-id" />
          </InstantSearch>
        `,
      },
      { attachTo: document.body }
    );

    await wait(0);
    await nextTick();

    await wrapper.find('.ais-ResultCard-minimizeButton').trigger('click');
    expect(wrapper.find('.ais-ResultCard-body').exists()).toBe(false);

    await wrapper.find('.ais-SearchBox-input').setValue('trail shoes');
    await wait(0);
    await nextTick();

    expect(wrapper.find('.ais-ResultCard').attributes('data-status')).toBe(
      'loading'
    );
    expect(wrapper.find('.ais-ResultCard-body').exists()).toBe(false);
    expect(
      wrapper.find('.ais-ResultCard-minimizeButton').attributes('aria-label')
    ).toBe('Maximize');
  });
});
