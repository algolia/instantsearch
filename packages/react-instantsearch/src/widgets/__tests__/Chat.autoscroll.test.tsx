/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-core';

import { ChatInlineLayout } from '../../components/ChatInlineLayout';
import { Chat } from '../Chat';

jest.mock('../../lib/useStickToBottom', () => {
  const scrollToBottom = jest.fn();
  return {
    __esModule: true,
    useStickToBottom: () => ({
      scrollRef: { current: null },
      contentRef: { current: null },
      scrollToBottom,
      isAtBottom: true,
    }),
    scrollToBottomSpy: scrollToBottom,
  };
});

const { scrollToBottomSpy }: { scrollToBottomSpy: jest.Mock } =
  jest.requireMock('../../lib/useStickToBottom');

const stream = [
  '{"type":"start","messageId":"a1"}',
  '{"type":"start-step"}',
  '{"type":"text-start","id":"t1"}',
  '{"type":"text-delta","id":"t1","delta":"Hello"}',
  '{"type":"text-end","id":"t1"}',
  '{"type":"finish-step"}',
  '{"type":"finish"}',
  '[DONE]',
]
  .map((data) => `data: ${data}\n\n`)
  .join('');

describe('Chat auto-scroll', () => {
  test('scrolls to a submitted message', async () => {
    render(
      <InstantSearch indexName="indexName" searchClient={createSearchClient()}>
        <Chat
          disableTriggerValidation={true}
          layoutComponent={ChatInlineLayout}
          persistence={false}
          requiresSearch={false}
          transport={{
            fetch: () =>
              Promise.resolve(
                new Response(stream, {
                  headers: { 'Content-Type': 'text/event-stream' },
                })
              ),
          }}
        />
      </InstantSearch>
    );

    const prompt = screen.getByRole('textbox');
    userEvent.type(prompt, 'hi{enter}');

    await waitFor(() => {
      expect(scrollToBottomSpy).toHaveBeenCalledWith();
    });
  });
});
