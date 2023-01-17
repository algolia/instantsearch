/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { HitsPerPage } from '../HitsPerPage';

describe('HitsPerPage', () => {
  test('renders with props', async () => {
    const searchClient = createSearchClient({});
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HitsPerPage
          items={[
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-HitsPerPage"
        >
          <select
            class="ais-HitsPerPage-select"
          >
            <option
              class="ais-HitsPerPage-option"
              value="10"
            >
              10
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="20"
            >
              20
            </option>
            <option
              class="ais-HitsPerPage-option"
              value="30"
            >
              30
            </option>
          </select>
        </div>
      </div>
    `);
  });

  test('selects current value', async () => {
    const searchClient = createSearchClient({});
    const { getByRole } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hitsPerPage: 20,
          },
        }}
      >
        <HitsPerPage
          items={[
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(
      (getByRole('option', { name: '10' }) as HTMLOptionElement).selected
    ).toBe(false);
    expect(
      (getByRole('option', { name: '20' }) as HTMLOptionElement).selected
    ).toBe(true);
    expect(
      (getByRole('option', { name: '30' }) as HTMLOptionElement).selected
    ).toBe(false);
  });

  test('refines on select', async () => {
    const searchClient = createSearchClient({});
    const { getByRole } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <HitsPerPage
          items={[
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    userEvent.selectOptions(getByRole('combobox'), ['30']);

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    expect(searchClient.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            hitsPerPage: 30,
          }),
        }),
      ])
    );
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
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
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHitsPerPage', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
