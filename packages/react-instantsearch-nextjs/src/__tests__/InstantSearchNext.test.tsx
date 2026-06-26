/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
  delete window[InstantSearchInitialResults];
});

describe('rerendering', () => {
  beforeEach(() => {
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

describe('SPA navigation hydration', () => {
  it('fires a client-side search when no initialResults are injected', async () => {
    // App Router client-side navigation: the inline <script> that sets
    // window[InstantSearchInitialResults] is part of the SSR HTML and does
    // not run when the destination route is reached via <Link>.
    render(<Component />);

    await act(async () => {
      await wait(0);
    });

    expect(client.search).toHaveBeenCalled();
  });

  it('does not reuse a previous mount\'s initialResults', async () => {
    window[InstantSearchInitialResults] = {};
    const { unmount } = render(<Component />);

    await act(async () => {
      await wait(0);
    });

    expect(window[InstantSearchInitialResults]).toBeUndefined();
    unmount();

    (client.search as jest.Mock).mockClear();
    render(<Component />);

    await act(async () => {
      await wait(0);
    });

    expect(client.search).toHaveBeenCalled();
  });
});

afterAll(() => {
  jest.resetAllMocks();
});
