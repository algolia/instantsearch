/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render } from '@testing-library/react';
import React, { StrictMode } from 'react';

import { InstantSearch } from '..';

describe('insights', () => {
  test('automatically loads the Insights client in `StrictMode`', () => {
    const searchClient = createSearchClient();

    render(
      <StrictMode>
        <InstantSearch searchClient={searchClient} indexName="123" />
      </StrictMode>
    );

    // Sets the global
    expect((window as any).aa).toEqual(expect.any(Function));
    // Injects the script
    expect(document.body).toMatchInlineSnapshot(`
      <body>
        <div />
        <script
          src="https://cdn.jsdelivr.net/npm/search-insights@2.4.0/dist/search-insights.min.js"
        />
      </body>
    `);
  });
});
