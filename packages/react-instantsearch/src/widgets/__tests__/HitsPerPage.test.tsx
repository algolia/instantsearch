/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { findAllByRole, findByRole, render } from '@testing-library/react';
import React from 'react';

import { HitsPerPage } from '../HitsPerPage';

describe('HitsPerPage', () => {
  test('forwards custom class names and `div` props to the root element', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <HitsPerPage
          className="MyHitsPerPage"
          classNames={{ root: 'ROOT', select: 'SELECT', option: 'OPTION' }}
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
    const select = await findByRole(container, 'combobox');
    const options = await findAllByRole(container, 'option');

    expect(root).toHaveClass('MyHitsPerPage', 'ROOT');
    expect(select).toHaveClass('SELECT');
    options.forEach((option) => expect(option).toHaveClass('OPTION'));
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
