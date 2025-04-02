/**
 * @jest-environment jsdom
 */

import { createCompositionClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React from 'react';
import { SearchBox } from 'react-instantsearch';
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

const compositionID = 'my-composition';

const renderComponent = ({
  children,
  ref = { current: null },
  nonce,
  insertedHTML,
  client = createCompositionClient(),
}: {
  children?: React.ReactNode;
  ref?: { current: PromiseWithState<void> | null };
  nonce?: string;
  insertedHTML?: jest.Mock;
  client?: ReturnType<typeof createCompositionClient>;
} = {}) => {
  render(
    <InstantSearchRSCContext.Provider value={ref}>
      <InstantSearchSSRProvider>
        <InstantSearch searchClient={client} compositionID={compositionID}>
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

test('it waits for composition-based search', async () => {
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
  expect(client.search).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ compositionID })
  );
});

test('it errors when search errors', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = createCompositionClient({
    search: jest.fn().mockRejectedValue(new Error('composition failed')),
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

  await expect(ref.current).rejects.toEqual(new Error('composition failed'));
});

afterAll(() => {
  jest.resetAllMocks();
});
