/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import React from 'react';

import { HitsPerPage } from '../HitsPerPage';

describe('HitsPerPage', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <HitsPerPage
          className="MyHitsPerPage"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
          items={[
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHitsPerPage', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
