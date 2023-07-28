/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SortBy } from '../SortBy';

describe('SortBy', () => {
  test('renders with props', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SortBy
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
      'instant_search'
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy"
        >
          <select
            class="ais-SortBy-select"
          >
            <option
              class="ais-SortBy-option"
              value="instant_search"
            >
              Featured
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_asc"
            >
              Price (asc)
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_desc"
            >
              Price (desc)
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('transform the passed items', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SortBy
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label: item.label.toUpperCase(),
            }))
          }
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy"
        >
          <select
            class="ais-SortBy-select"
          >
            <option
              class="ais-SortBy-option"
              value="instant_search"
            >
              FEATURED
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_asc"
            >
              PRICE (ASC)
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_desc"
            >
              PRICE (DESC)
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('updates the selected index', async () => {
    const client = createSearchClient({});

    const { getByRole } = render(
      <InstantSearchTestWrapper
        searchClient={client}
        indexName="instant_search"
      >
        <SortBy
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ indexName: 'instant_search' }),
        ])
      );
    });

    userEvent.selectOptions(
      document.querySelector('.ais-SortBy-select') as HTMLSelectElement,
      getByRole('option', { name: 'Price (asc)' })
    );

    await waitFor(() => {
      expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
        'instant_search_price_asc'
      );
      expect(client.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ indexName: 'instant_search_price_asc' }),
        ])
      );
    });
  });

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
