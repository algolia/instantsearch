/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import React from 'react';

import { CurrentRefinements } from '../CurrentRefinements';

describe('CurrentRefinements', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <CurrentRefinements
          className="MyCurrentRefinements"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyCurrentRefinements', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
