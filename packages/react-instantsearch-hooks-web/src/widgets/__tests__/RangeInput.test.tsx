import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { RangeInput } from '../RangeInput';

function createSearchClientWithFacetsStats() {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: {
                price: {},
              },
              facets_stats: {
                price: {
                  min: 1,
                  max: 1000,
                  avg: 0,
                  sum: 0,
                },
              },
            })
          )
        )
      );
    }),
  });
}

describe('RangeInput', () => {
  test('renders with default props', async () => {
    const client = createSearchClientWithFacetsStats();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <RangeInput attribute="price" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RangeInput"
        >
          <form
            class="ais-RangeInput-form"
          >
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--min"
                max="1000"
                min="1"
                placeholder="1"
                step="1"
                type="number"
                value=""
              />
            </label>
            <span
              class="ais-RangeInput-separator"
            >
              to
            </span>
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--max"
                max="1000"
                min="1"
                placeholder="1000"
                step="1"
                type="number"
                value=""
              />
            </label>
            <button
              class="ais-RangeInput-submit"
              type="submit"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    `);
  });

  test('renders with initial refinements', async () => {
    const client = createSearchClientWithFacetsStats();
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={client}
        initialUiState={{
          indexName: {
            range: {
              price: '100:200',
            },
          },
        }}
      >
        <RangeInput attribute="price" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container.querySelector('.ais-RangeInput-input--min')).toHaveValue(
      100
    );
    expect(container.querySelector('.ais-RangeInput-input--max')).toHaveValue(
      200
    );
  });

  test('renders with precision', async () => {
    const client = createSearchClientWithFacetsStats();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <RangeInput attribute="price" precision={2} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    ['min', 'max'].forEach((target) => {
      expect(
        container.querySelector(`.ais-RangeInput-input--${target}`)
      ).toHaveAttribute('step', '0.01');
    });
  });

  test('refines on submit', async () => {
    const client = createSearchClientWithFacetsStats();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <RangeInput attribute="price" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

    userEvent.type(
      container.querySelector('.ais-RangeInput-input--min')!,
      '100'
    );
    userEvent.type(
      container.querySelector('.ais-RangeInput-input--max')!,
      '200'
    );

    userEvent.click(container.querySelector('.ais-RangeInput-submit')!);

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(2);
    expect(client.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            numericFilters: ['price>=100', 'price<=200'],
          }),
        }),
      ])
    );
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const client = createSearchClientWithFacetsStats();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <RangeInput
          attribute="price"
          className="MyRangeInput"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRangeInput', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
