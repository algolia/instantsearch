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

import { LookingSimilar } from '../LookingSimilar';

import type { SearchClient } from 'instantsearch.js';

describe('LookingSimilar', () => {
  test('renders with translations', async () => {
    const client = createMockedSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <LookingSimilar objectIDs={['1']} translations={{ title: 'My FBT' }} />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-LookingSimilar'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-LookingSimilar"
        >
          <h3
            class="ais-LookingSimilar-title"
          >
            My FBT
          </h3>
          <div
            class="ais-LookingSimilar-container"
          >
            <ol
              class="ais-LookingSimilar-list"
            >
              <li
                class="ais-LookingSimilar-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-LookingSimilar-item"
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
        <LookingSimilar
          objectIDs={['1']}
          className="MyLookingSimilar"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyLookingSimilar', 'ROOT');
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
