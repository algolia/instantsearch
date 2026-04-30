/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createCompositionClient, createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
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
});
