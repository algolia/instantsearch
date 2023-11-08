/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import React from 'react';

import { ToggleRefinement } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  test('customizes the label', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <ToggleRefinement attribute="free_shipping" label="Free shipping" />
      </InstantSearchTestWrapper>
    );

    expect(
      container.querySelector('.ais-ToggleRefinement-labelText')
    ).toHaveTextContent('Free shipping');
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <ToggleRefinement
          attribute="free_shipping"
          className="MyToggleRefinement"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyToggleRefinement', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
