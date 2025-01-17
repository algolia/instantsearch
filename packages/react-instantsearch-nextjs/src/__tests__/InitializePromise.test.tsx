/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import { addWidgetId } from 'instantsearch-core';
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

import type { Widget } from 'instantsearch-core';
import type { PromiseWithState } from 'react-instantsearch-core';

const renderComponent = ({
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

  render(
    <InstantSearchRSCContext.Provider value={ref}>
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
  );

  return client;
};

test('resets the widgetId', () => {
  const widget = { dependsOn: 'recommend' } as Widget;

  // increments correctly
  addWidgetId(widget);
  expect(widget.$$id).toBe(0);
  addWidgetId(widget);
  expect(widget.$$id).toBe(1);

  renderComponent();

  // starts back from 0
  addWidgetId(widget);
  expect(widget.$$id).toBe(0);
  addWidgetId(widget);
  expect(widget.$$id).toBe(1);
});

test('it applies provided nonce on the injected script tag', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };
  const insertedHTML = jest.fn();
  renderComponent({
    ref,
    children: <SearchBox />,
    nonce: 'csp-nonce',
    insertedHTML,
  });

  await act(async () => {
    await ref.current;
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

  const client = renderComponent({
    ref,
    children: (
      <>
        <SearchBox />
        <TrendingItems />
      </>
    ),
  });

  await act(async () => {
    await ref.current;
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).toHaveBeenCalledTimes(1);
  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});

test('it waits for search only if there are only search widgets', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = renderComponent({
    ref,
    children: (
      <>
        <SearchBox />
      </>
    ),
  });

  await act(async () => {
    await ref.current;
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

  const client = renderComponent({
    ref,
    children: (
      <>
        <TrendingItems />
      </>
    ),
  });

  await act(async () => {
    await ref.current;
  });

  expect(ref.current!.status).toBe('fulfilled');
  expect(client.search).not.toHaveBeenCalled();
  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});

afterAll(() => {
  jest.resetAllMocks();
});
