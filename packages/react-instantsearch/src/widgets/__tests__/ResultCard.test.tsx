/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { wait } from '@instantsearch/testutils/wait';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ResultCard } from '../ResultCard';
import { SearchBox } from '../SearchBox';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchResponse } from 'instantsearch.js';

// The card renders nothing until a Rule enables it in the results, so it is
// excluded from `all-components.test.tsx` and covered here with a response
// that activates it (the connector then shows its skeleton before requesting).
function createActivatingSearchClient() {
  return createSearchClient({
    search: jest.fn((requests: Array<{ params?: { query?: string } }>) =>
      Promise.resolve({
        results: requests.map((request) => ({
          hits: [{ objectID: '1' }],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: request.params?.query || 'running shoes',
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

  test('stays minimized for a new query', async () => {
    const { container } = await renderInSearch(
      <>
        <SearchBox />
        <ResultCard agentId="test-agent-id" />
      </>
    );

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    });
    expect(container.querySelector('.ais-ResultCard-body')).toBeNull();

    await act(async () => {
      await userEvent.type(screen.getByRole('searchbox'), 'trail shoes');
      await wait(0);
    });

    expect(container.querySelector('.ais-ResultCard')).toHaveAttribute(
      'data-status',
      'loading'
    );
    expect(container.querySelector('.ais-ResultCard-body')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Maximize' })
    ).toBeInTheDocument();
  });

  test('throws when both `transport` and `requestOptions` are provided', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(
        <InstantSearchTestWrapper searchClient={createActivatingSearchClient()}>
          <ResultCard
            {...({
              agentId: 'test-agent-id',
              transport: { api: '/api/chat' },
              requestOptions: { headers: { 'X-Test': '1' } },
            } as unknown as React.ComponentProps<typeof ResultCard>)}
          />
        </InstantSearchTestWrapper>
      );
    }).toThrow(/mutually exclusive/);

    consoleError.mockRestore();
  });
});
