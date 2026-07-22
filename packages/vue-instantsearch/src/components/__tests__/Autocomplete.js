/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';

import { mount, nextTick } from '../../../test/utils';
import Autocomplete from '../Autocomplete';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

async function flush() {
  for (let i = 0; i < 6; i++) {
    // eslint-disable-next-line no-await-in-loop
    await wait(5);
    // eslint-disable-next-line no-await-in-loop
    await nextTick();
  }
}

let wrapper;
afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
});

function searchClient() {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) =>
            createSingleSearchResponse({
              index: request.indexName,
              hits: [{ objectID: '1', name: 'Item 1' }],
            })
          )
        )
      )
    ),
  });
}

describe('AisAutocomplete dispatcher', () => {
  it('renders the rich widget when no default slot is provided', async () => {
    wrapper = mount(
      {
        components: { InstantSearch, Autocomplete },
        data: () => ({ searchClient: searchClient() }),
        template: `
          <InstantSearch :search-client="searchClient" index-name="indexName">
            <Autocomplete :indices="[{ indexName: 'indexName', itemComponent: (props) => props.item.name }]" />
          </InstantSearch>
        `,
      },
      { attachTo: document.body }
    );

    await flush();

    expect(document.querySelector('.ais-Autocomplete')).not.toBeNull();
    expect(document.querySelector('.ais-Autocomplete input')).not.toBeNull();
  });

  it('preserves the legacy headless slot API when a default slot is provided', async () => {
    wrapper = mount(
      {
        components: { InstantSearch, Autocomplete },
        data: () => ({ searchClient: searchClient() }),
        template: `
          <InstantSearch :search-client="searchClient" index-name="indexName">
            <Autocomplete>
              <template v-slot="{ refine, indices }">
                <div class="custom-headless">
                  <span class="refine-type">{{ typeof refine }}</span>
                  <span class="indices-type">{{ Array.isArray(indices) }}</span>
                </div>
              </template>
            </Autocomplete>
          </InstantSearch>
        `,
      },
      { attachTo: document.body }
    );

    await flush();

    // The legacy headless component renders the slot and exposes its state.
    expect(document.querySelector('.custom-headless')).not.toBeNull();
    expect(document.querySelector('.refine-type').textContent).toBe('function');
    expect(document.querySelector('.indices-type').textContent).toBe('true');
    // It does NOT render the rich widget's search input.
    expect(document.querySelector('.ais-Autocomplete input')).toBeNull();
  });
});
