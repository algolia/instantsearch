/** @jest-environment jsdom */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render } from '@testing-library/react';
import React, { StrictMode } from 'react';

import { InstantSearch, useSearchBox } from '..';

function SearchBox() {
  useSearchBox();
  return null;
}
describe('mounting/unmounting', () => {
  it('should search once when multiple widgets are removed', async () => {
    const searchClient = createSearchClient();

    function App({ children }: { children?: React.ReactNode }) {
      return (
        <StrictMode>
          <InstantSearch indexName="instant_search" searchClient={searchClient}>
            {children}
          </InstantSearch>
        </StrictMode>
      );
    }

    const { rerender } = render(
      <App>
        <SearchBox />
        <SearchBox />
        <SearchBox />
        <SearchBox />
      </App>
    );

    await act(async () => {
      await wait(0);
    });

    expect(searchClient.search).toHaveBeenCalledTimes(1);

    rerender(<App />);

    await act(async () => {
      await wait(0);
      await wait(0);
    });

    // if the timing is wrong, the search will be called once for every removed widget
    // except the final one (as there's no search if there are no widgets)
    expect(searchClient.search).toHaveBeenCalledTimes(2);
  });
});
