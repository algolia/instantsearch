/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { wait } from '@instantsearch/testutils';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createWidgetContainer } from 'instantsearch.js/es/lib/createWidgetContainer';
import { InstantSearchBase } from 'instantsearch.js/es/lib/InstantSearchBase';
import React from 'react';

import { useChat } from '../../connectors/useChat';
import { useChatTrigger } from '../../connectors/useChatTrigger';
import { IndexContext } from '../../lib/IndexContext';
import { InstantSearchContext } from '../../lib/InstantSearchContext';

import type { InstantSearch } from 'instantsearch.js';

function ChatWithTrigger() {
  const { open } = useChat({
    agentId: 'agentId',
    persistence: false,
    requiresSearch: false,
  });
  const { toggleOpen } = useChatTrigger();

  return (
    <>
      <span data-testid="open">{String(open)}</span>
      <button onClick={toggleOpen}>Toggle</button>
    </>
  );
}

describe('InstantSearchBase', () => {
  test('is what the chat hooks read, when provided through the contexts', async () => {
    const base = new InstantSearchBase({
      client: { appId: 'appId', apiKey: 'apiKey' },
      indexName: 'indexName',
      mainIndex: createWidgetContainer({
        indexId: 'indexName',
        indexName: 'indexName',
      }),
    });
    base.start();

    render(
      <InstantSearchContext.Provider value={base as unknown as InstantSearch}>
        <IndexContext.Provider value={base.mainIndex}>
          <ChatWithTrigger />
        </IndexContext.Provider>
      </InstantSearchContext.Provider>
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');

    userEvent.click(screen.getByText('Toggle'));
    await act(async () => {
      await wait(0);
    });

    expect(screen.getByTestId('open')).toHaveTextContent('true');
  });
});
