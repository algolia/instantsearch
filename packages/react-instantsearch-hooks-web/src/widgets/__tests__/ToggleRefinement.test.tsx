/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ToggleRefinement } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  test('renders with props', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement attribute="free_shipping" />
      </InstantSearchHooksTestWrapper>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              free_shipping
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('customizes the label', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement attribute="free_shipping" label="Free shipping" />
      </InstantSearchHooksTestWrapper>
    );

    expect(
      container.querySelector('.ais-ToggleRefinement-labelText')
    ).toHaveTextContent('Free shipping');
  });

  test('renders checked when the attribute is refined', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            toggle: {
              free_shipping: true,
            },
          },
        }}
      >
        <ToggleRefinement attribute="free_shipping" />
      </InstantSearchHooksTestWrapper>
    );

    expect(
      container.querySelector<HTMLInputElement>(
        '.ais-ToggleRefinement-checkbox'
      )!.checked
    ).toBe(true);
  });

  test('toggles when clicking the checkbox', async () => {
    const client = createSearchClient({});

    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <ToggleRefinement attribute="free_shipping" />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    const checkbox = container.querySelector<HTMLInputElement>(
      '.ais-ToggleRefinement-checkbox'
    )!;

    expect(checkbox.checked).toBe(false);

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(2);
      expect(client.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: {
              facetFilters: [['free_shipping:true']],
              facets: ['free_shipping'],
              tagFilters: '',
            },
          }),
        ])
      );
      expect(checkbox.checked).toBe(true);
    });

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(3);
      expect(client.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facets: ['free_shipping'],
              tagFilters: '',
            }),
          }),
        ])
      );
      expect(checkbox.checked).toBe(false);
    });
  });

  test('changes the value to filter on and off', async () => {
    const client = createSearchClient({});

    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <ToggleRefinement attribute="free_shipping" on="yes" off="no" />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(client.search).toHaveBeenCalledTimes(1);
    });

    const checkbox = container.querySelector<HTMLInputElement>(
      '.ais-ToggleRefinement-checkbox'
    )!;

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
      expect(client.search).toHaveBeenCalledTimes(2);
      expect(client.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: {
              facetFilters: [['free_shipping:yes']],
              facets: ['free_shipping'],
              tagFilters: '',
            },
          }),
        ])
      );
    });

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(client.search).toHaveBeenCalledTimes(3);
      expect(client.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [['free_shipping:no']],
            }),
          }),
        ])
      );
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement
          attribute="free_shipping"
          className="MyToggleRefinement"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyToggleRefinement', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
