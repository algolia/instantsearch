/**
 * @jest-environment node
 */

import { createSearchClient } from '@instantsearch/mocks';
import React from 'react';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  Index,
  useHits,
  useRefinementList,
  useSearchBox,
} from 'react-instantsearch-hooks';

import type {
  InstantSearchServerState,
  InstantSearchProps,
  UseRefinementListProps,
} from 'react-instantsearch-hooks';

type CreateTestEnvironmentProps = {
  searchClient: InstantSearchProps['searchClient'];
  initialUiState?: InstantSearchProps['initialUiState'];
};

function createTestEnvironment({
  searchClient,
  initialUiState = {
    instant_search: {
      query: 'iphone',
      refinementList: {
        brand: ['Apple'],
      },
    },
    instant_search_price_asc: {
      query: 'iphone',
      refinementList: {
        brand: ['Apple'],
      },
    },
  },
}: CreateTestEnvironmentProps) {
  function Search({ children }: { children?: React.ReactNode }) {
    return (
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        initialUiState={initialUiState}
      >
        {children}
        <RefinementList attribute="brand" />
        <SearchBox />
        <Hits />

        <Index indexName="instant_search_price_asc">
          <Hits />

          <Index indexName="instant_search_rating_desc">
            <Hits />
          </Index>
        </Index>

        <Index indexName="instant_search_price_desc">
          <Hits />
        </Index>
      </InstantSearch>
    );
  }

  function App({
    serverState,
    children,
  }: {
    serverState?: InstantSearchServerState;
    children?: React.ReactNode;
  }) {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <Search>{children}</Search>
      </InstantSearchSSRProvider>
    );
  }

  return {
    App,
  };
}

// Only the module without extension exists
jest.mock(
  'react-dom/server.js',
  () => {
    throw new Error('simulate the module not existing');
  },
  { virtual: true }
);

jest.mock(
  'react-dom/server',
  () => {
    return jest.requireActual('react-dom/server');
  },
  { virtual: true }
);

// We are ensuring this line gets imported _after_ the mocks
// eslint-disable-next-line import/order
import { getServerState } from '../getServerState';

describe('ReactDOMServer imports', () => {
  test('works when the import with no extension exists', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const searchClient = createSearchClient({});
    const { App } = createTestEnvironment({ searchClient });

    const serverState = await getServerState(<App />);

    expect(serverState.initialResults).toEqual(expect.any(Object));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenLastCalledWith(
      '[InstantSearch] `renderToString` should be passed to getServerState(<App/>, { renderToString })'
    );
  });
});

function SearchBox() {
  useSearchBox();
  return null;
}

function Hits() {
  useHits();
  return null;
}

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}
