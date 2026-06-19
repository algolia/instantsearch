/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createCompositionClient,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { InstantSearchSSRProvider } from 'react-instantsearch-core';
import { wait } from '@instantsearch/testutils/wait';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { EXPERIMENTAL_Autocomplete } from '../Autocomplete';

const noop = () => {};

describe('EXPERIMENTAL_Autocomplete', () => {
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
  });

  describe('feeds-mode guards', () => {
    test('throws when both `feeds` and `indices` are provided', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(noop);

      const compositionClient = createCompositionClient();

      expect(() => {
        render(
          <InstantSearchTestWrapper
            searchClient={compositionClient}
            compositionID="my-comp"
            indexName={undefined as unknown as string}
          >
            <EXPERIMENTAL_Autocomplete
              feeds={[
                {
                  feedID: 'products',
                  itemComponent: ({ item }) =>
                    React.createElement('div', null, String(item.objectID)),
                },
              ]}
              indices={[] as never}
            />
          </InstantSearchTestWrapper>
        );
      }).toThrow(/mutually exclusive/);

      consoleError.mockRestore();
    });

    test('throws in feeds-mode when outer InstantSearch has no compositionID', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(noop);

      const searchClient = createSearchClient({});

      expect(() => {
        render(
          <InstantSearchTestWrapper searchClient={searchClient}>
            <EXPERIMENTAL_Autocomplete
              feeds={[
                {
                  feedID: 'products',
                  itemComponent: ({ item }) =>
                    React.createElement('div', null, String(item.objectID)),
                },
              ]}
            />
          </InstantSearchTestWrapper>
        );
      }).toThrow(/composition-based/);

      consoleError.mockRestore();
    });

    test('does not throw in indices-mode when outer InstantSearch has no compositionID', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(noop);

      const searchClient = createSearchClient({});

      expect(() => {
        render(
          <InstantSearchTestWrapper searchClient={searchClient}>
            <EXPERIMENTAL_Autocomplete
              indices={[
                {
                  indexName: 'my-index',
                  itemComponent: ({ item }) =>
                    React.createElement('div', null, String(item.objectID)),
                },
              ]}
            />
          </InstantSearchTestWrapper>
        );
      }).not.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('lazy activation', () => {
    test('does not search on mount in indices-mode', async () => {
      const searchClient = createSearchClient({});

      render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
        >
          <EXPERIMENTAL_Autocomplete
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const requestedIndices = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .map((request) => request.indexName);
      expect(requestedIndices).not.toContain('my-index');
    });

    test('searches the autocomplete index on first focus in indices-mode', async () => {
      const searchClient = createSearchClient({});

      const { container } = render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
        >
          <EXPERIMENTAL_Autocomplete
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const input = container.querySelector('input[type="search"]')!;
      await act(async () => {
        fireEvent.focus(input);
        await wait(0);
      });

      const requestedIndices = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .map((request) => request.indexName);
      expect(requestedIndices).toContain('my-index');
    });

    test('propagates the initial query from the parent on first focus', async () => {
      const searchClient = createSearchClient({});

      const { container } = render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
          initialUiState={{
            indexName: { query: 'macbook' },
          }}
        >
          <EXPERIMENTAL_Autocomplete
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const input = container.querySelector('input[type="search"]')!;
      await act(async () => {
        fireEvent.focus(input);
        await wait(0);
      });

      const autocompleteRequests = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap(
          (call) =>
            call[0] as Array<{
              indexName: string;
              params: { query?: string };
            }>
        )
        .filter((request) => request.indexName === 'my-index');

      expect(autocompleteRequests).toHaveLength(1);
      expect(autocompleteRequests[0].params.query).toBe('macbook');
    });

    test('pre-activation shell input reflects the parent query', async () => {
      const searchClient = createSearchClient({});

      const { container } = render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
          initialUiState={{
            indexName: { query: 'macbook' },
          }}
        >
          <EXPERIMENTAL_Autocomplete
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      )!;
      expect(input.value).toBe('macbook');
    });

    test('autocomplete child does not inherit SSR results from same-named parent index', async () => {
      // Never-resolving search lets us observe the panel before the
      // autocomplete's own request comes back.
      const searchClient = {
        search: jest.fn(() => new Promise(() => {})),
      };

      const initialResults = {
        instant_search: {
          state: {
            index: 'instant_search',
            query: '',
            hitsPerPage: 8,
          },
          results: [
            createSingleSearchResponse({
              index: 'instant_search',
              hits: [{ objectID: 'parent-hit', name: 'Parent SSR Hit' }],
            }),
          ],
        },
      } as Parameters<typeof InstantSearchSSRProvider>[0]['initialResults'];

      const { container } = render(
        <InstantSearchSSRProvider initialResults={initialResults}>
          <InstantSearchTestWrapper
            searchClient={searchClient as never}
            indexName="instant_search"
          >
            <EXPERIMENTAL_Autocomplete
              indices={[
                {
                  indexName: 'instant_search',
                  itemComponent: ({ item }) =>
                    React.createElement(
                      'div',
                      { 'data-testid': 'ac-item' },
                      String((item as { name: string }).name)
                    ),
                },
              ]}
            />
          </InstantSearchTestWrapper>
        </InstantSearchSSRProvider>
      );

      await act(async () => {
        await wait(0);
      });

      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      )!;
      await act(async () => {
        fireEvent.focus(input);
        await wait(0);
      });

      const renderedItems = container.querySelectorAll(
        '[data-testid="ac-item"]'
      );
      expect(renderedItems).toHaveLength(0);
    });

    test('eager-activates when autoFocus is set', async () => {
      const searchClient = createSearchClient({});

      render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
        >
          <EXPERIMENTAL_Autocomplete
            autoFocus
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const requestedIndices = (
        searchClient.search as jest.Mock
      ).mock.calls
        .flatMap((call) => call[0] as Array<{ indexName: string }>)
        .map((request) => request.indexName);
      expect(requestedIndices).toContain('my-index');
    });

    test('keeps the input id stable across the shell→real transition', async () => {
      const searchClient = createSearchClient({});

      const { container } = render(
        <InstantSearchTestWrapper
          searchClient={searchClient}
          indexName="indexName"
        >
          <EXPERIMENTAL_Autocomplete
            indices={[
              {
                indexName: 'my-index',
                itemComponent: ({ item }) =>
                  React.createElement('div', null, String(item.objectID)),
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      const shellInputId = container.querySelector('input[type="search"]')!.id;

      const input = container.querySelector<HTMLInputElement>(
        'input[type="search"]'
      )!;
      await act(async () => {
        fireEvent.focus(input);
        await wait(0);
      });

      const realInputId = container.querySelector('input[type="search"]')!.id;

      expect(realInputId).toBe(shellInputId);
    });
  });
});
