/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import { InstantSearch as InstantSearchCore } from 'react-instantsearch-core';

import { createSearchClient } from '../../../../tests/mock';
import { useSearchBox } from '../connectors/useSearchBox';
import { noop } from '../lib/noop';

function SearchBox() {
  useSearchBox({});

  return null;
}

describe('Compat', () => {
  test('throws when using hooks with React InstantSearch Core Provider', () => {
    // Hide the errors from the test logs.
    jest.spyOn(console, 'error').mockImplementation(noop);

    const searchClient = createSearchClient({});

    expect(() => {
      render(
        <InstantSearchCore indexName="indexName" searchClient={searchClient}>
          <SearchBox />
        </InstantSearchCore>
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "[InstantSearch] Hooks must be used inside the <InstantSearch> component.

      They are not compatible with the \`react-instantsearch-core\` and \`react-instantsearch-dom\` packages, so make sure to use the <InstantSearch> component from \`react-instantsearch-hooks\`."
    `);

    jest.spyOn(console, 'error').mockRestore();
  });
});
