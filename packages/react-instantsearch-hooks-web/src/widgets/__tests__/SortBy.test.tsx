import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { SortBy } from '../SortBy';

describe('SortBy', () => {
  test('renders with items', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <SortBy
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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

  test('transform the passed items', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
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
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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
      <InstantSearchHooksTestWrapper
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
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ indexName: 'instant_search' }),
      ])
    );

    userEvent.selectOptions(
      document.querySelector('.ais-SortBy-select') as HTMLSelectElement,
      getByRole('option', { name: 'Price (asc)' })
    );

    await wait(0);

    expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
      'instant_search_price_asc'
    );
    expect(client.search).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ indexName: 'instant_search_price_asc' }),
      ])
    );
  });

  test('forwards `div` props to the root element', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <SortBy
          className="MySortBy"
          title="Some custom title"
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    const root = document.querySelector('.ais-SortBy');

    expect(root).toHaveClass('MySortBy');
    expect(root).toHaveAttribute('title', 'Some custom title');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy MySortBy"
          title="Some custom title"
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

  test('accepts custom class names', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <SortBy
          className="MySortBy"
          classNames={{
            root: 'ROOT',
            select: 'SELECT',
            option: 'OPTION',
          }}
          items={[
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SortBy ROOT MySortBy"
        >
          <select
            class="ais-SortBy-select SELECT"
          >
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search"
            >
              Featured
            </option>
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search_price_asc"
            >
              Price (asc)
            </option>
            <option
              class="ais-SortBy-option OPTION"
              value="instant_search_price_desc"
            >
              Price (desc)
            </option>
          </select>
        </div>
      </div>
    `);
  });
});
