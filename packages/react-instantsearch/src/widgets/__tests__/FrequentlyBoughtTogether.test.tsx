/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

import type { SearchClient } from 'instantsearch.js';

describe('FrequentlyBoughtTogether', () => {
  test('renders with translations', async () => {
    const client = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <FrequentlyBoughtTogether
          objectIDs={['1']}
          translations={{ title: 'My FBT' }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-FrequentlyBoughtTogether'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            My FBT
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "objectID": "2"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <FrequentlyBoughtTogether
          objectIDs={['1']}
          className="MyFrequentlyBoughtTogether"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyFrequentlyBoughtTogether', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
            });
          })
        )
      )
    ) as SearchClient['getRecommendations'],
  });
}
