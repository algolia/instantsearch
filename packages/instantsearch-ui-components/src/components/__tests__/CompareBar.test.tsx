/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createCompareBarComponent } from '../CompareBar';

describe('CompareBar', () => {
  const CompareBar = createCompareBarComponent({ createElement, Fragment });

  const props = {
    items: [{ objectID: 'A' }, { objectID: 'B' }],
    minItems: 2,
    maxItems: 3,
    canCompare: true,
    onCompare: jest.fn(),
    onRemove: jest.fn(),
    onClear: jest.fn(),
  };

  test('enables the Compare button when the selection is big enough', () => {
    const { container } = render(<CompareBar {...props} />);

    expect(
      container.querySelector('.ais-CompareBar-compareButton')
    ).toBeEnabled();
  });

  test('disables the Compare button while the chat is busy and re-enables it after', () => {
    const { container, rerender } = render(
      <CompareBar {...props} isChatBusy />
    );

    expect(
      container.querySelector('.ais-CompareBar-compareButton')
    ).toBeDisabled();

    rerender(<CompareBar {...props} isChatBusy={false} />);

    expect(
      container.querySelector('.ais-CompareBar-compareButton')
    ).toBeEnabled();
  });
});
