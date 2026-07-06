/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
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
