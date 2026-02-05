/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import searchBox from '../search-box';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('searchBox', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        // @ts-expect-error
        searchBox({});
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/search-box/js/"
      `);
    });

    test('add custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        searchBox({
          container,
          cssClasses: {
            root: 'ROOT',
            form: 'FORM',
            input: 'INPUT',
            loadingIcon: 'LOADING_ICON',
            loadingIndicator: 'LOADING_INDICATOR',
            reset: 'RESET',
            resetIcon: 'RESET_ICON',
            submit: 'SUBMIT',
            submitIcon: 'SUBMIT_ICON',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.firstChild).toHaveClass('ROOT');
      expect(container.querySelector('.ais-SearchBox-form')).toHaveClass(
        'FORM'
      );
      expect(container.querySelector('.ais-SearchBox-input')).toHaveClass(
        'INPUT'
      );
      expect(container.querySelector('.ais-SearchBox-loadingIcon')).toHaveClass(
        'LOADING_ICON'
      );
      expect(
        container.querySelector('.ais-SearchBox-loadingIndicator')
      ).toHaveClass('LOADING_INDICATOR');
      expect(container.querySelector('.ais-SearchBox-resetIcon')).toHaveClass(
        'RESET_ICON'
      );
      expect(container.querySelector('.ais-SearchBox-submit')).toHaveClass(
        'SUBMIT'
      );
      expect(container.querySelector('.ais-SearchBox-submitIcon')).toHaveClass(
        'SUBMIT_ICON'
      );
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([searchBox({ container })]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
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
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({
          container,
          templates: {
            submit({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.submitIcon}">Submit</span>`;
            },
            reset({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.resetIcon}">Reset</span>`;
            },
            loadingIndicator({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.loadingIcon}">Wait…</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
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
                <span
                  class="ais-SearchBox-submitIcon"
                >
                  Submit
                </span>
              </button>
              <button
                class="ais-SearchBox-reset"
                hidden=""
                title="Clear the search query"
                type="reset"
              >
                <span
                  class="ais-SearchBox-resetIcon"
                >
                  Reset
                </span>
              </button>
              <span
                class="ais-SearchBox-loadingIndicator"
                hidden=""
              >
                <span
                  class="ais-SearchBox-loadingIcon"
                >
                  Wait…
                </span>
              </span>
            </form>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({
          container,
          templates: {
            submit({ cssClasses }) {
              return <span className={cssClasses.submitIcon}>Submit</span>;
            },
            reset({ cssClasses }) {
              return <span className={cssClasses.resetIcon}>Reset</span>;
            },
            loadingIndicator({ cssClasses }) {
              return <span className={cssClasses.loadingIcon}>Wait…</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
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
                <span
                  class="ais-SearchBox-submitIcon"
                >
                  Submit
                </span>
              </button>
              <button
                class="ais-SearchBox-reset"
                hidden=""
                title="Clear the search query"
                type="reset"
              >
                <span
                  class="ais-SearchBox-resetIcon"
                >
                  Reset
                </span>
              </button>
              <span
                class="ais-SearchBox-loadingIndicator"
                hidden=""
              >
                <span
                  class="ais-SearchBox-loadingIcon"
                >
                  Wait…
                </span>
              </span>
            </form>
          </div>
        </div>
      `);
    });
  });
});
