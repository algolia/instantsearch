import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { ToggleRefinement } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  test('renders with props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement attribute="free_shipping" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

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

  test('customizes the label', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement attribute="free_shipping" label="Free shipping" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      container.querySelector('.ais-ToggleRefinement-labelText')
    ).toHaveTextContent('Free shipping');
  });

  test('renders checked when the attribute is refined', async () => {
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

    await wait(0);

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

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

    const checkbox = container.querySelector<HTMLInputElement>(
      '.ais-ToggleRefinement-checkbox'
    )!;

    expect(checkbox.checked).toBe(false);

    userEvent.click(checkbox);

    await wait(0);

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

    userEvent.click(checkbox);

    await wait(0);

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

  test('changes the value to filter on and off', async () => {
    const client = createSearchClient({});

    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <ToggleRefinement attribute="free_shipping" on="yes" off="no" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

    const checkbox = container.querySelector<HTMLInputElement>(
      '.ais-ToggleRefinement-checkbox'
    )!;

    userEvent.click(checkbox);

    await wait(0);

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

    userEvent.click(checkbox);

    await wait(0);

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

  test('customizes the class names', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement
          attribute="free_shipping"
          classNames={{
            root: 'ROOT',
            label: 'LABEL',
            checkbox: 'CHECKBOX',
            labelText: 'LABELTEXT',
          }}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement ROOT"
        >
          <label
            class="ais-ToggleRefinement-label LABEL"
          >
            <input
              class="ais-ToggleRefinement-checkbox CHECKBOX"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText LABELTEXT"
            >
              free_shipping
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ToggleRefinement
          attribute="free_shipping"
          className="MyToggleRefinement"
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    const root = container.firstChild;

    expect(root).toHaveClass('MyToggleRefinement');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
