/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSearchBox } from 'react-instantsearch-core';

import { EXPERIMENTAL_Autocomplete } from '../Autocomplete';

import type { SearchResponses } from 'algoliasearch';

describe('Autocomplete', () => {
  function createMockedSearchClient(response: SearchResponses) {
    return createSearchClient({
      // @ts-expect-error - doesn't properly handle multi index, expects all responses to be of the same type
      search: jest.fn(() => Promise.resolve(response)),
    });
  }

  test('should render a searchbox and indices with hits', async () => {
    const searchClient = createMockedSearchClient(
      createMultiSearchResponse(
        createSingleSearchResponse({
          hits: [{ objectID: '1', name: 'Item 1' }],
        }),
        // @ts-expect-error - ignore second response type
        createSingleSearchResponse({
          hits: [{ objectID: '2', query: 'hello' }],
        })
      )
    );
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <EXPERIMENTAL_Autocomplete
          indices={[
            {
              indexName: 'indexName',
              itemComponent: (props) => props.item.name,
            },
            {
              indexName: 'indexName2',
              itemComponent: (props) => props.item.query,
            },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    await screen.findByText('Item 1');

    expect(screen.getByRole('search')).toMatchInlineSnapshot(`
      <form
        action=""
        class="ais-SearchBox-form"
        novalidate=""
        role="search"
      >
        <input
          aria-label="Search"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          class="ais-SearchBox-input"
          maxlength="512"
          placeholder=""
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
            aria-label="Results are loading"
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
    `);

    expect(container.querySelector('.ais-AutocompletePanel'))
      .toMatchInlineSnapshot(`
      <div
        class="ais-AutocompletePanel"
        hidden=""
      >
        <div
          class="ais-AutocompletePanelLayout"
        >
          <div
            class="ais-AutocompleteIndex"
          >
            <ol
              class="ais-AutocompleteIndexList"
            >
              <li
                class="ais-AutocompleteIndexItem"
              >
                Item 1
              </li>
            </ol>
          </div>
          <div
            class="ais-AutocompleteIndex"
          >
            <ol
              class="ais-AutocompleteIndexList"
            >
              <li
                class="ais-AutocompleteIndexItem"
              >
                hello
              </li>
            </ol>
          </div>
        </div>
      </div>
    `);
  });

  test('should render suggestions', async () => {
    const searchClient = createMockedSearchClient(
      createMultiSearchResponse(
        createSingleSearchResponse({
          hits: [
            { objectID: '1', query: 'hello' },
            { objectID: '2', query: 'hi' },
          ],
        })
      )
    );
    const VirtualSearchBox = () => {
      useSearchBox();
      return null;
    };
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <VirtualSearchBox />
        <EXPERIMENTAL_Autocomplete
          showSuggestions={{ indexName: 'query_suggestions' }}
        />
      </InstantSearchTestWrapper>
    );

    await screen.findByText('hello');

    expect(container.querySelector('.ais-AutocompletePanel'))
      .toMatchInlineSnapshot(`
      <div
        class="ais-AutocompletePanel"
        hidden=""
      >
        <div
          class="ais-AutocompletePanelLayout"
        >
          <div
            class="ais-AutocompleteIndex ais-AutocompleteSuggestions"
          >
            <ol
              class="ais-AutocompleteIndexList ais-AutocompleteSuggestionsList"
            >
              <li
                class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
              >
                <div
                  class="ais-AutocompleteSuggestion"
                >
                  hello
                </div>
              </li>
              <li
                class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
              >
                <div
                  class="ais-AutocompleteSuggestion"
                >
                  hi
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    `);

    userEvent.click(screen.getByRole('searchbox'));
    userEvent.click(screen.getByText(/hello/i));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(3);
    });

    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          query: 'hello',
        }),
      },
    ]);
  });
});
