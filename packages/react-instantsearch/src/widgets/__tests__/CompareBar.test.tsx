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
  const renderState = useCompare({ configurationId: 'algolia_comparison_abc' });
  onRenderState(renderState);
  return null;
}

function renderCompareBar(
  props: Partial<React.ComponentProps<typeof CompareBar>> = {}
) {
  let compareState: CompareRenderState | undefined;

  const utils = render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      <CompareController
        onRenderState={(renderState) => {
          compareState = renderState;
        }}
      />
      <CompareBar configurationId="algolia_comparison_abc" {...props} />
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
    expect(screen.getByRole('button', { name: 'Compare 2' })).toBeEnabled();
  });

  test('shows the items transformed by `transformItems`', () => {
    const transformItems = (items: Array<{ objectID: string }>) =>
      items.map((item) => ({ ...item, name: `Item ${item.objectID}` }));
    const { getCompareState } = renderCompareBar({ transformItems });

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
      getCompareState().toggleItem({ objectID: 'B', name: 'MacBook Pro 16' });
    });

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.queryByText('MacBook Pro 14')).not.toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
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

  test('keeps focus in the bar after removing an item', async () => {
    const { getCompareState } = renderCompareBar();

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'A' });
      getCompareState().toggleItem({ objectID: 'B', name: 'B' });
      getCompareState().toggleItem({ objectID: 'C', name: 'C' });
    });

    const removeButton = (name: string) =>
      screen.getByRole('button', { name: `Remove ${name} from comparison` });

    await userEvent.click(removeButton('A'));
    expect(removeButton('B')).toHaveFocus();

    await userEvent.click(removeButton('C'));
    expect(removeButton('B')).toHaveFocus();
  });

  test('applies custom class names and translations', () => {
    const { container, getCompareState } = renderCompareBar({
      classNames: { root: 'ROOTCLASS' },
      translations: { title: 'Side by side' },
    });

    act(() => {
      getCompareState().toggleItem({ objectID: 'A', name: 'MacBook Pro 14' });
    });

    expect(container.querySelector('.ais-CompareBar')).toHaveClass('ROOTCLASS');
    expect(
      screen.getByRole('heading', { level: 3, name: 'Side by side' })
    ).toHaveClass('ais-CompareBar-title');
  });
});
