import {
  createMultiSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import {
  castToJestMock,
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { skippableDescribe } from '../../common';

import type { SearchBoxWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { InstantSearch, UiState } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  return (
    commonNormalizeSnapshot(html)
      // Preact does not set the value attribute, it only sets the value property on the Element
      .replace(/value=".*?"/g, '')
      // Vue duplicates these attributes names in the attribute value
      .replace(/novalidate="novalidate"/g, 'novalidate=""')
      .replace(/hidden="hidden"/g, 'hidden=""')
      // Vue adds whitespace between some tags
      .replace(/>\s+</g, '><')
      // In CI Vue3 keeps comments
      .replace(/<!-- .*? -->/g, '')
  );
}

export function createOptionsTests(
  setup: SearchBoxWidgetSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-SearchBox')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-SearchBox"
        >
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
        </div>
      `
      );

      expect(screen.getByRole('searchbox')).not.toHaveFocus();
    });

    test('sets `autofocus` on input when `autofocus` option is set', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { autofocus: true },
      });

      await act(async () => {
        await wait(0);
      });

      try {
        // For IS.js and Vue, jsdom does not implement autofocus so we test the attribute
        expect(screen.getByRole('searchbox')).toHaveAttribute('autofocus');
      } catch {
        // For React, it doesn't set the `autofocus` attribute but polyfills it
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByRole('searchbox')).toHaveFocus();
      }
    });

    test('shows a reset button when there is a query', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-SearchBox-reset')).not.toBeVisible();

      await act(async () => {
        userEvent.type(screen.getByRole('searchbox'), 'iPhone');

        await wait(0);
      });

      expect(document.querySelector('.ais-SearchBox-reset')).toBeVisible();
    });

    test('shows a loader when search is stalled', async () => {
      let nbSearches = 0;
      const searchClient = createSearchClient({
        search: async () => {
          if (++nbSearches === 2) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          return createMultiSearchResponse();
        },
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          stalledSearchDelay: 0,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-SearchBox-loadingIndicator')
      ).not.toBeVisible();

      await act(async () => {
        userEvent.type(screen.getByRole('searchbox'), 'a');

        await wait(0);
      });

      expect(
        document.querySelector('.ais-SearchBox-loadingIndicator')
      ).toBeVisible();

      await act(async () => {
        await wait(100);
      });

      expect(
        document.querySelector('.ais-SearchBox-loadingIndicator')
      ).not.toBeVisible();
    });

    test('forwards `placeholder` prop', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { placeholder: 'Search here' },
      });

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('searchbox')).toHaveAttribute(
        'placeholder',
        'Search here'
      );
    });

    test('refines query when typing by default', async () => {
      let state: UiState = {};
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            state = uiState;
            setUiState(uiState);
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), 'iPhone');

      expect(state.indexName.query).toBe('iPhone');
      expect(screen.getByRole('searchbox')).toHaveValue('iPhone');
    });

    test('refines query only when composition is complete', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      // Typing 木 using the Wubihua input method
      // see:
      // - https://en.wikipedia.org/wiki/Stroke_count_method
      // - https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event
      const character = '木';
      const strokes = ['一', '丨', '丿', '丶', character];

      await act(async () => {
        await wait(0);
        castToJestMock(searchClient.search).mockClear();

        strokes.forEach((stroke, index) => {
          const isFirst = index === 0;
          const isLast = index === strokes.length - 1;
          const query = isLast ? stroke : strokes.slice(0, index + 1).join('');

          if (isFirst) {
            fireEvent.compositionStart(screen.getByRole('searchbox'));
          }

          fireEvent.compositionUpdate(screen.getByRole('searchbox'), {
            data: query,
          });

          fireEvent.input(screen.getByRole('searchbox'), {
            isComposing: true,
            target: {
              value: query,
            },
          });

          if (isLast) {
            fireEvent.compositionEnd(screen.getByRole('searchbox'), {
              data: query,
              target: {
                value: query,
              },
            });
          }
        });
      });

      expect(screen.getByRole('searchbox')).toHaveValue(character);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              query: character,
            }),
          }),
        ])
      );
    });

    test('resets query when clicking on reset button', async () => {
      let state: UiState = {};
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            state = uiState;
            setUiState(uiState);
          },
          initialUiState: {
            indexName: {
              query: 'something',
            },
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('searchbox')).toHaveValue('something');

      userEvent.click(
        screen.getByRole('button', {
          name: /clear the search query/i,
        })
      );

      await act(async () => {
        await wait(0);
      });

      expect(state.indexName.query).not.toBeDefined();
      expect(screen.getByRole('searchbox')).toHaveValue('');
    });

    test('does not update input value when query is updated externally and on focus', async () => {
      let localUiState: UiState = {};
      let localSetUiState: InstantSearch['setUiState'];
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            localSetUiState = setUiState;
            localUiState = uiState;
            setUiState(uiState);
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), 'i');
      expect(localUiState.indexName.query).toBe('i');

      act(() => {
        localSetUiState({
          indexName: {
            query: 'iPhone',
          },
        });
      });

      expect(screen.getByRole('searchbox')).toHaveValue('i');

      await act(async () => {
        userEvent.tab();

        await wait(0);
      });

      expect(screen.getByRole('searchbox')).toHaveValue('iPhone');
    });
  });

  skippableDescribe('searchAsYouType option', skippedTests, () => {
    test('does not refine query on type when `searchAsYouType` is false', async () => {
      let state: UiState = {};
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            state = uiState;
            setUiState(uiState);
          },
        },
        widgetParams: { searchAsYouType: false },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), 'iPhone');

      expect(state.indexName?.query).not.toBeDefined();
      expect(screen.getByRole('searchbox')).toHaveValue('iPhone');
    });

    test('refines when hitting the Enter key when `searchAsYouType` is false', async () => {
      let state: UiState = {};
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            state = uiState;
            setUiState(uiState);
          },
        },
        widgetParams: { searchAsYouType: false },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), 'iPhone');

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), '{enter}');

      expect(state.indexName.query).toBe('iPhone');
    });

    test('refines when clicking on the submit button', async () => {
      let state: UiState = {};
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          onStateChange: ({ uiState, setUiState }) => {
            state = uiState;
            setUiState(uiState);
          },
        },
        widgetParams: { searchAsYouType: false },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.type(screen.getByRole('searchbox'), 'iPhone');

      await act(async () => {
        await wait(0);
      });

      userEvent.click(
        screen.getByRole('button', {
          name: /submit the search query/i,
        })
      );

      expect(state.indexName.query).toBe('iPhone');
    });
  });
}
