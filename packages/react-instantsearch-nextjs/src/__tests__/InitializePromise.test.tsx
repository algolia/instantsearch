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
  useInstantSearchContext,
} from 'react-instantsearch-core';

import { InitializePromise } from '../InitializePromise';
import { TriggerSearch } from '../TriggerSearch';

import type { PromiseWithState } from 'react-instantsearch-core';

/**
 * Seeds `search._initialChatStates` during render — before the async search
 * result fires — mimicking what the chat-page-suggestions connector does on
 * the server, so `InitializePromise` has a value to inject at hydration time.
 */
function SeedChatStates({ value }: { value: Record<string, unknown> }) {
  const search = useInstantSearchContext() as ReturnType<
    typeof useInstantSearchContext
  > & { _initialChatStates?: Record<string, unknown> | null };
  search._initialChatStates = value;
  return null;
}

jest.mock('instantsearch.js/es/lib/utils', () => ({
  ...jest.requireActual('instantsearch.js/es/lib/utils'),
  resetWidgetId: jest.fn(),
}));

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

test('it injects only the results script when no chat states are present', async () => {
  const insertedHTML = jest.fn();
  await renderComponent({ children: <SearchBox />, insertedHTML });

  const element = insertedHTML.mock.calls.at(-1)![0] as React.ReactElement<any>;
  expect(element.type).toBe('script');
  expect(element.props.dangerouslySetInnerHTML.__html).not.toContain(
    'InstantSearchInitialChatStates'
  );
});

test('it injects the chat states registered during SSR', async () => {
  const insertedHTML = jest.fn();
  await renderComponent({
    children: (
      <>
        <SearchBox />
        <SeedChatStates
          value={{ 'chat-page-suggestions': { suggestions: ['A'] } }}
        />
      </>
    ),
    insertedHTML,
  });

  const element = insertedHTML.mock.calls.at(-1)![0] as React.ReactElement<any>;
  expect(element.type).toBe(React.Fragment);

  const children = React.Children.toArray(
    element.props.children
  ) as Array<React.ReactElement<any>>;
  expect(children).toHaveLength(2);
  expect(children[1].props.dangerouslySetInnerHTML.__html).toContain(
    'InstantSearchInitialChatStates'
  );
  expect(children[1].props.dangerouslySetInnerHTML.__html).toContain(
    'suggestions'
  );
});

afterAll(() => {
  jest.resetAllMocks();
});
