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
import * as ReactInstantSearchCore from 'react-instantsearch-core';
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

jest.mock('react-instantsearch-core', () => {
  const actual = jest.requireActual('react-instantsearch-core');

  return {
    ...actual,
    __internal_createServerSearchExecution: jest.fn(
      actual.__internal_createServerSearchExecution
    ),
  };
});

const renderComponent = async ({
  children,
  ref = { current: null },
  nonce,
  insertedHTML,
}: {
  children?: React.ReactNode;
  ref?: { current: PromiseWithState<void> | null };
  nonce?: string;
  insertedHTML?: jest.Mock;
} = {}) => {
  const client = createSearchClient({
    getRecommendations: jest.fn().mockResolvedValue({
      results: [createSingleSearchResponse()],
    }),
  });

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

test('it prepares a second pass for two-pass widgets', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };
  const insertedHTML = jest.fn();
  const execution = {
    resetWidgetIds: jest.fn(),
    prepare: jest
      .fn()
      .mockResolvedValueOnce([{ query: 'first-pass' }])
      .mockResolvedValueOnce([{ query: 'second-pass' }]),
    trigger: jest.fn(),
    hasSearchOrRecommendWidgets: jest.fn(() => true),
    hasTwoPassWidgets: jest.fn(() => true),
    resetScheduleSearch: jest.fn(),
    getInitialResults: jest.fn(() => ({})),
  };
  const createServerSearchExecution =
    ReactInstantSearchCore.__internal_createServerSearchExecution as jest.Mock;
  const originalImplementation =
    createServerSearchExecution.getMockImplementation();
  createServerSearchExecution.mockReturnValue(execution);

  try {
    await renderComponent({
      ref,
      children: <SearchBox />,
      insertedHTML,
    });

    if (ref.current?.status === 'pending') {
      await act(async () => {
        await ref.current;
      });
    }

    expect(execution.prepare).toHaveBeenCalledTimes(2);
    expect(execution.resetScheduleSearch).toHaveBeenCalledTimes(1);
    expect(execution.getInitialResults).toHaveBeenCalledWith([
      { query: 'second-pass' },
    ]);
    expect(insertedHTML).toHaveBeenCalledTimes(1);
  } finally {
    createServerSearchExecution.mockImplementation(originalImplementation);
  }
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

afterAll(() => {
  jest.resetAllMocks();
});
