/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { render, act } from '@testing-library/react';
import connectAutocomplete from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
import * as utils from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React from 'react';
import {
  Configure,
  EXPERIMENTAL_Autocomplete,
  SearchBox,
  TrendingItems,
} from 'react-instantsearch';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
  useConnector,
} from 'react-instantsearch-core';

import { InitializePromise } from '../InitializePromise';
import { TriggerSearch } from '../TriggerSearch';

import type { PromiseWithState } from 'react-instantsearch-core';

jest.mock('instantsearch.js/es/lib/utils', () => ({
  ...jest.requireActual('instantsearch.js/es/lib/utils'),
  resetWidgetId: jest.fn(),
}));

function AutocompleteWithoutSearch() {
  useConnector(connectAutocomplete, { requiresSearch: false });

  return null;
}

function RequestFreeAutocomplete() {
  return (
    <EXPERIMENTAL_Autocomplete
      autoFocus
      requiresSearch={false}
      searchParameters={{ hitsPerPage: 3 }}
      indices={[
        {
          indexName: 'suggestions',
          itemComponent: ({ item }) => <>{item.objectID}</>,
        },
      ]}
    />
  );
}

const renderComponent = async ({
  children,
  ref = { current: null },
  nonce,
  insertedHTML,
  searchClient,
}: {
  children?: React.ReactNode;
  ref?: { current: PromiseWithState<void> | null };
  nonce?: string;
  insertedHTML?: jest.Mock;
  searchClient?: ReturnType<typeof createSearchClient>;
} = {}) => {
  const client =
    searchClient ||
    createSearchClient({
      getRecommendations: jest.fn().mockResolvedValue({
        results: [createSingleSearchResponse()],
      }),
    });

  await act(() =>
    render(
      <InstantSearchRSCContext.Provider
        value={{
          waitForResultsRef: ref,
          resolveWaitForResultsRef: { current: null },
          countRef: { current: 0 },
          ignoreMultipleHooksWarning: false,
        }}
      >
        <InstantSearchSSRProvider>
          <InstantSearch searchClient={client} indexName="indexName">
            <ServerInsertedHTMLContext.Provider
              value={(cb) => insertedHTML?.(cb())}
            >
              <InitializePromise nonce={nonce} />
              {children}
              <TriggerSearch />
            </ServerInsertedHTMLContext.Provider>
          </InstantSearch>
        </InstantSearchSSRProvider>
      </InstantSearchRSCContext.Provider>
    )
  );

  await ref.current;

  return client;
};

test('it calls resetWidgetId', () => {
  renderComponent();

  expect(utils.resetWidgetId).toHaveBeenCalledTimes(1);
});

test('it applies provided nonce on the injected script tag', async () => {
  const insertedHTML = jest.fn();
  await renderComponent({
    children: <SearchBox />,
    nonce: 'csp-nonce',
    insertedHTML,
  });

  expect(insertedHTML).toHaveBeenLastCalledWith(
    expect.objectContaining({
      props: expect.objectContaining({
        nonce: 'csp-nonce',
      }),
    })
  );
});

test('it waits for both search and recommend results', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = await renderComponent({
    ref,
    children: (
      <>
        <SearchBox />
        <TrendingItems />
      </>
    ),
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).toHaveBeenCalledTimes(1);
  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});

test('it waits for search only if there are only search widgets', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = await renderComponent({
    ref,
    children: (
      <>
        <SearchBox />
      </>
    ),
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).toHaveBeenCalledTimes(1);
  expect(client.search).toHaveBeenNthCalledWith(1, [
    expect.objectContaining({ indexName: 'indexName' }),
  ]);
  expect(client.getRecommendations).not.toHaveBeenCalled();
});

test('it searches when an opt-out widget precedes a search widget', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = await renderComponent({
    ref,
    children: (
      <>
        <AutocompleteWithoutSearch />
        <SearchBox />
      </>
    ),
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).toHaveBeenCalledTimes(1);
});

test('it waits for recommend only if there are only recommend widgets', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = await renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
      </>
    ),
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).not.toHaveBeenCalled();
  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});

test('it resolves without a request when no widget requires a search', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };
  const insertedHTML = jest.fn();

  const client = await renderComponent({
    ref,
    insertedHTML,
    children: <AutocompleteWithoutSearch />,
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).not.toHaveBeenCalled();
  expect(client.getRecommendations).not.toHaveBeenCalled();
  expect(insertedHTML).toHaveBeenCalledTimes(1);
  expect(
    insertedHTML.mock.calls[0][0].props.dangerouslySetInnerHTML.__html
  ).toContain(' = {}');
});

test('it inserts empty SSR state when only an isolated autocomplete searches', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };
  const insertedHTML = jest.fn();

  const client = await renderComponent({
    ref,
    insertedHTML,
    children: <RequestFreeAutocomplete />,
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).toHaveBeenCalledWith([
    expect.objectContaining({ indexName: 'suggestions' }),
  ]);
  expect(client.search).not.toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ indexName: 'indexName' }),
    ])
  );
  expect(insertedHTML).toHaveBeenCalledTimes(1);
  expect(
    insertedHTML.mock.calls[0][0].props.dangerouslySetInnerHTML.__html
  ).toBe('window[Symbol.for("InstantSearchInitialResults")] = {}');
});

test('it serializes main request parameters when isolated autocomplete also searches', async () => {
  const insertedHTML = jest.fn();

  await renderComponent({
    insertedHTML,
    children: (
      <>
        <RequestFreeAutocomplete />
        <SearchBox />
        <Configure hitsPerPage={7} />
      </>
    ),
  });

  const html =
    insertedHTML.mock.calls[0][0].props.dangerouslySetInnerHTML.__html;
  expect(html).toContain('"hitsPerPage":7');
  expect(html).not.toContain('"hitsPerPage":3');
});

afterAll(() => {
  jest.resetAllMocks();
});
