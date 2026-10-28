/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement } from 'preact';

import * as icons from '../icons';

const { LoadingSpinnerIcon, ...decorativeIcons } = icons;

describe('chat icons', () => {
  test.each(Object.entries(decorativeIcons))(
    '%s is hidden from assistive technology',
    (_name, Icon) => {
      const { container } = render(<Icon createElement={createElement} />);

      expect(container.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    }
  );

  test('LoadingSpinnerIcon stays exposed as a status', () => {
    const { container } = render(
      <LoadingSpinnerIcon createElement={createElement} />
    );
    const svg = container.querySelector('svg')!;

    expect(svg).toHaveAttribute('role', 'status');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });
});
