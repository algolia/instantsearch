/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render } from '@testing-library/react';
import React from 'react';
import { SearchBox } from 'react-instantsearch';

import { InstantSearchNext } from '../InstantSearchNext';

import type { InitialResults } from 'instantsearch.js';

const InstantSearchInitialResults = Symbol.for('InstantSearchInitialResults');
declare global {
  interface Window {
    [InstantSearchInitialResults]?: InitialResults;
  }
}

const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname() {
    return mockPathname();
  },
}));

describe('rerendering', () => {
  const client = createSearchClient();

  function Component() {
    return (
      <InstantSearchNext searchClient={client} indexName="indexName">
        <SearchBox />
      </InstantSearchNext>
    );
  }

  beforeEach(() => {
    (client.search as jest.Mock).mockClear();

    // Simulate initialResults injection
    window[InstantSearchInitialResults] = {};
  });

  it('does not trigger a client-side search by default', async () => {
    const { rerender } = render(<Component />);

    await act(async () => {
      await wait(0);
    });

    rerender(<Component />);

    await act(async () => {
      await wait(0);
    });

    expect(client.search).toHaveBeenCalledTimes(0);
  });
});

afterAll(() => {
  jest.resetAllMocks();
});
