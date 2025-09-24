/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SearchBox } from '../SearchBox';

import type { UiState } from 'instantsearch.js';

describe('SearchBox', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SearchBox
          className="MySearchBox"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MySearchBox', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('refines on submit when searchAsYouType is false, even if custom onSubmit is provided', () => {
    const onSubmit = jest.fn();
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox searchAsYouType={false} onSubmit={onSubmit} />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();

    userEvent.type(input, 'iPhone{Enter}');

    expect(lastUiState.indexName.query).toBe('iPhone');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('refines on reset when searchAsYouType is set', () => {
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox searchAsYouType={false} />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();
    userEvent.type(input, 'iPhone{Enter}');
    expect(lastUiState.indexName.query).toBe('iPhone');

    const resetButton = container.querySelector<HTMLButtonElement>(
      '.ais-SearchBox-reset'
    )!;
    userEvent.click(resetButton);
    expect(lastUiState.indexName.query).toBe(undefined);
  });

  test('renders with translations', () => {
    const { getByRole } = render(
      <InstantSearchTestWrapper>
        <SearchBox
          translations={{
            resetButtonTitle: 'Reset',
            submitButtonTitle: 'Submit',
          }}
        />
      </InstantSearchTestWrapper>
    );

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    userEvent.type(getByRole('searchbox'), 'nothing');

    expect(getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
