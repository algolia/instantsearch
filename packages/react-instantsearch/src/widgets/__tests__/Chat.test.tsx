/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import { Chat } from '../Chat';

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
      addToolResult: jest.fn(),
    };
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat classNames={{ root: 'ROOT' }} />
      </InstantSearchTestWrapper>
    );

    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const root = container.querySelector('.ais-Chat');
    expect(root).toHaveClass('ROOT');
  });

  test('closes chat when close button is clicked', () => {
    mockUseChat = {
      messages: [],
      sendMessage: jest.fn(),
      addToolResult: jest.fn(),
    };
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat />
      </InstantSearchTestWrapper>
    );

    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);
    const closeButton = container.querySelector('.ais-ChatHeader-close');
    userEvent.click(closeButton!);

    const root = container.querySelector('.ais-Chat-container');
    expect(root).not.toHaveClass('ais-Chat-container--open');
  });

  test('should send message when form is submitted', () => {
    const sendMessage = jest.fn();
    mockUseChat = {
      messages: [],
      sendMessage,
      addToolResult: jest.fn(),
    };
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat />
      </InstantSearchTestWrapper>
    );

    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const textarea = container.querySelector(
      '.ais-ChatPrompt-textarea'
    ) as HTMLTextAreaElement;
    userEvent.type(textarea, 'Hello, world!');

    const submitBtn = container.querySelector('.ais-ChatPrompt-submit');
    userEvent.click(submitBtn!);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({ text: 'Hello, world!' });
    expect(textarea.value).toBe('');
  });

  test('should render tools and call onToolCall', () => {
    mockUseChat = {
      messages: [
        { id: '0', role: 'user', parts: [{ type: 'text', content: 'Hello' }] },
        { id: '1', role: 'assistant', parts: [{ type: 'tool-hello' }] },
      ],
      sendMessage: jest.fn(),
    };
    const onToolCall = jest.fn();
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat
          tools={{
            hello: {
              layoutComponent: () => (
                <div>
                  <div role="alert">The message said hello!</div>
                </div>
              ),
              onToolCall,
            },
          }}
        />
      </InstantSearchTestWrapper>
    );
    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const toolComponent = container.querySelector('[role="alert"]');
    expect(toolComponent).toBeInTheDocument();
    expect(toolComponent).toHaveTextContent('The message said hello!');
  });

  test('should not use default search index tool if user provides one', () => {
    mockUseChat = {
      messages: [
        {
          id: '0',
          role: 'assistant',
          parts: [{ type: `tool-${SearchIndexToolType}` }],
        },
      ],
      sendMessage: jest.fn(),
    };
    const onToolCall = jest.fn();
    const { container } = render(
      <InstantSearchTestWrapper>
        <Chat
          tools={{
            [SearchIndexToolType]: {
              layoutComponent: () => (
                <div>
                  <div role="alert">Custom search index tool</div>
                </div>
              ),
              onToolCall,
            },
          }}
        />
      </InstantSearchTestWrapper>
    );
    const toggleButton = container.querySelector('.ais-ChatToggleButton');
    userEvent.click(toggleButton!);

    const toolComponent = container.querySelector('[role="alert"]');
    expect(toolComponent).toBeInTheDocument();
    expect(toolComponent).toHaveTextContent('Custom search index tool');
  });
});
