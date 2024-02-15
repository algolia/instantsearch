/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Hits } from '../Hits';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { AlgoliaHit } from 'instantsearch.js';

describe('Hits', () => {
  test('renders with a custom hit component', async () => {
    type CustomRecord = {
      somethingSpecial: string;
    };

    const searchClient = createSearchClient({
      search: jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(
              (request: Parameters<MockSearchClient['search']>[0][number]) =>
                createSingleSearchResponse<AlgoliaHit<CustomRecord>>({
                  hits: [
                    { objectID: '1', somethingSpecial: 'a' },
                    { objectID: '2', somethingSpecial: 'b' },
                    { objectID: '3', somethingSpecial: 'c' },
                  ],
                  index: request.indexName,
                })
            )
          )
        )
      ) as MockSearchClient['search'],
    });

    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <Hits<CustomRecord>
          hitComponent={({ hit }) => (
            <strong>{`${hit.__position} - ${hit.somethingSpecial}`}</strong>
          )}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('strong')).toHaveLength(3);
      expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
        <div
          class="ais-Hits"
        >
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              <strong>
                1 - a
              </strong>
            </li>
            <li
              class="ais-Hits-item"
            >
              <strong>
                2 - b
              </strong>
            </li>
            <li
              class="ais-Hits-item"
            >
              <strong>
                3 - c
              </strong>
            </li>
          </ol>
        </div>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Hits
          className="MyHits"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHits', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});
