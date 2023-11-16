/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { Stats } from '../Stats';

describe('Stats', () => {
  test('renders with translations', async () => {
    const client = createSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <Stats
          translations={{
            rootElementText: () => 'Nice stats',
          }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-Stats')).toMatchInlineSnapshot(`
      <div
        class="ais-Stats"
      >
        <span
          class="ais-Stats-text"
        >
          Nice stats
        </span>
      </div>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <Stats
          className="MyHits"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHits', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});
