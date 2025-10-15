/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
