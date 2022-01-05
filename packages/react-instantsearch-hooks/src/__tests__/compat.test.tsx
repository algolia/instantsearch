import { render } from '@testing-library/react';
import React from 'react';
import { InstantSearch as InstantSearchCore } from 'react-instantsearch-core';

import { createSearchClient } from '../../../../test/mock';
import { useSearchBox } from '../useSearchBox';
import { noop } from '../utils';

function SearchBox() {
  useSearchBox({});

  return null;
}

describe('Compat', () => {
  test('throws when using hooks with React InstantSearch Core Provider', () => {
    // Hide the errors from the test logs.
    jest.spyOn(console, 'error').mockImplementation(noop);

    const searchClient = createSearchClient();

    expect(() => {
      render(
        <InstantSearchCore indexName="indexName" searchClient={searchClient}>
          <SearchBox />
        </InstantSearchCore>
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "Hooks must be used inside the <InstantSearch> component.

      They are not compatible with the \`react-instantsearch-core\` and \`react-instantsearch-dom\` packages, so make sure to use the <InstantSearch> component from \`react-instantsearch-hooks\`."
    `);

    jest.spyOn(console, 'error').mockRestore();
  });
});
