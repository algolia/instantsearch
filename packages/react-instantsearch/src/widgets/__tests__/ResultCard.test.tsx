/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { wait } from '@instantsearch/testutils/wait';
import { act, render } from '@testing-library/react';
import React from 'react';

import { ResultCard } from '../ResultCard';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchResponse } from 'instantsearch.js';

// The card renders nothing until a Rule enables it in the results, so it is
// excluded from `all-components.test.tsx` and covered here with a response
// that activates it (the connector then shows its skeleton before requesting).
function createActivatingSearchClient() {
  return createSearchClient({
    search: jest.fn((requests: unknown[]) =>
      Promise.resolve({
        results: requests.map(() => ({
          hits: [{ objectID: '1' }],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: 'running shoes',
          params: '',
          index: 'indexName',
          renderingContent: { widgets: { resultCard: { enabled: true } } },
        })) as unknown as Array<SearchResponse<any>>,
      })
    ) as MockSearchClient['search'],
  });
}

async function renderInSearch(ui: React.ReactElement) {
  const result = render(
    <InstantSearchTestWrapper searchClient={createActivatingSearchClient()}>
      {ui}
    </InstantSearchTestWrapper>
  );
  await act(async () => {
    await wait(0);
  });
  return result;
}

describe('ResultCard rendering', () => {
  test('sets root class name', async () => {
    const { container } = await renderInSearch(
      <ResultCard
        agentId="test-agent-id"
        classNames={{ root: 'BASECLASS ROOTCLASS' }}
      />
    );

    expect(
      container.querySelector('.BASECLASS')!.classList.contains('ROOTCLASS')
    ).toEqual(true);
  });

  test('sets root html attribute', async () => {
    const { container } = await renderInSearch(
      <ResultCard
        agentId="test-agent-id"
        classNames={{ root: 'BASECLASS' }}
        title="test title"
      />
    );

    expect(container.querySelector<HTMLElement>('.BASECLASS')!.title).toBe(
      'test title'
    );
  });
});
