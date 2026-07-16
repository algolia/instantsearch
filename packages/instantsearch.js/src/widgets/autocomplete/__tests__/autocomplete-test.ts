/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createCompositionClient,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../..';
import { walkIndex } from '../../../lib/utils';
import { autocomplete } from '../autocomplete';

describe('autocomplete()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('usage', () => {
    it('requires container', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        autocomplete({})
      ).toThrow(/container/);
    });

    it('throws when both `feeds` and `indices` are provided', () => {
      expect(() =>
        // @ts-expect-error — mutual exclusion is enforced at compile time
        autocomplete({
          container: document.createElement('div'),
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          indices: [],
        })
      ).toThrow(/mutually exclusive/);
    });
  });

  describe('feeds-mode init', () => {
    it('throws at init when outer InstantSearch has no compositionID', () => {
      const search = instantsearch({
        searchClient: createSearchClient({}),
        indexName: 'indexName',
      });

      search.addWidgets([
        autocomplete({
          container: document.body.appendChild(document.createElement('div')),
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      expect(() => search.start()).toThrow(/composition-based/);
    });

    it('does not throw in indices-mode when outer InstantSearch has no compositionID', () => {
      const search = instantsearch({
        searchClient: createSearchClient({}),
        indexName: 'indexName',
      });

      search.addWidgets([
        autocomplete({
          container: document.body.appendChild(document.createElement('div')),
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      expect(() => search.start()).not.toThrow();
    });

    it('does not throw in feeds-mode when outer InstantSearch is composition-based', () => {
      const compositionClient = createCompositionClient();
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container: document.body.appendChild(document.createElement('div')),
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      expect(() => search.start()).not.toThrow();
    });

    it('normalizes transformItems indices to feed IDs in feeds-mode', async () => {
      const transformItems = jest.fn((items) => items);
      const container = document.body.appendChild(document.createElement('div'));
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          transformItems,
        }),
      ]);

      search.start();
      await wait(0);
      container.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      await wait(0);
      await wait(0);

      const lastCallItems = transformItems.mock.calls
        .map((call) => call[0])
        .filter((items) => items.length > 0)
        .pop();

      expect(lastCallItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            indexId: 'products',
            indexName: 'products',
          }),
        ])
      );
    });

    it('keeps feedID normalization for declared feeds with mixed feed responses', async () => {
      const transformItems = jest.fn((items) => items);
      const container = document.body.appendChild(document.createElement('div'));
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'unknown-feed',
                hits: [{ objectID: 'u1' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
            {
              feedID: 'articles',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          transformItems,
        }),
      ]);

      search.start();
      await wait(0);
      container.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      await wait(0);
      await wait(0);

      const lastCallItems = transformItems.mock.calls
        .map((call) => call[0])
        .filter((items) => items.length > 0)
        .pop();
      const indexNameById = new Map(
        ((lastCallItems ?? []) as Array<{ indexId: string; indexName: string }>)
          .map((item) => [item.indexId, item.indexName])
      );

      expect(indexNameById.get('products')).toBe('products');
      expect(indexNameById.get('articles')).toBe('articles');
    });
  });

  describe('feeds-mode rendering', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    async function flush() {
      await wait(0);
      await wait(0);
      await wait(0);
    }

    function focusSearchInput(container: HTMLElement) {
      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      );
      if (!input) {
        return;
      }
      input.focus();
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    }

    it('renders one AutocompleteIndex section per declared feed', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1', title: 'Product 1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'articles',
                hits: [{ objectID: 'a1', title: 'Article 1' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: {
                item: ({ item }) => String((item as any).title),
              },
            },
            {
              feedID: 'articles',
              templates: {
                item: ({ item }) => String((item as any).title),
              },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(container.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        2
      );
    });

    it('showQuerySuggestions.feedID renders the suggestions section', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'suggestions',
                hits: [{ objectID: 's1', query: 'iphone' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          showQuerySuggestions: { feedID: 'suggestions' },
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(
        container.querySelector('.ais-AutocompleteSuggestions')
      ).not.toBeNull();
      expect(
        container.querySelector('.ais-AutocompleteSuggestionsItem')
      ).not.toBeNull();
    });

    it('showPromptSuggestions.feedID renders the prompt suggestions section', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'prompts',
                hits: [
                  {
                    objectID: 'pr1',
                    prompt: 'Ask about shoes',
                  },
                ],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          showPromptSuggestions: { feedID: 'prompts' },
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(
        container.querySelector('.ais-AutocompletePromptSuggestions')
      ).not.toBeNull();
      expect(container.textContent).toContain('Ask about shoes');
    });

    it('dedupes suggestions against recent searches', async () => {
      window.localStorage.setItem(
        'autocomplete-recent-searches',
        JSON.stringify(['iphone'])
      );
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'suggestions',
                hits: [
                  { objectID: 's1', query: 'iphone' },
                  { objectID: 's2', query: 'ipad' },
                ],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
          showRecent: true,
          showQuerySuggestions: { feedID: 'suggestions' },
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      const matches = container.textContent?.match(/iphone/g);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
    });

    it('does not render a section for a declared feed missing from the response', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1', title: 'Product 1' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: {
                item: ({ item }) => String((item as any).title),
              },
            },
            {
              feedID: 'articles',
              templates: {
                header: () => 'Articles header',
                item: ({ item }) => String(item.objectID),
              },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(container.textContent).toContain('Product 1');
      expect(container.textContent).not.toContain('Articles header');
    });

    it('skips unknown feeds returned by the server', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [{ objectID: 'p1', title: 'Product 1' }],
              } as any),
              createSingleSearchResponse({
                feedID: 'unknown-feed',
                hits: [{ objectID: 'u1', title: 'Unknown 1' }],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: {
                item: ({ item }) => String((item as any).title),
              },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(container.textContent).toContain('Product 1');
      expect(container.textContent).not.toContain('Unknown 1');
    });

    it('empty feed hits does not crash and hides empty panel (no index roots)', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const compositionClient = createCompositionClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              createSingleSearchResponse({
                feedID: 'products',
                hits: [],
              } as any),
            ],
          })
        ),
      });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      expect(() => search.start()).not.toThrow();
      await flush();
      focusSearchInput(container);
      await flush();

      expect(container.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        0
      );
    });
  });

  describe('lazy activation', () => {
    function focusSearchInput(container: HTMLElement) {
      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      );
      if (!input) {
        return;
      }
      input.focus();
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    }

    async function flush() {
      await wait(0);
      await wait(0);
      await wait(0);
    }

    it('does not search on mount in indices-mode', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'indexName',
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();

      const requestedIndices = (searchClient.search as jest.Mock).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .map((request) => request.indexName);

      expect(requestedIndices).not.toContain('my-index');
    });

    it('searches the autocomplete index on first focus in indices-mode', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'indexName',
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      const requestedIndices = (searchClient.search as jest.Mock).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .map((request) => request.indexName);

      expect(requestedIndices).toContain('my-index');
    });

    it('propagates the initial query from the parent into the autocomplete search on first focus', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'indexName',
        initialUiState: {
          indexName: { query: 'macbook' },
        },
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      const autocompleteRequests = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string; params: { query?: string } }>)
        .filter((request) => request.indexName === 'my-index');

      expect(autocompleteRequests).toHaveLength(1);
      expect(autocompleteRequests[0].params.query).toBe('macbook');
    });

    it('pre-activation shell input reflects the parent query', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'indexName',
        initialUiState: {
          indexName: { query: 'macbook' },
        },
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();

      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      )!;
      expect(input.value).toBe('macbook');
    });

    it('uses a namespaced indexId for child indices to avoid collisions with same-named parent indices', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'instant_search',
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'instant_search',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();

      const indexIds: string[] = [];
      walkIndex(search.mainIndex, (widget) => indexIds.push(widget.getIndexId()));

      const parentMatches = indexIds.filter((id) => id === 'instant_search');
      expect(parentMatches).toHaveLength(1);
      expect(
        indexIds.some((id) => id.startsWith('ais-autocomplete-') && id.endsWith('-instant_search'))
      ).toBe(true);
    });

    it('attaches the isolated tree only once across repeated focuses', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchClient = createSearchClient({});
      const search = instantsearch({
        searchClient,
        indexName: 'indexName',
      });

      search.addWidgets([
        autocomplete({
          container,
          indices: [
            {
              indexName: 'my-index',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      focusSearchInput(container);
      await flush();
      const callsAfterFirstFocus = (searchClient.search as jest.Mock).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .filter((request) => request.indexName === 'my-index').length;

      focusSearchInput(container);
      await flush();
      const callsAfterSecondFocus = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .filter((request) => request.indexName === 'my-index').length;

      expect(callsAfterSecondFocus).toBe(callsAfterFirstFocus);
    });

    it('only the parent composition search fires before focus in feeds-mode; focus adds another', async () => {
      const container = document.body.appendChild(
        document.createElement('div')
      );
      const searchMock = jest.fn(() =>
        Promise.resolve({
          results: [
            createSingleSearchResponse({
              feedID: 'products',
              hits: [{ objectID: 'p1' }],
            } as any),
          ],
        })
      );
      const compositionClient = createCompositionClient({ search: searchMock });
      const search = instantsearch({
        searchClient: compositionClient,
        compositionID: 'my-comp',
      });

      search.addWidgets([
        autocomplete({
          container,
          feeds: [
            {
              feedID: 'products',
              templates: { item: ({ item }) => String(item.objectID) },
            },
          ],
        }),
      ]);

      search.start();
      await flush();
      const callsBeforeFocus = searchMock.mock.calls.length;

      focusSearchInput(container);
      await flush();
      const callsAfterFocus = searchMock.mock.calls.length;

      // Mount triggers only the parent composition search; focus triggers
      // exactly one additional search (the isolated autocomplete's), without
      // re-running the parent.
      expect(callsBeforeFocus).toBe(1);
      expect(callsAfterFocus).toBe(2);
    });
  });
});
