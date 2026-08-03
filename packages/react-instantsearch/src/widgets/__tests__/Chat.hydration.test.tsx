/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, waitFor } from '@testing-library/react';
import { CACHE_KEY } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  getServerState,
} from 'react-instantsearch-core';

import { ChatOverlayLayout } from '../../components/ChatOverlayLayout';
import { Chat } from '../Chat';
import { ChatTrigger } from '../ChatTrigger';

import type { ChatLayoutOwnProps } from 'instantsearch-ui-components';
import type { InstantSearchServerState } from 'react-instantsearch-core';

const agentId = 'hydration-agent';
const searchClient = createSearchClient({});

// Parses server markup into a container `hydrateRoot` can adopt. `innerHTML`
// would do the same, but static analysis cannot tell `renderToString` output
// from untrusted input and flags it.
function createHydrationContainer(html: string) {
  const container = document.createElement('div');
  container.append(document.createRange().createContextualFragment(html));
  document.body.append(container);

  return container;
}

function App({ serverState }: { serverState?: InstantSearchServerState }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch searchClient={searchClient} indexName="indexName">
        {/* `requiresSearch` is left at its default, so this hydrates the
            search-dependent widget against real initial results. */}
        <Chat agentId={agentId} disableTriggerValidation />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function createPersistedOpenApp({
  onPanelRender,
  onTriggerRender,
}: {
  onPanelRender: (open: boolean) => void;
  onTriggerRender: (open: boolean) => void;
}) {
  function Layout(props: ChatLayoutOwnProps) {
    onPanelRender(props.open);
    return <ChatOverlayLayout {...props} />;
  }

  function TriggerIcon({ isOpen }: { isOpen: boolean }) {
    onTriggerRender(isOpen);
    return <span />;
  }

  return function PersistedOpenApp({
    serverState,
  }: {
    serverState?: InstantSearchServerState;
  }) {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Chat
            agentId={agentId}
            layoutComponent={Layout}
            persistOpen={true}
            requiresSearch={false}
          />
          <ChatTrigger floating={false} toggleIconComponent={TriggerIcon} />
        </InstantSearch>
      </InstantSearchSSRProvider>
    );
  };
}

describe('Chat hydration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('hydrates the closed shell without a recoverable error', async () => {
    // Storage is populated before the render, so the connector's Chat restores
    // the message and the inert shell is what keeps it out of the markup. A real
    // server has no storage at all, which `Chat.server.test.tsx` covers.
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([
        {
          id: 'restored',
          role: 'assistant',
          parts: [{ type: 'text', text: 'RESTORED' }],
        },
      ])
    );

    const serverState = await getServerState(<App />, { renderToString });
    const html = renderToString(<App serverState={serverState} />);

    expect(html).not.toContain('RESTORED');

    const container = createHydrationContainer(html);
    const recoverableErrors: string[] = [];
    let root!: ReturnType<typeof hydrateRoot>;

    await act(async () => {
      root = hydrateRoot(container, <App serverState={serverState} />, {
        onRecoverableError: (error) => {
          recoverableErrors.push(String(error));
        },
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(container.querySelector('.ais-Chat-container--open')).toBeNull();

    await waitFor(() => {
      expect(
        container.querySelector('.ais-ChatMessages-content')
      ).toHaveTextContent('RESTORED');
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('restores the panel and trigger together without moving focus', async () => {
    const panelStates: boolean[] = [];
    const triggerStates: boolean[] = [];
    const PersistedOpenApp = createPersistedOpenApp({
      onPanelRender: (open) => panelStates.push(open),
      onTriggerRender: (open) => triggerStates.push(open),
    });
    const serverState = await getServerState(<PersistedOpenApp />, {
      renderToString,
    });
    const html = renderToString(<PersistedOpenApp serverState={serverState} />);

    expect(html).not.toContain('ais-Chat-container--open');
    expect(html).not.toContain('ais-ChatToggleButton--open');

    panelStates.length = 0;
    triggerStates.length = 0;
    sessionStorage.setItem('instantsearch-chat-open-state-chat', 'true');

    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);
    externalButton.focus();
    const focusSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'focus');
    const container = createHydrationContainer(html);
    const recoverableErrors: string[] = [];
    let root!: ReturnType<typeof hydrateRoot>;

    await act(async () => {
      root = hydrateRoot(
        container,
        <PersistedOpenApp serverState={serverState} />,
        {
          onRecoverableError: (error) => {
            recoverableErrors.push(String(error));
          },
        }
      );
    });

    expect(panelStates[0]).toBe(false);
    expect(triggerStates[0]).toBe(false);
    expect(recoverableErrors).toEqual([]);

    await waitFor(() => {
      expect(container.querySelector('.ais-Chat-container')).toHaveClass(
        'ais-Chat-container--open'
      );
      expect(container.querySelector('.ais-ChatToggleButton')).toHaveClass(
        'ais-ChatToggleButton--open'
      );
    });

    expect(panelStates).toContain(true);
    expect(triggerStates).toContain(true);
    expect(document.activeElement).toBe(externalButton);
    expect(focusSpy).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });
    externalButton.remove();
    container.remove();
  });
});
