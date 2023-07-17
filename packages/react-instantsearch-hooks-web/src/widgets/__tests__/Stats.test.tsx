/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Stats } from '../Stats';

function createMockedSearchClient({ nbSorted }: { nbSorted?: number } = {}) {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) =>
            createSingleSearchResponse({
              index: request.indexName,
              nbHits: 1000,
              appliedRelevancyStrictness: nbSorted ? 1 : 0,
              nbSortedHits: nbSorted,
              processingTimeMS: 10,
            })
          )
        )
      )
    ),
  });
}

describe('Stats', () => {
  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <Stats />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          0 results found in 0ms
        </span>
      </div>
      `);
    });
  });

  test('renders with proper message nbHits and processingTimeMS', async () => {
    const client = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Stats />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          1,000 results found in 10ms
        </span>
      </div>
      `);
    });
  });

  test('renders with proper message when hits are sorted', async () => {
    const client = createMockedSearchClient({ nbSorted: 500 });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Stats />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          500 relevant results sorted out of 1,000 found in 10ms
        </span>
      </div>
      `);
    });
  });

  test('renders with proper message when nbSorted equals nbHits', async () => {
    const client = createMockedSearchClient({ nbSorted: 1000 });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Stats />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          1,000 results found in 10ms
        </span>
      </div>
      `);
    });
  });

  test('renders with translations', async () => {
    const client = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Stats
          translations={{
            rootElementText: () => 'Nice stats',
          }}
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          Nice stats
        </span>
      </div>
      `);
    });
  });

  test('renders with deprecated translations (with a deprecation warning)', async () => {
    const client = createMockedSearchClient();
    let result: ReturnType<typeof render> | undefined = undefined;

    expect(async () => {
      result = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Stats
            translations={{
              stats: () => 'Nice stats',
            }}
          />
        </InstantSearchHooksTestWrapper>
      );
    }).toWarnDev(
      '[InstantSearch] The `stats` translation is deprecated. Please use `rootElementText` instead.'
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    const { container } = result!;

    await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          Nice stats
        </span>
      </div>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <Stats
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
