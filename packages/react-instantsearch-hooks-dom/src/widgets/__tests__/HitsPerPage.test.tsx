import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { HitsPerPage } from '../HitsPerPage';

describe('HitsPerPage', () => {
  test('renders with items', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <HitsPerPage
          items={[
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
          ]}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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

  test('forwards props to the root element', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <HitsPerPage
          className="MyHitsPerPage"
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

    await wait(0);

    expect(root).toHaveClass('ais-HitsPerPage', 'MyHitsPerPage');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('selects current value', async () => {
    const { getByRole } = render(
      <InstantSearchHooksTestWrapper
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

    await wait(0);

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
    const searchClient = createSearchClient();
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

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(1);

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
});
