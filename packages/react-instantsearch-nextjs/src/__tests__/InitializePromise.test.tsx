/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { render, act } from '@testing-library/react';
import * as utils from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React from 'react';
import { SearchBox, TrendingItems } from 'react-instantsearch';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
} from 'react-instantsearch-core';

import { InitializePromise } from '../InitializePromise';
import { TriggerSearch } from '../TriggerSearch';

import type { PromiseWithState } from 'react-instantsearch-core';

jest.mock('instantsearch.js/es/lib/utils', () => ({
  ...jest.requireActual('instantsearch.js/es/lib/utils'),
  resetWidgetId: jest.fn(),
}));

const renderComponent = async ({
  children,
  ref = { current: null },
  nonce,
  insertedHTML,
  client = ccreateSearchClient({
    getRecommendations: jest.fn().mockResolvedValue({
      results: [createSingleSearchResponse()],
    }),
  }),
}: {
  children?: React.ReactNode;
  ref?: { current: PromiseWithState<void> | null };
  nonce?: string;
  insertedHTML?: jest.Mock;
  client?: ReturnType<typeof createSearchClient>;
} = {}) => {
  await act(() =>
    render(
      <InstantSearchRSCContext.Provider
        value={{
          waitForResultsRef: ref,
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

test('it errors if search fails', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createSearchClient({
    search: jest.fn().mockRejectedValue(new Error('search failed')),
  });

  renderComponent({
    ref,
    children: (
      <>
        <SearchBox />
      </>
    ),
    client,
  });

  await act(async () => {
    try {
      await ref.current;
    } catch {
      // prevent jest from failing the test
    }
  });

  await expect(ref.current).rejects.toEqual(new Error('search failed'));
});

test('it errors if recommend fails', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createSearchClient({
    getRecommendations: jest
      .fn()
      .mockRejectedValue(new Error('recommend failed')),
  });

  renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
      </>
    ),
    client,
  });

  await act(async () => {
    try {
      await ref.current;
    } catch {
      // prevent jest from failing the test
    }
  });

  await expect(ref.current).rejects.toEqual(new Error('recommend failed'));
});

test('it errors if both search and recommend fail', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createSearchClient({
    search: jest.fn().mockRejectedValue(new Error('search failed')),
    getRecommendations: jest
      .fn()
      .mockRejectedValue(new Error('recommend failed')),
  });

  renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
        <SearchBox />
      </>
    ),
    client,
  });

  await act(async () => {
    try {
      await ref.current;
    } catch {
      // prevent jest from failing the test
    }
  });

  // There's only one rejection, search comes first
  await expect(ref.current).rejects.toEqual(new Error('search failed'));
});

test('it does not error if only search fails, but recommendations passes', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createSearchClient({
    search: jest.fn().mockRejectedValue(new Error('search failed')),
    getRecommendations: jest.fn().mockResolvedValue({
      results: [createSingleSearchResponse()],
    }),
  });

  renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
        <SearchBox />
      </>
    ),
    client,
  });

  await act(async () => {
    try {
      await ref.current;
    } catch {
      // prevent jest from failing the test
    }
  });

  expect(ref.current!.status).toBe('fulfilled');
});

test('it does not error if only recommendations fails, but search passes', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createSearchClient({
    search: jest.fn().mockResolvedValue({
      results: [createSingleSearchResponse()],
    }),
    getRecommendations: jest
      .fn()
      .mockRejectedValue(new Error('recommend failed')),
  });

  renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
        <SearchBox />
      </>
    ),
    client,
  });

  await act(async () => {
    try {
      await ref.current;
    } catch {
      // prevent jest from failing the test
    }
  });

  expect(ref.current!.status).toBe('fulfilled');
});

afterAll(() => {
  jest.resetAllMocks();
});
