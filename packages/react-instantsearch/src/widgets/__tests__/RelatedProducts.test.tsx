/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { RelatedProducts } from '../RelatedProducts';

describe('RelatedProducts', () => {
  test('renders with translations', async () => {
    const client = createSearchClient();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={client}>
        <RelatedProducts
          objectIDs={['1']}
          translations={{ title: 'My related products' }}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(container.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts ais-RelatedProducts--empty"
        >
          No results
        </section>
      `);
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <RelatedProducts
          objectIDs={['1']}
          className="MyRelatedProducts"
          classNames={{ root: 'ROOT' }}
          aria-hidden={true}
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRelatedProducts', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});
