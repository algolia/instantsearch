/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-core';

import { Chat } from '../Chat';
import { ChatTrigger } from '../ChatTrigger';

// `ChatTrigger`'s prop shape (extends `ComponentProps<'button'>`) widens the
// shared `SingleWidget` union enough to break TS narrowing in
// `all-components.test.tsx`'s parametrized cases, so it's excluded there and
// covered with the same className/root-attribute assertions here.
function renderInSearch(ui: React.ReactElement) {
  return render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      {ui}
      <Chat agentId="agentId" persistence={false} />
    </InstantSearch>
  );
}

describe('ChatTrigger rendering', () => {
  test('sets root class name', async () => {
    const { container } = renderInSearch(
      <ChatTrigger classNames={{ root: 'BASECLASS ROOTCLASS' }} />
    );

    await waitFor(() => {
      expect(
        container.querySelector('.BASECLASS')!.classList.contains('ROOTCLASS')
      ).toEqual(true);
    });
  });

  test('sets root html attribute', async () => {
    const { container } = renderInSearch(
      <ChatTrigger classNames={{ root: 'BASECLASS' }} title="test title" />
    );

    await waitFor(() => {
      expect(
        container.querySelector<HTMLButtonElement>('.BASECLASS')!.title
      ).toBe('test title');
    });
  });

  test('first visible render uses restored state when mounted before Chat', async () => {
    sessionStorage.clear();
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');

    const searchClient = createSearchClient({});
    const renderedOpenStates: boolean[] = [];
    const ToggleIcon = ({ isOpen }: { isOpen: boolean }) => {
      renderedOpenStates.push(isOpen);
      return <span>{String(isOpen)}</span>;
    };
    const App = ({ searchKey }: { searchKey: number }) => (
      <InstantSearch
        key={searchKey}
        searchClient={searchClient}
        indexName="indexName"
      >
        <ChatTrigger toggleIconComponent={ToggleIcon} />
        <Chat agentId="agentId" persistOpen />
      </InstantSearch>
    );

    const { container, rerender } = render(<App searchKey={1} />);

    await waitFor(() => {
      expect(container.querySelector('.ais-ChatToggleButton')).toHaveClass(
        'ais-ChatToggleButton--open'
      );
    });
    expect(renderedOpenStates).toContain(true);
    expect(renderedOpenStates).not.toContain(false);

    renderedOpenStates.length = 0;
    rerender(<App searchKey={2} />);

    await waitFor(() => {
      expect(container.querySelector('.ais-ChatToggleButton')).toHaveClass(
        'ais-ChatToggleButton--open'
      );
    });
    expect(renderedOpenStates).toContain(true);
    expect(renderedOpenStates).not.toContain(false);
  });
});
