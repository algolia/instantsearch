import { render, waitFor } from '@testing-library/react';
import React from 'react';

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper } from '../../../../../test/utils';
import { Hits } from '../Hits';

describe('Hits', () => {
  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <Hits />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-Hits')).toMatchInlineSnapshot(`
        <div
          class="ais-Hits ais-Hits--empty"
        >
          <ol
            class="ais-Hits-list"
          />
        </div>
      `);
    });
  });

  test('renders with a non-default hit shape', async () => {
    type CustomHit = {
      somethingSpecial: string;
    };

    const client = createSearchClient({
      search: (requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map((request) =>
              createSingleSearchResponse<CustomHit>({
                hits: [
                  { objectID: '1', somethingSpecial: 'a' },
                  { objectID: '2', somethingSpecial: 'b' },
                  { objectID: '3', somethingSpecial: 'c' },
                ],
                index: request.indexName,
              })
            )
          )
        ),
    });

    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Hits<CustomHit>
          hitComponent={({ hit }) => (
            <strong>{`${hit.__position} - ${hit.somethingSpecial}`}</strong>
          )}
        />
      </InstantSearchHooksTestWrapper>
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
      <InstantSearchHooksTestWrapper>
        <Hits
          className="MyHits"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHits', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});
