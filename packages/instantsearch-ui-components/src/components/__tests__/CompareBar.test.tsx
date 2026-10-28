/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render, screen } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { createCompareBarComponent } from '../CompareBar';

import type { Pragma } from '../../types';
import type { CompareBarItem } from '../CompareBar';

const CompareBar = createCompareBarComponent({
  createElement: createElement as Pragma,
  Fragment,
});

function Stateful({ initial }: { initial: CompareBarItem[] }) {
  const [items, setItems] = useState(initial);
  return (
    <CompareBar
      items={items}
      minItems={2}
      maxItems={4}
      canCompare
      onCompare={() => {}}
      onRemove={(item) =>
        setItems((prev) => prev.filter((i) => i.objectID !== item.objectID))
      }
      onClear={() => setItems([])}
    />
  );
}

const remove = (name: string) =>
  screen.getByRole('button', { name: `Remove ${name} from comparison` });

describe('CompareBar focus management', () => {
  const items = [
    { objectID: 'A', name: 'A' },
    { objectID: 'B', name: 'B' },
    { objectID: 'C', name: 'C' },
  ];

  test('moves focus to the next item remove button', async () => {
    render(<Stateful initial={items} />);

    remove('A').focus();
    fireEvent.click(remove('A'));

    await screen.findByRole('button', { name: 'Remove B from comparison' });
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(remove('B')).toHaveFocus();
  });

  test('moves focus to the previous item when removing the last one', async () => {
    render(<Stateful initial={items} />);

    fireEvent.click(remove('C'));

    await screen.findByRole('button', { name: 'Remove B from comparison' });
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(remove('B')).toHaveFocus();
  });

  test('does not throw when removing the only item', async () => {
    const { container } = render(<Stateful initial={[items[0]]} />);

    fireEvent.click(remove('A'));

    await Promise.resolve();
    expect(container.querySelector('.ais-CompareBar')).toBeNull();
  });
});
