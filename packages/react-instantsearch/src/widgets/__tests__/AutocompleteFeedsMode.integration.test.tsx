/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createCompositionClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Configure, InstantSearch } from 'react-instantsearch-core';

import { EXPERIMENTAL_Autocomplete } from '../Autocomplete';

describe('EXPERIMENTAL_Autocomplete feeds-mode (integration)', () => {
  beforeEach(() => {
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
    window.localStorage.clear();
  });

  test('mounts and renders the autocomplete form in feeds-mode', async () => {
    const searchClient = createCompositionClient({
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

    const { container } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <Configure hitsPerPage={8} />
        <EXPERIMENTAL_Autocomplete
          placeholder="Search"
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
            {
              feedID: 'articles',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
        />
      </InstantSearch>
    );

    // The form should render with the input
    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
  });

  test('renders one AutocompleteIndex section per declared feed (two feeds → two roots)', async () => {
    const searchClient = createCompositionClient({
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

    const { container } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String((item as any).title)),
            },
            {
              feedID: 'articles',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String((item as any).title)),
            },
          ]}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    const input = container.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    fireEvent.focus(input);

    await waitFor(() => {
      expect(container.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        2
      );
    });
    expect(
      container.querySelector('.ais-AutocompleteIndexList')
    ).not.toBeNull();
  });

  test('showQuerySuggestions.feedID uses the query-suggestions section (default item UI)', async () => {
    const searchClient = createCompositionClient({
      search: jest.fn(() =>
        Promise.resolve({
          results: [
            createSingleSearchResponse({
              feedID: 'products',
              hits: [{ objectID: 'p1', title: 'Product 1' }],
            } as any),
            createSingleSearchResponse({
              feedID: 'suggestions',
              hits: [{ objectID: 's1', query: 'iphone' }],
            } as any),
          ],
        })
      ),
    });

    const { container } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
          showQuerySuggestions={{ feedID: 'suggestions' }}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    fireEvent.focus(
      container.querySelector('input[type="search"]') as HTMLInputElement
    );

    await waitFor(() => {
      expect(
        container.querySelector('.ais-AutocompleteSuggestions')
      ).not.toBeNull();
    });
    expect(
      container.querySelector('.ais-AutocompleteSuggestionsItem')
    ).not.toBeNull();
  });

  test('showPromptSuggestions.feedID uses the prompt-suggestions section (default item UI)', async () => {
    const searchClient = createCompositionClient({
      search: jest.fn(() =>
        Promise.resolve({
          results: [
            createSingleSearchResponse({
              feedID: 'products',
              hits: [{ objectID: 'p1', title: 'Product 1' }],
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

    const { container, getByText } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
          showPromptSuggestions={{ feedID: 'prompts' }}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    fireEvent.focus(
      container.querySelector('input[type="search"]') as HTMLInputElement
    );

    await waitFor(() => {
      expect(
        container.querySelector('.ais-AutocompletePromptSuggestions')
      ).not.toBeNull();
    });
    expect(getByText('Ask about shoes')).not.toBeNull();
  });

  test('empty feed hits does not crash and hides empty panel (no index roots)', async () => {
    const searchClient = createCompositionClient({
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

    const { container } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    fireEvent.focus(
      container.querySelector('input[type="search"]') as HTMLInputElement
    );
    await waitFor(() => {
      expect(container.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        0
      );
    });
  });

  test('normalizes transformItems indices to feed IDs in feeds-mode', async () => {
    const transformItems = jest.fn((items) => items);
    const searchClient = createCompositionClient({
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

    render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <Configure hitsPerPage={8} />
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
          transformItems={transformItems}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(transformItems).toHaveBeenCalled();
    });

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

  test('does not render sections for declared feeds absent from response', async () => {
    const searchClient = createCompositionClient({
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

    const { container, queryByText } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String((item as any).title)),
            },
            {
              feedID: 'articles',
              headerComponent: () =>
                React.createElement('div', null, 'Articles'),
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    const input = container.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    fireEvent.focus(input);

    await waitFor(() => {
      expect(queryByText('Product 1')).not.toBeNull();
    });
    expect(queryByText('Articles')).toBeNull();
  });

  test('does not render sections for unknown feeds returned by the server', async () => {
    const searchClient = createCompositionClient({
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

    const { container, queryByText } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String((item as any).title)),
            },
          ]}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });
    const input = container.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    fireEvent.focus(input);

    await waitFor(() => {
      expect(queryByText('Product 1')).not.toBeNull();
    });
    expect(queryByText('Unknown 1')).toBeNull();
  });

  test('dedupes suggestions against recent searches in feeds-mode', async () => {
    window.localStorage.setItem(
      'autocomplete-recent-searches',
      JSON.stringify(['iphone'])
    );

    const searchClient = createCompositionClient({
      search: jest.fn(() =>
        Promise.resolve({
          results: [
            createSingleSearchResponse({
              feedID: 'products',
              hits: [{ objectID: 'p1', title: 'Product 1' }],
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

    const { container, getAllByText } = render(
      <InstantSearch searchClient={searchClient} compositionID="my-comp">
        <EXPERIMENTAL_Autocomplete
          feeds={[
            {
              feedID: 'products',
              itemComponent: ({ item }) =>
                React.createElement('div', null, String(item.objectID)),
            },
          ]}
          showRecent
          showQuerySuggestions={{ feedID: 'suggestions' }}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });

    const input = container.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    fireEvent.focus(input);

    await waitFor(() => {
      expect(getAllByText('iphone')).toHaveLength(1);
    });
  });
});
