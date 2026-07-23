/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';

import { mount, nextTick } from '../../../test/utils';
import AutocompleteWidget from '../AutocompleteWidget';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

// Autocomplete drives a separate isolated index, so results arrive across a few
// async hops; flush generously.
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

function makeSearchClient() {
  // Return a hits response per request in the batch (the isolated index
  // queries multiple indices at once).
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) =>
            createSingleSearchResponse({
              index: request.indexName,
              hits: [
                { objectID: '1', name: 'Item 1' },
                { objectID: '2', name: 'Item 2' },
              ],
            })
          )
        )
      )
    ),
  });
}

function mountAutocomplete(props) {
  wrapper = mount(
    {
      components: { InstantSearch, AutocompleteWidget },
      data() {
        return { searchClient: makeSearchClient(), props };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <AutocompleteWidget v-bind="props" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );
  return wrapper;
}

describe('AutocompleteWidget (rich)', () => {
  it('renders the root and search box', async () => {
    mountAutocomplete({
      indices: [
        { indexName: 'indexName', itemComponent: (props) => props.item.name },
      ],
    });

    await flush();

    expect(document.querySelector('.ais-Autocomplete')).not.toBeNull();
    expect(
      document.querySelector(
        '.ais-Autocomplete [type=search], .ais-Autocomplete input'
      )
    ).not.toBeNull();
  });

  it('renders index results after typing a query', async () => {
    mountAutocomplete({
      indices: [
        { indexName: 'indexName', itemComponent: (props) => props.item.name },
      ],
    });

    await flush();

    // The isolated index searches on refine, so type a query to trigger it.
    const input = document.querySelector('.ais-Autocomplete input');
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    input.value = 'Item';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flush();

    expect(document.querySelector('.ais-AutocompletePanel')).not.toBeNull();
    const items = document.querySelectorAll('.ais-AutocompleteIndexItem');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].textContent).toContain('Item 1');
  });

  it('wires the searchbox companion `dependsOn` from `requiresSearch`', async () => {
    mountAutocomplete({
      indices: [
        { indexName: 'indexName', itemComponent: (props) => props.item.name },
      ],
    });
    await flush();
    expect(wrapper.findComponent(AutocompleteWidget).vm.widget.dependsOn).toBe(
      'search'
    );

    wrapper.destroy();

    mountAutocomplete({
      requiresSearch: false,
      indices: [
        { indexName: 'indexName', itemComponent: (props) => props.item.name },
      ],
    });
    await flush();
    expect(wrapper.findComponent(AutocompleteWidget).vm.widget.dependsOn).toBe(
      'none'
    );
  });
});
