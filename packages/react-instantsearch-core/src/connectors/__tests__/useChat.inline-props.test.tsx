/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import React from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { warnCache } from '../../lib/warn';
import { useChat } from '../useChat';

class CatchRenderErrors extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

async function renderChatProbe(createProps: () => Record<string, unknown>) {
  function ChatProbe() {
    useChat<any>({
      agentId: 'inline-props-agent',
      disableTriggerValidation: true,
      requiresSearch: false,
      ...createProps(),
    } as any);

    return null;
  }

  // The loop starts when the connector first updates, so wait for it. React
  // may still throw "Too many re-renders" once the warning is out.
  const { unmount } = render(
    <CatchRenderErrors>
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        <ChatProbe />
      </InstantSearch>
    </CatchRenderErrors>
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  unmount();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

describe('useChat with functions created on every render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    warnCache.current = {};
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('warns before React gives up on a top-level function', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await renderChatProbe(() => ({ sendAutomaticallyWhen: () => false }));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('The sendAutomaticallyWhen prop of useChat')
    );
  });

  test('names the tool that holds the changing function', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await renderChatProbe(() => ({
      tools: { search: { onToolCall: () => {} } },
    }));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('The tools.search.onToolCall prop of useChat')
    );
  });

  test('does not warn when the functions are stable', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sendAutomaticallyWhen = () => false;
    const tools = { search: { onToolCall: () => {} } };

    await renderChatProbe(() => ({ sendAutomaticallyWhen, tools }));

    expect(warn).not.toHaveBeenCalled();
  });
});
