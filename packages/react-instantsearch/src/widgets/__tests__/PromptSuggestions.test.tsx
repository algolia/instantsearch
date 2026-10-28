/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { wait } from '@instantsearch/testutils/wait';
import { act, render } from '@testing-library/react';
import React from 'react';

import { Chat } from '../Chat';
import { PromptSuggestions } from '../PromptSuggestions';

describe('PromptSuggestions', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs every error thrown from a render, on top of rethrowing it.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe('missing Chat widget', () => {
    it('throws once no <Chat> is found on the index', async () => {
      const searchClient = createSearchClient({});

      await expect(async () => {
        render(
          <InstantSearchTestWrapper searchClient={searchClient}>
            <PromptSuggestions
              agentId="agentId"
              configurationId="prompt-suggestions"
            />
          </InstantSearchTestWrapper>
        );

        // The absence is only conclusive once the deferred mount check has run:
        // a <Chat> further down the tree is only added after this widget's
        // `init`.
        await act(async () => {
          await wait(0);
        });
      }).rejects.toThrow(/No <Chat> widget is mounted on this index/);
    });

    it('renders when a <Chat> is mounted on the same index', async () => {
      const searchClient = createSearchClient({});

      render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <PromptSuggestions
            agentId="agentId"
            configurationId="prompt-suggestions"
          />
          <Chat agentId="agentId" />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-PromptSuggestions')
      ).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('renders when an `onSuggestionClick` override owns the click', async () => {
      const searchClient = createSearchClient({});

      render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <PromptSuggestions
            agentId="agentId"
            configurationId="prompt-suggestions"
            onSuggestionClick={() => {}}
          />
        </InstantSearchTestWrapper>
      );

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-PromptSuggestions')
      ).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
