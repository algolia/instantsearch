/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Suspense } from 'react';
import { searchBox, hits } from 'instantsearch.js/es/widgets';

import { SearchBox } from '../SearchBox';
import { Hits } from '../Hits';

import type { InstantSearch, UiState } from 'instantsearch.js';
import {
  InstantSearch as InstantSearchWidget,
  InstantSearchServerComponentsSSRProvider,
} from 'react-instantsearch-core';
import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import instantsearch from 'instantsearch.js';

const searchClient = createAlgoliaSearchClient({});
const searchClient2 = createAlgoliaSearchClient({});

describe('SearchBox', () => {
  test.only('renders with a reference', async () => {
    const queryHook = (query, search) => {
      search(query);
    };

    const search = instantsearch({ searchClient, indexName: 'indexName' });

    search.addWidgets([
      searchBox({
        container: document.createElement('div'),
        queryHook,
      }),
      hits({
        container: document.createElement('div'),
      }),
    ]);

    await act(async () => {
      render(await <InstantSearchServerComponentsSSRProvider search={search}>
          <InstantSearchWidget
            searchClient={searchClient2}
            indexName="indexName"
          >
            <SearchBox queryHook={queryHook} />
            <Hits />
          </InstantSearchWidget>
        </InstantSearchServerComponentsSSRProvider>
      );
    });

    // const { container } = render(Result);

    // await waitFor(() => {
    //   expect(searchClient.search).toHaveBeenCalledTimes(1);
    //   expect(searchClient2.search).not.toHaveBeenCalled();

    //   expect(container.querySelector('.ais-SearchBox')).toMatchInlineSnapshot();
    // });
  });

  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SearchBox />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-SearchBox')).toMatchInlineSnapshot(`
        <div
          class="ais-SearchBox"
        >
          <form
            action=""
            class="ais-SearchBox-form"
            novalidate=""
          >
            <input
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              class="ais-SearchBox-input"
              maxlength="512"
              spellcheck="false"
              type="search"
              value=""
            />
            <button
              class="ais-SearchBox-submit"
              title="Submit the search query"
              type="submit"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-submitIcon"
                height="10"
                viewBox="0 0 40 40"
                width="10"
              >
                <path
                  d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
                />
              </svg>
            </button>
            <button
              class="ais-SearchBox-reset"
              hidden=""
              title="Clear the search query"
              type="reset"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-resetIcon"
                height="10"
                viewBox="0 0 20 20"
                width="10"
              >
                <path
                  d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
                />
              </svg>
            </button>
            <span
              class="ais-SearchBox-loadingIndicator"
              hidden=""
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-loadingIcon"
                height="16"
                stroke="#444"
                viewBox="0 0 38 38"
                width="16"
              >
                <g
                  fill="none"
                  fill-rule="evenodd"
                >
                  <g
                    stroke-width="2"
                    transform="translate(1 1)"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="18"
                      stroke-opacity=".5"
                    />
                    <path
                      d="M36 18c0-9.94-8.06-18-18-18"
                    >
                      <animatetransform
                        attributeName="transform"
                        dur="1s"
                        from="0 18 18"
                        repeatCount="indefinite"
                        to="360 18 18"
                        type="rotate"
                      />
                    </path>
                  </g>
                </g>
              </svg>
            </span>
          </form>
        </div>
      `);
    });

    expect(within(container).getByRole('searchbox')).not.toHaveFocus();
  });

  test('forwards placeholder prop', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SearchBox placeholder="Placeholder" />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(container.querySelector('.ais-SearchBox-input')).toHaveAttribute(
        'placeholder',
        'Placeholder'
      );
    });
  });

  test('forwards `autoFocus` prop', async () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SearchBox autoFocus />
      </InstantSearchTestWrapper>
    );

    await waitFor(() => {
      expect(within(container).getByRole('searchbox')).toHaveFocus();
    });
  });

  test('sets query on change event', async () => {
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        initialUiState={{
          indexName: {
            query: 'something',
          },
        }}
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();

    await waitFor(() => {
      expect(input).toHaveValue('something');
    });

    ' else'.split('').forEach((letter) => {
      act(() => {
        userEvent.type(input, letter);
      });
    });

    await waitFor(() => {
      expect(lastUiState.indexName.query).toEqual('something else');
      expect(input).toHaveValue('something else');
    });
  });

  test('resets query on reset event', async () => {
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        initialUiState={{
          indexName: {
            query: 'something',
          },
        }}
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox />
      </InstantSearchTestWrapper>
    );

    const resetButton = container.querySelector<HTMLButtonElement>(
      '.ais-SearchBox-reset'
    )!;
    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;

    await waitFor(() => {
      expect(input.value).toEqual('something');
    });

    act(() => {
      userEvent.click(resetButton);
    });

    await waitFor(() => {
      expect(lastUiState.indexName.query).toEqual(undefined);
    });
  });

  test('restore InstantSearch query when out of sync on input is blurred', async () => {
    let localSetUiState: InstantSearch['setUiState'];

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ setUiState }) => {
          localSetUiState = setUiState;
        }}
      >
        <SearchBox />
      </InstantSearchTestWrapper>
    );
    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();

    act(() => {
      // Trigger a change to get the `setUiState` reference
      userEvent.type(input, 'q');
    });

    act(() => {
      input.blur();
      localSetUiState({ indexName: { query: 'new query' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('new query');
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <SearchBox
          className="MySearchBox"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MySearchBox', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('does not refine query on type when searchAsYouType is false', () => {
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox searchAsYouType={false} />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();

    userEvent.type(input, 'iPhone');

    expect(input).toHaveValue('iPhone');
    expect(lastUiState.indexName?.query).toBe(undefined);
  });

  test('refines on submit when searchAsYouType is false, even if custom onSubmit is provided', () => {
    const onSubmit = jest.fn();
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox searchAsYouType={false} onSubmit={onSubmit} />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();

    userEvent.type(input, 'iPhone{Enter}');

    expect(lastUiState.indexName.query).toBe('iPhone');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('refines on reset when searchAsYouType is set', () => {
    let lastUiState: UiState = {};

    const { container } = render(
      <InstantSearchTestWrapper
        onStateChange={({ uiState }) => {
          lastUiState = uiState;
        }}
      >
        <SearchBox searchAsYouType={false} />
      </InstantSearchTestWrapper>
    );

    const input = container.querySelector<HTMLInputElement>(
      '.ais-SearchBox-input'
    )!;
    input.focus();
    userEvent.type(input, 'iPhone{Enter}');
    expect(lastUiState.indexName.query).toBe('iPhone');

    const resetButton = container.querySelector<HTMLButtonElement>(
      '.ais-SearchBox-reset'
    )!;
    userEvent.click(resetButton);
    expect(lastUiState.indexName.query).toBe(undefined);
  });

  test('renders with translations', () => {
    const { getByRole } = render(
      <InstantSearchTestWrapper>
        <SearchBox
          translations={{
            resetButtonTitle: 'Reset',
            submitButtonTitle: 'Submit',
          }}
        />
      </InstantSearchTestWrapper>
    );

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    userEvent.type(getByRole('searchbox'), 'nothing');

    expect(getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
