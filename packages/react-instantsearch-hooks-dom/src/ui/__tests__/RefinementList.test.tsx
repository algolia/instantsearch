import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';

import { RefinementList } from '../RefinementList';
import { SearchBox } from '../SearchBox';
import { ShowMoreButton } from '../ShowMoreButton';

import type { RefinementListProps } from '../RefinementList';

describe('RefinementList', () => {
  function createProps(props: Partial<RefinementListProps>) {
    return {
      items: [
        {
          value: 'Insignia™',
          label: 'Insignia™',
          highlighted: 'Insignia™',
          count: 746,
          isRefined: true,
        },
        {
          value: 'Samsung',
          label: 'Samsung',
          highlighted: 'Samsung',
          count: 633,
          isRefined: false,
        },
      ],
      onRefine: jest.fn(),
      query: '',
      searchBox: null,
      showMoreButton: null,
      ...props,
    };
  }

  test('renders with items', () => {
    const props = createProps({});
    const { container } = render(<RefinementList {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item ais-RefinementList-item--selected"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  checked=""
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Insignia™"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Insignia™
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  746
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Samsung"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  633
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('triggers an `onRefine` callback when clicking a checkbox', () => {
    const props = createProps({});
    const { container } = render(<RefinementList {...props} />);

    container
      .querySelectorAll(
        '.ais-RefinementList-checkbox, .ais-RefinementList-label'
      )
      .forEach((checkbox) => {
        userEvent.click(checkbox);
      });

    expect(props.onRefine).toHaveBeenCalledTimes(4);
  });

  test('displays a "Show more" button', () => {
    const props = createProps({
      showMoreButton: <ShowMoreButton isShowingMore={false} />,
    });
    const { container } = render(<RefinementList {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item ais-RefinementList-item--selected"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  checked=""
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Insignia™"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Insignia™
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  746
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Samsung"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  633
                </span>
              </label>
            </li>
          </ul>
          <button>
            Show more
          </button>
        </div>
      </div>
    `);
  });

  test('displays a search box', () => {
    const props = createProps({
      searchBox: (
        <SearchBox
          inputRef={createRef<HTMLInputElement>()}
          placeholder="Search brands"
          isSearchStalled={false}
          value=""
          onChange={jest.fn}
          onReset={jest.fn}
          onSubmit={jest.fn}
        />
      ),
    });
    const { container } = render(<RefinementList {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <div
            class="ais-RefinementList-searchBox"
          >
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
                  placeholder="Search brands"
                  spellcheck="false"
                  type="search"
                  value=""
                />
                <button
                  class="ais-SearchBox-submit"
                  title="Submit the search query."
                  type="submit"
                >
                  <svg
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
                  title="Clear the search query."
                  type="reset"
                >
                  <svg
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
          </div>
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item ais-RefinementList-item--selected"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  checked=""
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Insignia™"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Insignia™
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  746
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Samsung"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  633
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('highlights items when there is a search box and query', () => {
    const props = createProps({
      items: [
        {
          value: 'Insignia™',
          label: 'Insignia™',
          highlighted: 'Insignia™',
          count: 746,
          isRefined: true,
        },
        {
          value: 'Samsung',
          label: 'Samsung',
          highlighted: '<mark>Sam</mark>sung',
          count: 633,
          isRefined: false,
        },
      ],
      searchBox: (
        <SearchBox
          inputRef={createRef<HTMLInputElement>()}
          placeholder="Search brands"
          isSearchStalled={false}
          value="sam"
          onChange={jest.fn}
          onReset={jest.fn}
          onSubmit={jest.fn}
        />
      ),
      query: 'sam',
    });
    const { container } = render(<RefinementList {...props} />);

    expect(container.querySelector('.ais-RefinementList-list'))
      .toMatchInlineSnapshot(`
      <ul
        class="ais-RefinementList-list"
      >
        <li
          class="ais-RefinementList-item ais-RefinementList-item--selected"
        >
          <label
            class="ais-RefinementList-label"
          >
            <input
              checked=""
              class="ais-RefinementList-checkbox"
              type="checkbox"
              value="Insignia™"
            />
            <span
              class="ais-RefinementList-labelText"
            >
              <span
                class="ais-Highlight"
              >
                <span
                  class="ais-Highlight-nonHighlighted"
                >
                  Insignia™
                </span>
              </span>
            </span>
            <span
              class="ais-RefinementList-count"
            >
              746
            </span>
          </label>
        </li>
        <li
          class="ais-RefinementList-item"
        >
          <label
            class="ais-RefinementList-label"
          >
            <input
              class="ais-RefinementList-checkbox"
              type="checkbox"
              value="Samsung"
            />
            <span
              class="ais-RefinementList-labelText"
            >
              <span
                class="ais-Highlight"
              >
                <mark
                  class="ais-Highlight-highlighted"
                >
                  Sam
                </mark>
                <span
                  class="ais-Highlight-nonHighlighted"
                >
                  sung
                </span>
              </span>
            </span>
            <span
              class="ais-RefinementList-count"
            >
              633
            </span>
          </label>
        </li>
      </ul>
    `);
  });

  test('displays a no results fallback', () => {
    const props = createProps({ noResults: 'No results' });
    const { container } = render(<RefinementList {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <div
            class="ais-RefinementList-noResults"
          >
            No results
          </div>
        </div>
      </div>
    `);
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({ className: 'MyRefinementList' });
    const { container } = render(<RefinementList {...props} />);

    expect(container.querySelector('.ais-RefinementList')).toHaveClass(
      'ais-RefinementList MyRefinementList'
    );
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({ title: 'Some custom title' });
    const { container } = render(<RefinementList {...props} />);

    expect(container.querySelector('.ais-RefinementList')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
