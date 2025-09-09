/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Chat } from '../Chat';

jest.mock('ai', () => {
  return {
    DefaultChatTransport: jest.fn().mockImplementation(() => ({
      sendMessage: jest.fn(),
      onMessage: jest.fn(),
      onError: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    })),
  };
});
jest.mock('instantsearch.js/es/lib/chat', () => {
  return {
    Chat: jest.fn().mockImplementation(() => ({})),
  };
});

let mockUseChat: any;
jest.mock('react-instantsearch-core', () => {
  const originalModule = jest.requireActual('react-instantsearch-core');
  return {
    ...originalModule,
    useChat: jest.fn(() => mockUseChat),
  };
});

describe('Chat', () => {
  test('opens chat when toggle button is clicked', () => {
    mockUseChat = {
      messages: [],
      sendMessage: jest.fn(),
      status: 'idle',
    };
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat classNames={{ container: 'ROOT' }} />
      </InstantSearchTestWrapper>
    );

    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const root = container.querySelector('.ais-Chat-container');
    expect(root).toHaveClass('ROOT');
  });

  test('should render tools and call onToolCall', () => {
    mockUseChat = {
      messages: [
        { role: 'user', parts: [{ type: 'text', content: 'Hello' }] },
        { role: 'assistant', parts: [{ type: 'tool-hello' }] },
      ],
      sendMessage: jest.fn(),
    };
    const onToolCall = jest.fn();
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat
          tools={[
            {
              type: 'tool-hello',
              component: () => (
                <div>
                  <div role="alert">The message said hello!</div>
                </div>
              ),
              onToolCall,
            },
          ]}
        />
      </InstantSearchTestWrapper>
    );
    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const toolComponent = container.querySelector('[role="alert"]');
    expect(toolComponent).toBeInTheDocument();
    expect(toolComponent).toHaveTextContent('The message said hello!');
  });
});
