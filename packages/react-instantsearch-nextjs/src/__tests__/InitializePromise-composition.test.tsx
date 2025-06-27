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
  const client = createCompositionClient();

  await act(() =>
    render(
      <InstantSearchRSCContext.Provider
        value={{ waitForResultsRef: ref, countRef: { current: 0 } }}
      >
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
    )
  );

  return client;
};

test('it waits for composition-based search', async () => {
  const ref: { current: PromiseWithState<void> | null } = { current: null };

  const client = await renderComponent({
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

afterAll(() => {
  jest.resetAllMocks();
});
