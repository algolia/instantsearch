/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

// The package-level manual mock replaces `instantsearch.js/es` in unit
// tests; this suite integrates against the real library.
jest.unmock('instantsearch.js/es');

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../../components/InstantSearch';
import { renderCompat } from '../../util/vue-compat';
import { useSearchBox } from '../useSearchBox';

// Lets InstantSearch start (root mounted + nextTick) and searches resolve.
const flushSearch = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();
  }
};

const mountApp = ({ setup, instantSearchProps = {} }) => {
  const Child = {
    render: () => null,
    setup,
  };

  return mount({
    render: renderCompat((h) =>
      h(
        InstantSearch,
        {
          props: {
            searchClient: createSearchClient(),
            indexName: 'indexName',
            ...instantSearchProps,
          },
        },
        [h(Child)]
      )
    ),
  });
};

describe('useSearchBox', () => {
  it('exposes a synchronous initial state before the instance has started', () => {
    let searchBox;

    mountApp({
      setup() {
        searchBox = useSearchBox();
        return {};
      },
    });

    // Asserted synchronously after mount: start() has not run yet.
    expect(searchBox.query.value).toBe('');
    expect(searchBox.isSearchStalled.value).toBe(false);
    expect(typeof searchBox.refine).toBe('function');
    expect(typeof searchBox.clear).toBe('function');
  });

  it('derives the initial query from initialUiState', () => {
    let searchBox;

    mountApp({
      instantSearchProps: {
        initialUiState: { indexName: { query: 'iphone' } },
      },
      setup() {
        searchBox = useSearchBox();
        return {};
      },
    });

    expect(searchBox.query.value).toBe('iphone');
  });

  it('refines and clears the query once started', async () => {
    let searchBox;

    mountApp({
      setup() {
        searchBox = useSearchBox();
        return {};
      },
    });

    await flushSearch();

    searchBox.refine('hello');
    await flushSearch();
    expect(searchBox.query.value).toBe('hello');

    searchBox.clear();
    await flushSearch();
    expect(searchBox.query.value).toBe('');
  });
});
