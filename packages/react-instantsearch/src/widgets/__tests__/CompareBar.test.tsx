/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { InstantSearch, useCompare } from 'react-instantsearch-core';

import { CompareBar } from '../CompareBar';

import type { CompareRenderState } from 'instantsearch.js/es/connectors/compare/connectCompare';

// Bridges the shared compare selection out of the React tree so tests can
// drive it the same way a per-hit "Compare" toggle would.
function CompareController({
  onRenderState,
}: {
  onRenderState: (renderState: CompareRenderState) => void;
}) {
  const renderState = useCompare();
  onRenderState(renderState as CompareRenderState);
  return null;
}

function renderCompareBar(props: React.ComponentProps<typeof CompareBar> = {}) {
  let compareState: CompareRenderState | undefined;

  const utils = render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      <CompareController
        onRenderState={(renderState) => {
          compareState = renderState;
        }}
      />
      <CompareBar {...props} />
    </InstantSearch>
  );

  return { ...utils, getCompareState: () => compareState! };
}

describe('CompareBar', () => {
  test('renders nothing while the selection is empty', () => {
    const { container } = renderCompareBar();

    expect(container.querySelector('.ais-CompareBar')).toBeNull();
  });

  test('shows the selection shared through useCompare', () => {
    const { container, getCompareState } = renderCompareBar();

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getCompareState().toggleItem({ objectID: 'B', name: 'MacBook Pro 16' });
    });

    expect(container.querySelector('.ais-CompareBar')).not.toBeNull();
    expect(screen.getByText('MacBook Pro 14')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro 16')).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compare 2' })
    ).toBeEnabled();
  });

  test('disables the call-to-action below `minItems` and shows the hint', () => {
    const { getCompareState } = renderCompareBar();

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
    });

    expect(screen.getByRole('button', { name: 'Compare 1' })).toBeDisabled();
    expect(
      screen.getByText('Select at least 2 products to compare.')
    ).toBeInTheDocument();
  });

  test('removes one item and clears the selection', async () => {
    const { container, getCompareState } = renderCompareBar();

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getCompareState().toggleItem({ objectID: 'B', name: 'MacBook Pro 16' });
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove MacBook Pro 14 from comparison',
      })
    );

    expect(screen.queryByText('MacBook Pro 14')).not.toBeInTheDocument();
    expect(getCompareState().items).toEqual([
      { objectID: 'B', name: 'MacBook Pro 16' },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(container.querySelector('.ais-CompareBar')).toBeNull();
    expect(getCompareState().items).toEqual([]);
  });

  test('applies custom class names and translations', () => {
    const { container, getCompareState } = renderCompareBar({
      classNames: { root: 'ROOTCLASS' },
      translations: { title: 'Side by side' },
    });

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
    });

    expect(container.querySelector('.ais-CompareBar')).toHaveClass(
      'ROOTCLASS'
    );
    expect(screen.getByText('Side by side')).toBeInTheDocument();
  });
});
