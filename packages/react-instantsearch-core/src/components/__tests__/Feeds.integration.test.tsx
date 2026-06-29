/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createCompositionClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';

import { IndexContext } from '../../lib/IndexContext';
import { useIndexContext } from '../../lib/useIndexContext';
import { Feeds } from '../Feeds';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

import type { InstantSearchProps } from '../InstantSearch';
import type { IndexWidget } from 'instantsearch-core';

function createInstantSearchMock() {
  const indexContextRef = createRef<IndexWidget>();

  function InstantSearchMock({ children, ...props }: InstantSearchProps) {
    return (
      <InstantSearch {...props}>
        <IndexContext.Consumer>
          {(value) => {
            // @ts-ignore `React.RefObject` is typed as immutable
            indexContextRef.current = value!;

            return (
              <IndexContext.Provider value={value}>
                {children}
              </IndexContext.Provider>
            );
          }}
        </IndexContext.Consumer>
      </InstantSearch>
    );
  }

  return {
    InstantSearchMock,
    indexContextRef,
  };
}

function FeedScopedChild({ feedID }: { feedID: string }) {
  const index = useIndexContext();
  return (
    <div data-testid={`feed-${feedID || 'default'}`}>
      {index.getIndexId() || 'default'}
    </div>
  );
}

describe('Feeds (integration)', () => {
  test('registers feed containers and scopes descendants with real InstantSearch', async () => {
    const searchClient = createCompositionClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    render(
      <InstantSearchMock
        indexName="indexName"
        searchClient={searchClient}
        compositionID="my-composition"
      >
        <Feeds
          isolated={false}
          renderFeed={({ feedID }) => <FeedScopedChild feedID={feedID} />}
        />
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(screen.getByTestId('feed-default')).toHaveTextContent('default');
    });

    expect(
      indexContextRef
        .current!.getWidgets()
        .some((widget) => widget.$$type === 'ais.feeds')
    ).toBe(true);
    expect(
      indexContextRef
        .current!.getWidgets()
        .some((widget) => widget.$$type === 'ais.feedContainer')
    ).toBe(true);
  });

  test('renders feed children with SSR initial results', () => {
    const searchClient = createCompositionClient({});
    const initialResults = {
      indexName: {
        state: {},
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 1,
            nbPages: 1,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    render(
      <InstantSearchSSRProvider initialResults={initialResults}>
        <InstantSearch
          indexName="indexName"
          searchClient={searchClient}
          compositionID="my-composition"
        >
          <Feeds
            isolated={false}
            renderFeed={({ feedID }) => <FeedScopedChild feedID={feedID} />}
          />
        </InstantSearch>
      </InstantSearchSSRProvider>
    );

    expect(screen.getByTestId('feed-default')).toHaveTextContent('default');
  });
});
