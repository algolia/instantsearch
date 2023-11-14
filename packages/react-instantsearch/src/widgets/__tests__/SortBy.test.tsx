/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import React from 'react';

import { SortBy } from '../SortBy';

describe('SortBy', () => {
  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SortBy
          className="MySortBy"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MySortBy', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
