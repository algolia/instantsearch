import { render, waitFor } from '@testing-library/react';
import React from 'react';

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
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
          class="ais-Hits"
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

  test('renders with custom className', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <Hits className="custom" />
      </InstantSearchHooksTestWrapper>
    );

    expect(container.querySelector('.ais-Hits')!.className).toBe(
      'ais-Hits custom'
    );
  });

  test('accepts custom class names', async () => {
    const client = createSearchClient({
      search: (requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map((request) =>
              createSingleSearchResponse({
                hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
                index: request.indexName,
              })
            )
          )
        ),
    });

    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Hits
          className="MyHits"
          classNames={{
            root: 'ROOT',
            list: 'LIST',
            item: 'ITEM',
          }}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Hits ROOT MyHits"
        >
          <ol
            class="ais-Hits-list LIST"
          >
            <li
              class="ais-Hits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-Hits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","__position":2}
                …
              </div>
            </li>
            <li
              class="ais-Hits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"3","__position":3}
                …
              </div>
            </li>
          </ol>
        </div>
      </div>
    `);
  });

  test('renders with custom div props', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <Hits hidden={true} />
      </InstantSearchHooksTestWrapper>
    );

    expect(container.querySelector<HTMLDivElement>('.ais-Hits')!.hidden).toBe(
      true
    );
  });
});
